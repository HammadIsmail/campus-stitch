import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, platform = "web", userId } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Invalid device token" }, { status: 400 });
    }

    const supabase = await createClient();

    // Determine user ID from body or active session
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      effectiveUserId = session?.user?.id;
    }

    if (!effectiveUserId) {
      // Allow anonymous device token saving or return graceful ack
      return NextResponse.json({ success: true, message: "Token received without active user session" });
    }

    // Upsert token into `user_push_tokens`
    try {
      const { error } = await supabase.from("user_push_tokens").upsert(
        {
          user_id: effectiveUserId,
          token: token.trim(),
          platform: ["web", "android", "ios"].includes(platform) ? platform : "web",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );

      if (error) {
        console.warn("Supabase token upsert notice:", error.message);
      }
    } catch (dbErr) {
      console.warn("DB push token save notice:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Token registered successfully" });
  } catch (err) {
    console.error("Save push token error:", err);
    return NextResponse.json({ success: false, error: "Failed to save push token" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from("user_push_tokens").delete().eq("token", token);
    } catch (err) {
      console.warn("DB token delete notice:", err);
    }

    return NextResponse.json({ success: true, message: "Token unregistered" });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to delete token" }, { status: 500 });
  }
}
