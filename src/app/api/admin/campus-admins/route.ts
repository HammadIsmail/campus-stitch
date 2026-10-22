import { NextRequest, NextResponse } from "next/server";
import { TenantsStore } from "@/lib/tenants-store";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    if (!session || session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Super Admin privileges required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const campusId = searchParams.get("campusId") || undefined;
    const admins = TenantsStore.getCampusAdmins(campusId);

    // Also fetch registered students list so super admin can assign anyone
    let candidates: any[] = [];
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, university, campus_name, role, is_verified")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        candidates = data;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      admins,
      candidates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch campus admins" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    if (!session || session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Super Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, userName, campusId } = body;

    if (!userEmail || !campusId) {
      return NextResponse.json(
        { success: false, message: "User email and campus ID are required" },
        { status: 400 }
      );
    }

    const assignment = TenantsStore.assignCampusAdmin({
      userId: userId || "u_" + userEmail.replace(/[^a-z0-9]/g, "_"),
      userEmail,
      userName: userName || userEmail.split("@")[0],
      campusId,
      assignedBy: session.email,
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Target campus not found" },
        { status: 404 }
      );
    }

    // Try to update profile in database
    try {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({
          role: "campus_admin",
          campus_id: assignment.campusId,
          campus_name: assignment.campusName,
          university_id: assignment.universityId,
          university: assignment.universityName,
        })
        .eq("email", userEmail.trim().toLowerCase());
    } catch {}

    return NextResponse.json({
      success: true,
      message: `User ${assignment.userName} (${assignment.userEmail}) is now Campus Admin for ${assignment.campusName}!`,
      assignment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to assign campus admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    if (!session || session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Super Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIdOrEmail } = body;

    if (!userIdOrEmail) {
      return NextResponse.json(
        { success: false, message: "userIdOrEmail is required" },
        { status: 400 }
      );
    }

    const ok = TenantsStore.revokeCampusAdmin(userIdOrEmail);

    // Update profile in database back to student
    try {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ role: "student" })
        .eq("email", userIdOrEmail.trim().toLowerCase());
    } catch {}

    return NextResponse.json({
      success: ok,
      message: ok
        ? `Campus admin rights revoked for ${userIdOrEmail}`
        : "Campus admin assignment not found",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to revoke campus admin" },
      { status: 500 }
    );
  }
}
