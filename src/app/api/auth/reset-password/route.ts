import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, 6-digit code, and new password are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const cleanPassword = String(newPassword).trim();

    const supabase = await createClient();

    // 1. Check for matching, unused reset code
    const { data: record, error: findErr } = await supabase
      .from("password_resets")
      .select("id, email, code, expires_at, used")
      .eq("email", cleanEmail)
      .eq("code", cleanCode)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!record || findErr) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (new Date(record.expires_at) < now) {
      return NextResponse.json(
        { success: false, message: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Hash the new password
    const newHash = hashPassword(cleanPassword);

    // 3. Update the user profile password_hash
    const { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .update({ password_hash: newHash })
      .eq("email", cleanEmail)
      .select("id, email, full_name")
      .maybeSingle();

    if (!updatedProfile || updateErr) {
      return NextResponse.json(
        { success: false, message: "User account not found to update." },
        { status: 404 }
      );
    }

    // 4. Mark code as used
    await supabase
      .from("password_resets")
      .update({ used: true })
      .eq("id", record.id);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
