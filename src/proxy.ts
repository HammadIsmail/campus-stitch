import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, JWT_COOKIE_NAME } from "@/lib/jwt";

// Routes that require an authenticated user with a valid JWT
const PROTECTED_ROUTES = [
  "/profile",
  "/verify",
  "/commute/offer",
  "/market/sell",
  "/hostel/offer",
  "/community/create",
];

// Routes that require admin authorization
const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires admin authorization
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // Check if route requires standard student authentication
  const isProtectedRoute =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) || isAdminRoute;

  // Retrieve JWT from HTTP-only cookie or Authorization header
  const token =
    request.cookies.get(JWT_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")?.trim();

  // If route is protected, verify token
  if (isProtectedRoute) {
    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const payload = await verifyJwtToken(token);

    if (!payload) {
      // Invalid or expired JWT token
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(signInUrl);
      // Clear invalid cookie
      response.cookies.delete(JWT_COOKIE_NAME);
      return response;
    }

    // Role-based authorization check for admin routes
    if (isAdminRoute && payload.role !== "admin") {
      // Regular student attempting to access admin panel -> redirect to home with notice
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin_access_required");
      return NextResponse.redirect(homeUrl);
    }

    // Add user info into request headers for downstream server components / route handlers
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

  // If already authenticated and visits sign-in or sign-up, redirect to profile
  if (pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/login") {
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api routes that don't need proxy interception
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
