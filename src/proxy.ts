import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, JWT_COOKIE_NAME } from "@/lib/jwt";

// Public routes that unauthenticated users can access
const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/login",
  "/api/auth",
  "/auth",
  "/api/upload",
];

// Routes that require admin role authorization
const ADMIN_PREFIXES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path is a public auth route
  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?")
  );

  // Retrieve JWT from HTTP-only cookie or Authorization header
  const token =
    request.cookies.get(JWT_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")?.trim();

  // If path is public:
  if (isPublicRoute) {
    // If user is already authenticated with a valid JWT and visits login/signup, redirect to home
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // ALL OTHER ROUTES REQUIRE AUTHENTICATION
  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    if (pathname !== "/") {
      signInUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  const payload = await verifyJwtToken(token);

  if (!payload) {
    // Invalid or expired JWT token -> redirect to sign-in and clear cookie
    const signInUrl = new URL("/sign-in", request.url);
    if (pathname !== "/") {
      signInUrl.searchParams.set("redirect", pathname);
    }
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete(JWT_COOKIE_NAME);
    return response;
  }

  // Role-based authorization check for admin routes
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAdminRoute && payload.role !== "admin") {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("error", "admin_access_required");
    return NextResponse.redirect(homeUrl);
  }

  // Inject verified student claims into request headers for downstream components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-name", payload.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public static images / icons
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
