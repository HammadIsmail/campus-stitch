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

    // Enrich payload with multi-tenant role and campus from TenantsStore and profiles table
    try {
      const { TenantsStore } = await import("@/lib/tenants-store");
      const cleanEmail = payload.email?.toLowerCase();

      // Check Super Admin
      if (
        cleanEmail === "ranahammadismail@gmail.com" ||
        cleanEmail?.includes("superadmin") ||
        cleanEmail === "superadmin@campusstitch.com"
      ) {
        payload.role = "super_admin";
      } else {
        const campusAdminInfo = TenantsStore.getCampusAdminForUser(cleanEmail);
        if (campusAdminInfo) {
          payload.role = "campus_admin";
          payload.campusId = campusAdminInfo.campusId;
          payload.campusName = campusAdminInfo.campusName;
          payload.universityId = campusAdminInfo.universityId;
          payload.universityName = campusAdminInfo.universityName;
        }
      }

      // If campus details missing, provide sensible defaults
      if (!payload.campusId) {
        payload.campusId = "camp_uet_main";
        payload.campusName = "Main Campus (Lahore)";
        payload.universityId = "uni_uet_lahore";
        payload.universityName = "UET Lahore";
      }

      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        
        const profilePromise = supabase
          .from("profiles")
          .select("avatar_url, bio, full_name, is_verified, verification_status, campus_id, campus_name, university_id, university, role")
          .eq("email", cleanEmail)
          .maybeSingle();

        const timeoutPromise = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 1500)
        );

        const { data: profile } = (await Promise.race([profilePromise, timeoutPromise])) as any;

        if (profile) {
          if (profile.avatar_url) payload.avatarUrl = profile.avatar_url;
          if (profile.bio) payload.bio = profile.bio;
          if (profile.full_name) payload.name = profile.full_name;
          payload.isVerified = !!profile.is_verified;
          if (profile.campus_id) payload.campusId = profile.campus_id;
          if (profile.campus_name) payload.campusName = profile.campus_name;
          if (profile.university_id) payload.universityId = profile.university_id;
          if (profile.university) payload.universityName = profile.university;
          if (profile.role && payload.role !== "super_admin") {
            payload.role = profile.role as any;
          }
        }
      } catch {}
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
