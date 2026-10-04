import { NextRequest, NextResponse } from "next/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      studentId,
      email,
      password,
      program,
      university,
      department,
      cnic,
      expiryDate,
      cardPhotoUrl,
      avatarUrl,
    } = body;

    if (!email || !name || !studentId) {
      return NextResponse.json(
        { success: false, message: "Name, Student ID, and Email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStudentId = String(studentId).trim().toUpperCase();
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

    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail === "admin@uet.edu.pk" ||
      cleanEmail === "ranahammadismail@gmail.com";

    const userPayload: JwtUserPayload = {
      userId: "u_" + cleanStudentId.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      email: cleanEmail,
      name: cleanName,
      studentId: cleanStudentId,
      role: isAdmin ? "admin" : "student",
      program: program || "BS Computer Science",
      isVerified: true,
      hostelBlock: "",
    };

    // 2. Hash password if provided
    const passwordHash = password ? hashPassword(password) : null;

    // 3. Persist profile to Supabase database
    try {
      await supabase.from("profiles").upsert([
        {
          id: userPayload.userId,
          email: cleanEmail,
          password_hash: passwordHash,
          full_name: cleanName,
          student_id: cleanStudentId,
          university: university || "UET Lahore",
          program: userPayload.program,
          department: department || "Computer Science",
          is_verified: true,
          verification_status: "verified",
          avatar_url: avatarUrl || null,
          card_photo_url: cardPhotoUrl || null,
          cnic: cnic || null,
          expiry_date: expiryDate || null,
        },
      ]);
    } catch (dbErr) {
      console.warn("DB profile upsert notice:", dbErr);
    }

    // 4. Sign JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      user: userPayload,
    });

    // 5. Set secure HTTP-only cookie
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
