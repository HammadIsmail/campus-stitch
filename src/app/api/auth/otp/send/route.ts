import { NextRequest, NextResponse } from "next/server";
import { generateOtp, saveOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate random secure 6-digit code
    const otp = generateOtp();
    saveOtp(cleanEmail, otp);

    // Send the email via Nodemailer Gmail SMTP
    await sendOtpEmail(cleanEmail, otp);

    return NextResponse.json({
      success: true,
      message: `6-digit verification code sent to ${cleanEmail}`,
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send verification code. Check SMTP settings.",
      },
      { status: 500 },
    );
  }
}
