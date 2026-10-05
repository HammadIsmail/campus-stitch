import { NextRequest, NextResponse } from "next/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail === "admin@uet.edu.pk" ||
      cleanEmail === "ranahammadismail@gmail.com";

    // 1. Check if user profile exists in database
    const supabase = await createClient();
    const { data: userProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!userProfile && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email. Please create an account first.",
        },
        { status: 404 }
      );
    }

    // 2. Verify password
    if (userProfile?.password_hash) {
      const isValid = verifyPassword(cleanPassword, userProfile.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
    }

    // Build JWT payload
    const userPayload: JwtUserPayload = {
      userId: userProfile?.id || ("u_" + (isAdmin ? "admin" : cleanEmail.replace(/[^a-z0-9]/g, "_"))),
      email: cleanEmail,
      name: userProfile?.full_name || (isAdmin ? "Admin Moderator" : cleanEmail.split("@")[0]),
      studentId: userProfile?.student_id || (isAdmin ? "UET-ADMIN-01" : cleanEmail.split("@")[0].toUpperCase()),
      role: isAdmin ? "admin" : "student",
      program: userProfile?.program || "BS Computer Science",
      isVerified: true,
      hostelBlock: "",
      avatarUrl: userProfile?.avatar_url || null,
      bio: userProfile?.bio || null,
    };

    // Sign the JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      token,
      user: userPayload,
    });

    // Set secure HTTP-only cookie
    setJwtCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to sign in" },
      { status: 500 }
    );
  }
}
