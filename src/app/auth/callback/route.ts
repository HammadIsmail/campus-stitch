import { NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/";

  const supabase = await createClient();
  let user = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      user = data.user;
    }
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error && data.user) {
      user = data.user;
    }
  }

  if (user) {
    const email = (user.email || "").toLowerCase();
    const isAdmin =
      email.includes("admin") ||
      email === "admin@uet.edu.pk" ||
      email === "ranahammadismail@gmail.com";

    const userPayload: JwtUserPayload = {
      userId:
        user.id ||
        "u_" + (isAdmin ? "admin" : email.replace(/[^a-z0-9]/g, "_")),
      email,
      name:
        isAdmin
          ? "Admin Moderator"
          : user.user_metadata?.full_name || email.split("@")[0],
      studentId: isAdmin ? "UET-ADMIN-01" : email.split("@")[0].toUpperCase(),
      role: isAdmin ? "admin" : "student",
      program: user.user_metadata?.program || "BS Computer Science",
      isVerified: true,
      hostelBlock: user.user_metadata?.hostel || "Hostel Block A",
    };

    // Generate JWT and set HTTP-only cookie
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.redirect(`${origin}${next}`);
    setJwtCookie(response, token);
    return response;
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
