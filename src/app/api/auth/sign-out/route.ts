import { NextRequest, NextResponse } from "next/server";
import { clearJwtCookie, JWT_COOKIE_NAME } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

function applySignOutCookies(response: NextResponse, request: NextRequest) {
  clearJwtCookie(response);
  response.cookies.delete(JWT_COOKIE_NAME);
  response.cookies.delete("authjs.session-token");
  response.cookies.delete("__Secure-authjs.session-token");
  response.cookies.delete("authjs.csrf-token");

  // Explicitly invalidate cookies with maxAge: 0 and past expiry
  const cookiesToClear = [
    JWT_COOKIE_NAME,
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Also clear any other auth/supabase cookies from request
  const all = request.cookies.getAll();
  for (const c of all) {
    if (c.name.includes("sb-") || c.name.includes("auth") || c.name.includes("jwt")) {
      response.cookies.delete(c.name);
      response.cookies.set(c.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    applySignOutCookies(response, request);
    return response;
  } catch (error: any) {
    const response = NextResponse.json(
      { success: false, message: error.message || "Sign out failed" },
      { status: 500 },
    );
    applySignOutCookies(response, request);
    return response;
  }
}

export async function GET(request: NextRequest) {
  try {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}
  } catch {}

  const signInUrl = new URL("/sign-in?logout=true", request.url);
  const response = NextResponse.redirect(signInUrl);
  applySignOutCookies(response, request);
  return response;
}
