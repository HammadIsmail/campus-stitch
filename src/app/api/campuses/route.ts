import { NextRequest, NextResponse } from "next/server";
import { TenantsStore } from "@/lib/tenants-store";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const universityId = searchParams.get("universityId") || undefined;
    const campuses = TenantsStore.getCampuses(universityId);

    return NextResponse.json({
      success: true,
      count: campuses.length,
      campuses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch campuses" },
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
        { success: false, message: "Super Admin privileges required to add a campus" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { universityId, name, city } = body;

    if (!universityId || !name || !city) {
      return NextResponse.json(
        { success: false, message: "University ID, campus name, and city are required" },
        { status: 400 }
      );
    }

    const newCampus = TenantsStore.addCampus(universityId, { name, city });

    if (!newCampus) {
      return NextResponse.json(
        { success: false, message: "Specified university not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Campus ${newCampus.name} created successfully!`,
      campus: newCampus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create campus" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { campusId, isActive } = body;

    if (!campusId || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "campusId and boolean isActive required" },
        { status: 400 }
      );
    }

    const ok = TenantsStore.toggleCampusActive(campusId, isActive);

    return NextResponse.json({
      success: ok,
      message: ok ? `Campus status updated` : "Campus not found",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update campus" },
      { status: 500 }
    );
  }
}
