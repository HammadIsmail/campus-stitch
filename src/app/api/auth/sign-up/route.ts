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

    const { TenantsStore } = await import("@/lib/tenants-store");

    const isSuperAdmin =
      cleanEmail === "ranahammadismail@gmail.com" ||
      cleanEmail.includes("superadmin") ||
      cleanEmail === "superadmin@campusstitch.com";

    // Resolve university & campus
    let uId = body.universityId;
    let cId = body.campusId;
    let uName = university || "UET Lahore";
    let cName = body.city || "Main Campus (Lahore)";

    if (cId) {
      const campDetails = TenantsStore.getCampus(cId);
      if (campDetails) {
        cName = campDetails.campus.name;
        uId = campDetails.university.id;
        uName = campDetails.university.shortName;
      }
    } else if (uId) {
      const uni = TenantsStore.getUniversity(uId);
      if (uni) {
        uName = uni.shortName;
        if (uni.campuses.length > 0) {
          cId = uni.campuses[0].id;
          cName = uni.campuses[0].name;
        }
      }
    } else {
      uId = "uni_uet_lahore";
      cId = "camp_uet_main";
      uName = "UET Lahore";
      cName = "Main Campus (Lahore)";
    }

    const role: "student" | "campus_admin" | "super_admin" = isSuperAdmin
      ? "super_admin"
      : cleanEmail.includes("admin")
      ? "campus_admin"
      : "student";

    // 3. Hash password if provided
    const passwordHash = password ? hashPassword(password) : null;

    // 4. Generate valid UUID for database primary key
    const profileId = crypto.randomUUID();

    const profileData = {
      id: profileId,
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: cleanName,
      role,
      university: uName,
      university_id: uId,
      campus_id: cId,
      campus_name: cName,
      city: cName,
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

    // 6. Persist profile to Supabase database (with resilient fallback)
    let savedProfile = null;
    try {
      const { data, error: dbErr } = await supabase
        .from("profiles")
        .insert([profileData])
        .select()
        .single();
      if (!dbErr && data) {
        savedProfile = data;
      } else if (dbErr) {
        console.warn("Supabase profile insert notice:", dbErr.message);
      }
    } catch (dbEx: any) {
      console.warn("Supabase connection notice during signup:", dbEx.message);
    }

    const userPayload: JwtUserPayload = {
      userId: savedProfile?.id || profileId,
      email: cleanEmail,
      name: cleanName,
      studentId: cleanStudentId || (isSuperAdmin ? "SUPER-ADMIN" : cleanEmail.split("@")[0].toUpperCase()),
      role,
      universityId: uId,
      universityName: uName,
      campusId: cId,
      campusName: cName,
      program: profileData.program,
      department: profileData.department,
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

