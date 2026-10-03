import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and 6-digit code are required" },
        { status: 400 },
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Verify OTP
    const verification = verifyOtp(cleanEmail, cleanCode);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.error || "Invalid verification code" },
        { status: 400 },
      );
    }

    // Determine role & credentials
    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail === "admin@uet.edu.pk" ||
      cleanEmail === "ranahammadismail@gmail.com";

    const userPayload: JwtUserPayload = {
      userId: "u_" + (isAdmin ? "admin" : cleanEmail.replace(/[^a-z0-9]/g, "_")),
      email: cleanEmail,
      name: isAdmin ? "Admin Moderator" : cleanEmail.split("@")[0],
      studentId: isAdmin ? "UET-ADMIN-01" : cleanEmail.split("@")[0].toUpperCase(),
      role: isAdmin ? "admin" : "student",
      program: "BS Computer Science",
      isVerified: true,
      hostelBlock: "Hostel Block A",
    };

    // Issue 7-day secure JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Verification successful",
      token,
      user: userPayload,
    });

    // Set HTTP-only secure cookie
    setJwtCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify code" },
      { status: 500 },
    );
  }
}
