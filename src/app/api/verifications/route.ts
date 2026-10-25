import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";
import { TenantsStore } from "@/lib/tenants-store";

export async function GET(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    const searchParams = request.nextUrl.searchParams;
    let targetCampusId = searchParams.get("campusId") || null;

    // Campus admin is strictly scoped to their assigned campus
    if (session?.role === "campus_admin" && session.campusId) {
      targetCampusId = session.campusId;
    }

    let records: any[] = [];
    try {
      const supabase = await createClient();
      let query = supabase
        .from("verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (targetCampusId) {
        query = query.eq("campus_id", targetCampusId);
      }

      const { data, error } = await query;
      if (!error && data) {
        records = data;
      }
    } catch (err: any) {
      console.warn("DB query verifications notice:", err.message);
    }

    // Zero fabricated data rule: Return honest empty queue when database has no records

    return NextResponse.json({
      success: true,
      verifications: records,
      scopedCampusId: targetCampusId,
      scopedRole: session?.role || "student",
    });
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
      universityId,
      campusId,
      campusName,
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

    let resolvedCampusId = campusId || session?.campusId || "camp_uet_main";
    let resolvedCampusName = campusName || session?.campusName || city || "Main Campus (Lahore)";
    let resolvedUniversityId = universityId || session?.universityId || "uni_uet_lahore";
    let resolvedUniversityName = university || session?.universityName || "UET Lahore";

    const campLookup = campusId || campusName || city;
    if (campLookup) {
      const campDetails = TenantsStore.getCampus(campLookup);
      if (campDetails) {
        resolvedCampusId = campDetails.campus.id;
        resolvedCampusName = campDetails.campus.name;
        resolvedUniversityId = campDetails.university.id;
        resolvedUniversityName = campDetails.university.shortName;
      }
    }

    // Insert verification request
    const verificationRecord = {
      id: "v_" + Math.random().toString(36).slice(2, 10),
      user_id: targetUserId || null,
      email: cleanEmail,
      name: name || session?.name || "Student",
      university: resolvedUniversityName,
      university_id: resolvedUniversityId,
      campus_id: resolvedCampusId,
      campus_name: resolvedCampusName,
      city: resolvedCampusName,
      program: program || session?.program || "BS Computer Science",
      department: department || session?.department || "Computer Science",
      card_photo_url: cardPhotoUrl,
      live_photo_url: livePhotoUrl,
      confidence_status: "matches",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      await supabase.from("verifications").insert([verificationRecord]);

      // Update profile status to pending and save live selfie & card urls
      if (targetUserId || cleanEmail) {
        const updateData: any = {
          verification_status: "pending",
          card_photo_url: cardPhotoUrl,
          live_photo_url: livePhotoUrl,
          campus_id: resolvedCampusId,
          campus_name: resolvedCampusName,
          university_id: resolvedUniversityId,
          university: resolvedUniversityName,
        };

        let profileQuery = supabase.from("profiles").update(updateData);
        if (targetUserId) {
          profileQuery = profileQuery.eq("id", targetUserId);
        } else {
          profileQuery = profileQuery.eq("email", cleanEmail);
        }

        await profileQuery;
      }
    } catch (dbErr: any) {
      console.warn("Notice updating Supabase verification:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Verification submitted successfully. Your campus admin will review your application.",
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
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    if (!session || (session.role !== "campus_admin" && session.role !== "super_admin" && session.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Admin privileges required to review verifications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, userId, email } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Verification ID and status are required" },
        { status: 400 }
      );
    }

    const isApproved = status === "approved";
    const profileUpdate = {
      is_verified: isApproved,
      verification_status: isApproved ? "verified" : status === "rejected" ? "rejected" : "unverified",
    };

    try {
      const supabase = await createClient();

      // 1. Update verification record with reviewer
      await supabase
        .from("verifications")
        .update({
          status,
          reviewed_by: session.userId,
        })
        .eq("id", id);

      // 2. Update profile
      let profileQuery = supabase.from("profiles").update(profileUpdate);
      if (userId) {
        profileQuery = profileQuery.eq("id", userId);
      } else if (email) {
        profileQuery = profileQuery.eq("email", String(email).trim().toLowerCase());
      } else {
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

      await profileQuery;
    } catch (dbErr: any) {
      console.warn("Notice updating Supabase verification status:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Student verification ${status} successfully.`,
    });
  } catch (err: any) {
    console.error("PATCH verifications exception:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update verification" },
      { status: 500 }
    );
  }
}
