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
    const { campusId, name, city, isActive } = body;

    if (!campusId) {
      return NextResponse.json(
        { success: false, message: "campusId is required" },
        { status: 400 }
      );
    }

    let updatedCampus = null;

    if (typeof isActive === "boolean") {
      TenantsStore.toggleCampusActive(campusId, isActive);
    }

    if (name || city) {
      updatedCampus = TenantsStore.updateCampus(campusId, { name, city });
      if (!updatedCampus) {
        return NextResponse.json(
          { success: false, message: "Campus not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: updatedCampus ? `Campus ${updatedCampus.name} updated` : "Campus status updated",
      campus: updatedCampus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update campus" },
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

    const searchParams = request.nextUrl.searchParams;
    let campusId = searchParams.get("campusId") || searchParams.get("id");

    if (!campusId) {
      const body = await request.json().catch(() => ({}));
      campusId = body.campusId || body.id;
    }

    if (!campusId) {
      return NextResponse.json(
        { success: false, message: "campusId is required" },
        { status: 400 }
      );
    }

    const ok = TenantsStore.deleteCampus(campusId);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Campus not found or could not be removed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campus removed successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete campus" },
      { status: 500 }
    );
  }
}
