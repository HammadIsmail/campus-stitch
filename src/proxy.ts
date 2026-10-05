import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, getJwtFromRequest, JWT_COOKIE_NAME } from "@/lib/jwt";

// Public routes that unauthenticated users can access
const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/login",
  "/forgot-password",
  "/api/auth",
  "/auth",
  "/api/upload",
];

// Routes that require admin role authorization
const ADMIN_PREFIXES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve JWT from HTTP-only cookie or Authorization header
  const token = getJwtFromRequest(request);

  // 1. Handle API Routes: Never redirect API requests to HTML pages!
  if (pathname.startsWith("/api/")) {
    // Public API endpoints (auth, upload, departments, universities)
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/departments") ||
      pathname.startsWith("/api/universities")
    ) {
      return NextResponse.next();
    }

    // Protected API endpoints require token
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    if (pathname.startsWith("/api/admin") && payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-name", payload.name);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 2. Handle Public Auth Pages (/sign-in, /sign-up, /login, /forgot-password)
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth");

  if (isAuthPage) {
    // If logout parameter is present, clear cookie and allow viewing sign-in
    if (request.nextUrl.searchParams.has("logout")) {
      const response = NextResponse.next();
      response.cookies.delete(JWT_COOKIE_NAME);
      response.cookies.set(JWT_COOKIE_NAME, "", { path: "/", maxAge: 0 });
      return response;
    }

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
