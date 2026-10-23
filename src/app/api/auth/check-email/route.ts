import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { exists: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check pre-registered/demo accounts
    const knownEmails = [
      "ranahammadismail@gmail.com",
      "student@uet.edu.pk",
      "admin@uet.edu.pk",
    ];

    if (knownEmails.includes(cleanEmail)) {
      return NextResponse.json({
        exists: true,
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (data && !error) {
        return NextResponse.json({
          exists: true,
          message: "An account with this email already exists. Please sign in instead.",
        });
      }
    } catch (err) {
      console.warn("DB check email notice:", err);
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    return NextResponse.json(
      { exists: false, error: error.message || "Failed to check email" },
      { status: 500 }
    );
  }
}
