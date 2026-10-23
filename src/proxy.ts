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
  "/api/contact",
  "/home",
  "/download",
  "/terms",
  "/privacy",
  "/safety",
  "/contact",
  "/delete-account",
  "/robots.txt",
  "/sitemap.xml",
];

// Routes that require admin role authorization
const ADMIN_PREFIXES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve JWT from HTTP-only cookie or Authorization header
  const token = getJwtFromRequest(request);

  // 1. Handle API Routes: Never redirect API requests to HTML pages!
  if (pathname.startsWith("/api/")) {
    // Handle CORS preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-campus-id, x-user-university-id, x-user-role, x-user-name, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Public API endpoints (auth, upload, departments, universities, contact)
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/departments") ||
      pathname.startsWith("/api/universities") ||
      pathname.startsWith("/api/contact")
    ) {
      return NextResponse.next();
    }

    // Protected API endpoints require token
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const isSuperAdmin = payload.role === "super_admin";
    const isCampusAdmin = payload.role === "campus_admin" || isSuperAdmin || payload.role === "admin";

    if (pathname.startsWith("/api/admin/super") && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Super Admin access required" },
        {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (pathname.startsWith("/api/admin") && !isCampusAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-name", payload.name);
    if (payload.campusId) requestHeaders.set("x-user-campus-id", payload.campusId);
    if (payload.universityId) requestHeaders.set("x-user-university-id", payload.universityId);

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

    // If user is already authenticated with a valid JWT and visits login/signup, redirect to their role dashboard
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload) {
        if (payload.role === "super_admin") {
          return NextResponse.redirect(new URL("/admin/super", request.url));
        } else if (payload.role === "campus_admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else {
          return NextResponse.redirect(new URL("/commute", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // 3. Handle Public Landing, Legal & Compliance Pages
  const isPublicInfoPage =
    pathname === "/" ||
    pathname === "/home" ||
    pathname === "/download" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/safety" ||
    pathname === "/contact" ||
    pathname === "/delete-account" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/download/") ||
    pathname.startsWith("/terms/") ||
    pathname.startsWith("/privacy/") ||
    pathname.startsWith("/safety/") ||
    pathname.startsWith("/contact/") ||
    pathname.startsWith("/delete-account/");

  if (isPublicInfoPage) {
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

  const isSuperAdmin = payload.role === "super_admin";
  const isCampusAdmin = payload.role === "campus_admin" || isSuperAdmin || payload.role === "admin";

  // Role-based authorization check for admin routes
  if (pathname.startsWith("/admin/super") && !isSuperAdmin) {
    const homeUrl = new URL("/admin", request.url);
    homeUrl.searchParams.set("error", "super_admin_access_required");
    return NextResponse.redirect(homeUrl);
  }

  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAdminRoute && !isCampusAdmin) {
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
  if (payload.campusId) requestHeaders.set("x-user-campus-id", payload.campusId);
  if (payload.universityId) requestHeaders.set("x-user-university-id", payload.universityId);

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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
