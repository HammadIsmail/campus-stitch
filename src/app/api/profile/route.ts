import { NextRequest, NextResponse } from "next/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const studentId = searchParams.get("studentId");
    const email = searchParams.get("email");

    const supabase = await createClient();
    
    // Resolve email from query or token
    let cleanEmail = email ? email.trim().toLowerCase() : "";
    if (!cleanEmail) {
      const token = getJwtFromRequest(req);
      if (token) {
        const payload = await verifyJwtToken(token);
        if (payload?.email) {
          cleanEmail = payload.email.trim().toLowerCase();
        }
      }
    }

    let profile: any = null;

    // 1. Try matching by UUID if valid
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (data) profile = data;
    }

    // 2. Try matching by email
    if (!profile && cleanEmail) {
      const { data } = await supabase.from("profiles").select("*").eq("email", cleanEmail).maybeSingle();
      if (data) profile = data;
    }

    // 3. Try matching by student_id or variations (e.g. 2023-CS-807 or u_2023_cs_807)
    if (!profile && (studentId || userId)) {
      const rawTarget = studentId || userId || "";
      const normalizedRoll = rawTarget.replace(/^u_/i, "").replace(/_/g, "-").toUpperCase();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`student_id.eq.${rawTarget},student_id.ilike.${normalizedRoll},student_id.ilike.%${normalizedRoll}%`)
        .maybeSingle();
      if (data) profile = data;
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bio, avatarUrl, fullName, phone, hostelBlock } = body;

    const supabase = await createClient();

    // Determine target record identifier
    let targetId = userId;
    if (!targetId) {
      const token = getJwtFromRequest(req);
      if (token) {
        const payload = await verifyJwtToken(token);
        if (payload) {
          targetId = payload.userId || payload.email;
        }
      }
    }

    const updates: Record<string, any> = {};
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    // Try updating by id (UUID) or email or student_id
    const isUuid =
      targetId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    let updateQuery;
    if (isUuid) {
      updateQuery = supabase.from("profiles").update(updates).eq("id", targetId).select().maybeSingle();
    } else if (targetId && targetId.includes("@")) {
      updateQuery = supabase.from("profiles").update(updates).eq("email", targetId.toLowerCase()).select().maybeSingle();
    } else {
      updateQuery = supabase
        .from("profiles")
        .update(updates)
        .or(`student_id.eq.${targetId},email.ilike.%${targetId}%`)
        .select()
        .maybeSingle();
    }

    const { data: updatedProfile, error } = await updateQuery;

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile || { ...updates, id: targetId },
    });
  } catch (error: any) {
    console.error("Profile update route error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
