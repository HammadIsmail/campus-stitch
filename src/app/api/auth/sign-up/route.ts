import { NextRequest, NextResponse } from "next/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp-store";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      studentId,
      email,
      password,
      code,
      program,
      university,
      department,
      cnic,
      expiryDate,
      cardPhotoUrl,
      avatarUrl,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStudentId = studentId ? String(studentId).trim().toUpperCase() : null;
    const cleanName = String(name).trim();

    const supabase = await createClient();

    // 1. Strict check: If email already exists, cannot sign up!
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // 2. Strict check: Verify 6-digit email OTP
    if (!code || !String(code).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter the 6-digit verification code sent to your email.",
        },
        { status: 400 }
      );
    }

    const verification = verifyOtp(cleanEmail, String(code).trim());
    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            verification.error ||
            "Incorrect 6-digit verification code. Please check your email and try again.",
        },
        { status: 400 }
      );
    }

    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail === "admin@uet.edu.pk" ||
      cleanEmail === "ranahammadismail@gmail.com";

    // 3. Hash password if provided
    const passwordHash = password ? hashPassword(password) : null;

    // 4. Generate valid UUID for database primary key
    const profileId = crypto.randomUUID();

    const profileData = {
      id: profileId,
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: cleanName,
      university: university || "UET Lahore",
      city: body.city || null,
      program: program || "BS Computer Science",
      department: department || "Computer Science",
      is_verified: false,
      verification_status: "unverified",
      avatar_url: avatarUrl || null,
      card_photo_url: cardPhotoUrl || null,
      cnic: cnic || null,
      expiry_date: expiryDate || null,
      rating_avg: 5.0,
      rating_count: 0,
    };

    // 6. Persist profile to Supabase database
    const { data: savedProfile, error: dbErr } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();

    if (dbErr) {
      console.error("DB profile insert error:", dbErr);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create student account: " + dbErr.message,
        },
        { status: 500 }
      );
    }

    const userPayload: JwtUserPayload = {
      userId: savedProfile?.id || profileId,
      email: cleanEmail,
      name: cleanName,
      studentId: cleanStudentId || cleanEmail.split("@")[0].toUpperCase(),
      role: isAdmin ? "admin" : "student",
      program: profileData.program,
      isVerified: false,
      hostelBlock: "",
      avatarUrl: savedProfile?.avatar_url || profileData.avatar_url || null,
      bio: savedProfile?.bio || null,
    };

    // 7. Sign JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      user: userPayload,
    });

    // 8. Set secure HTTP-only cookie
    setJwtCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}

