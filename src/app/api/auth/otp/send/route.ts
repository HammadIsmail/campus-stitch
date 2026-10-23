import { NextRequest, NextResponse } from "next/server";
import { generateOtp, saveOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`otp_${clientIp}`, {
      limit: 3,
      windowMs: 2 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many OTP requests. Please wait ${rateLimit.retryAfterSeconds} seconds before requesting another code.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check rate limit per recipient email as well
    const emailRateLimit = checkRateLimit(`otp_email_${cleanEmail}`, {
      limit: 3,
      windowMs: 2 * 60 * 1000,
    });

    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Verification code was recently requested for this email. Please wait ${emailRateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

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
