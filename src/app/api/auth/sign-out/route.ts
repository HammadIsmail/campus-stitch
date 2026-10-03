import { NextRequest, NextResponse } from "next/server";
import { clearJwtCookie } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    // Clear HTTP-only JWT cookie
    clearJwtCookie(response);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Sign out failed" },
      { status: 500 },
    );
  }
}
