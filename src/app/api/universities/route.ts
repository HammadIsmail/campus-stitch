import { NextRequest, NextResponse } from "next/server";
import { TenantsStore } from "@/lib/tenants-store";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    
    let list = TenantsStore.getUniversities();

    if (q) {
      list = list.filter((u) => {
        return (
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.campuses.some((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      universities: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch universities" },
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
        { success: false, message: "Super Admin privileges required to add a university" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, shortName, city, province, logoUrl, initialCampuses } = body;

    if (!name || !shortName || !city || !province) {
      return NextResponse.json(
        { success: false, message: "Name, short name, city, and province are required" },
        { status: 400 }
      );
    }

    const newUniversity = TenantsStore.addUniversity({
      name,
      shortName,
      city,
      province,
      logoUrl,
      initialCampuses,
    });

    return NextResponse.json({
      success: true,
      message: `University ${newUniversity.shortName} created successfully!`,
      university: newUniversity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create university" },
      { status: 500 }
    );
  }
}
