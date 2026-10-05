import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch verifications error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, verifications: data || [] });
  } catch (err: any) {
    console.error("GET verifications exception:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    const body = await request.json();
    const {
      name,
      studentId,
      email,
      university,
      city,
      program,
      department,
      cardPhotoUrl,
      livePhotoUrl,
      userId,
    } = body;

    const cleanEmail = (email || session?.email || "").trim().toLowerCase();
    const cleanStudentId = (studentId || session?.studentId || "").trim().toUpperCase();
    const targetUserId = userId || session?.userId;

    if (!cardPhotoUrl) {
      return NextResponse.json(
        { success: false, message: "Student card photo is required" },
        { status: 400 }
      );
    }

    if (!livePhotoUrl) {
      return NextResponse.json(
        { success: false, message: "Live face selfie photo is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert verification request
    const verificationRecord = {
      id: "v_" + Math.random().toString(36).slice(2, 10),
      user_id: targetUserId || null,
      email: cleanEmail,
      name: name || session?.name || "Student",
      university: university || "UET Lahore",
      city: city || null,
      program: program || session?.program || "BS",
      department: department || "Engineering & Technology",
      card_photo_url: cardPhotoUrl,
      live_photo_url: livePhotoUrl,
      confidence_status: "matches",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase
      .from("verifications")
      .insert([verificationRecord]);

    if (insertErr) {
      console.error("Insert verification error:", insertErr);
      return NextResponse.json(
        { success: false, message: "Failed to submit verification: " + insertErr.message },
        { status: 500 }
      );
    }

    // Update profile status to pending and save live selfie & card urls
    if (targetUserId || cleanEmail) {
      const updateData: any = {
        verification_status: "pending",
        card_photo_url: cardPhotoUrl,
        live_photo_url: livePhotoUrl,
      };

      if (city) updateData.city = city;
      if (university) updateData.university = university;

      let profileQuery = supabase.from("profiles").update(updateData);
      if (targetUserId) {
        profileQuery = profileQuery.eq("id", targetUserId);
      } else {
        profileQuery = profileQuery.eq("email", cleanEmail);
      }

      await profileQuery;
    }

    return NextResponse.json({
      success: true,
      message: "Verification submitted successfully. An administrator will review your application.",
      verification: verificationRecord,
    });
  } catch (err: any) {
    console.error("POST verifications exception:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit verification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, userId, studentId, email } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Verification ID and status are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Update verification record
    const { error: updateVerErr } = await supabase
      .from("verifications")
      .update({ status })
      .eq("id", id);

    if (updateVerErr) {
      console.error("Update verifications table error:", updateVerErr);
      return NextResponse.json(
        { success: false, message: updateVerErr.message },
        { status: 500 }
      );
    }

    // 2. Update profile verification status
    const isApproved = status === "approved";
    const profileUpdate = {
      is_verified: isApproved,
      verification_status: isApproved ? "verified" : status === "rejected" ? "rejected" : "unverified",
    };

    let profileQuery = supabase.from("profiles").update(profileUpdate);
    if (userId) {
      profileQuery = profileQuery.eq("id", userId);
    } else if (email) {
      profileQuery = profileQuery.eq("email", String(email).trim().toLowerCase());
    } else {
      // Lookup the verification record to find the user_id or email
      const { data: verRecord } = await supabase
        .from("verifications")
        .select("user_id, email")
        .eq("id", id)
        .maybeSingle();

      if (verRecord?.user_id) {
        profileQuery = profileQuery.eq("id", verRecord.user_id);
      } else if (verRecord?.email) {
        profileQuery = profileQuery.eq("email", verRecord.email);
      }
    }

    const { error: profileErr } = await profileQuery;
    if (profileErr) {
      console.warn("Could not update profile verification status:", profileErr);
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${status} successfully.`,
    });
  } catch (err: any) {
    console.error("PATCH verifications exception:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update verification" },
      { status: 500 }
    );
  }
}
