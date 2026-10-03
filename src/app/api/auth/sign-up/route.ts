import { NextRequest, NextResponse } from "next/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, studentId, email, password, program, hostel } = body;

    if (!email || !name || !studentId) {
      return NextResponse.json(
        { success: false, message: "Name, Student ID, and Email are required" },
        { status: 400 },
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStudentId = String(studentId).trim().toUpperCase();
    const cleanName = String(name).trim();

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
      hostelBlock: hostel || "Hostel Block A",
    };

    // Attempt to persist profile to database
    try {
      const supabase = await createClient();
      await supabase.from("profiles").upsert([
        {
          id: userPayload.userId,
          name: cleanName,
          email: cleanEmail,
          student_id: cleanStudentId,
          program: userPayload.program,
          role: userPayload.role,
          is_verified: true,
        },
      ]);
    } catch (dbErr) {
      console.warn("DB profile upsert notice:", dbErr);
    }

    // Sign the JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      user: userPayload,
    });

    // Set secure HTTP-only cookie
    setJwtCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register" },
      { status: 500 },
    );
  }
}
