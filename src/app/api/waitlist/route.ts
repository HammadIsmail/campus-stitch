import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`waitlist_${clientIp}`, {
      limit: 5,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
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
    const { email, university } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUniversity = university && typeof university === "string" ? university.trim() : null;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("app_waitlist")
      .insert([
        {
          email: cleanEmail,
          university: cleanUniversity,
          platform: "android",
          ip_address: clientIp,
        },
      ])
      .select();

    if (error) {
      // 23505 is PostgreSQL unique constraint violation
      if (error.code === "23505" || error.message?.includes("duplicate")) {
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: "You're already on the Play Store early access list! We'll notify you the moment it launches.",
        });
      }

      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { success: false, message: "Could not save your email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered: false,
      message: "You're on the early access list! We'll email you your Google Play Store invite shortly.",
    });
  } catch (err: any) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
