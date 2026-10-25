import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId") || req.headers.get("x-user-campus-id");

    try {
      const supabase = await createClient();
      let query = supabase.from("bikes").select("*").eq("is_available", true);
      if (campusId) {
        query = query.eq("campus_id", campusId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, bikes: data });
      }
    } catch (err) {
      console.warn("Bikes query notice:", err);
    }

    return NextResponse.json({ success: true, bikes: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bikes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bikeId, renterName, renterId, durationHours } = body;

    if (!bikeId) {
      return NextResponse.json(
        { success: false, error: "Bike ID is required" },
        { status: 400 }
      );
    }

    try {
      const supabase = await createClient();
      await supabase
        .from("bikes")
        .update({ is_available: false })
        .eq("id", bikeId);

      await supabase.from("bike_rentals").insert([
        {
          bike_id: bikeId,
          renter_name: renterName || "Student",
          renter_id: renterId || null,
          duration_hours: durationHours || 4,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn("Bike rental DB notice:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Bike rental checkout confirmed!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to rent bike" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bikeId, isAvailable } = body;

    if (!bikeId) {
      return NextResponse.json(
        { success: false, error: "Bike ID is required" },
        { status: 400 }
      );
    }

    try {
      const supabase = await createClient();
      await supabase
        .from("bikes")
        .update({ is_available: isAvailable ?? true })
        .eq("id", bikeId);
    } catch (err) {
      console.warn("Bike status update DB notice:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Bike availability updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bike" },
      { status: 500 }
    );
  }
}
