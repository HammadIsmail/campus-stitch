import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // 1. Verify that user exists in profiles
    const { data: userProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email address.",
        },
        { status: 404 }
      );
    }

    // 2. Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Invalidate old codes and insert new reset record
    await supabase
      .from("password_resets")
      .update({ used: true })
      .eq("email", cleanEmail)
      .eq("used", false);

    const { error: insertErr } = await supabase
      .from("password_resets")
      .insert({
        email: cleanEmail,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertErr) {
      console.error("Password reset record insert error:", insertErr);
    }

    // 4. Send email via Nodemailer
    try {
      await sendPasswordResetEmail(cleanEmail, code);
    } catch (mailErr) {
      console.warn("Mail send notice (code stored in DB):", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
