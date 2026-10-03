import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = (data.user.email || "").toLowerCase();
      const isAdmin =
        email.includes("admin") ||
        email === "admin@uet.edu.pk" ||
        email === "ranahammadismail@gmail.com";

      const userPayload: JwtUserPayload = {
        userId:
          data.user.id ||
          "u_" + (isAdmin ? "admin" : email.replace(/[^a-z0-9]/g, "_")),
        email,
        name:
          isAdmin
            ? "Admin Moderator"
            : data.user.user_metadata?.full_name || email.split("@")[0],
        studentId: isAdmin ? "UET-ADMIN-01" : email.split("@")[0].toUpperCase(),
        role: isAdmin ? "admin" : "student",
        program: data.user.user_metadata?.program || "BS Computer Science",
        isVerified: true,
        hostelBlock: data.user.user_metadata?.hostel || "Hostel Block A",
      };

      // Generate JWT and set HTTP-only cookie
      const token = await signJwtToken(userPayload, "7d");

      const response = NextResponse.redirect(`${origin}${next}`);
      setJwtCookie(response, token);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
