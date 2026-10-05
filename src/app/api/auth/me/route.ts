import { NextRequest, NextResponse } from "next/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "No authentication token provided" },
        { status: 401 },
      );
    }

    const payload = await verifyJwtToken(token);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Attempt to enrich payload with latest avatar_url and bio from profiles table
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const cleanEmail = payload.email?.toLowerCase();
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, bio, full_name, student_id")
        .or(`email.eq.${cleanEmail},student_id.eq.${payload.studentId}`)
        .maybeSingle();

      if (profile) {
        if (profile.avatar_url) payload.avatarUrl = profile.avatar_url;
        if (profile.bio) payload.bio = profile.bio;
        if (profile.full_name) payload.name = profile.full_name;
      }
    } catch {}

    return NextResponse.json({
      authenticated: true,
      user: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, message: "Authentication verification failed" },
      { status: 500 },
    );
  }
}
