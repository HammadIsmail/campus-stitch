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

    // Branch 1: List a new bike for rent
    if (body.model || !body.bikeId) {
      const {
        model,
        dailyRate,
        daily_rate,
        depositAmount = 500,
        deposit_amount,
        condition = "Good",
        location = "Campus Hostel",
        rules = "Return before 10 PM.",
        ownerName,
        owner_name,
        campusId,
        campus_id,
        imageUrl,
        image_url,
      } = body;

      const effectiveRate = dailyRate ?? daily_rate;
      if (!model || effectiveRate === undefined) {
        return NextResponse.json(
          { success: false, error: "Bike model and daily rental rate are required" },
          { status: 400 }
        );
      }

      const newBike = {
        model: String(model).trim(),
        daily_rate: Number(effectiveRate),
        deposit_amount: Number(depositAmount ?? deposit_amount ?? 500),
        condition: String(condition),
        location: String(location).trim(),
        rules: String(rules).trim(),
        owner_name: String(ownerName ?? owner_name ?? req.headers.get("x-user-name") ?? "Student").trim(),
        owner_verified: true,
        campus_id: campusId ?? campus_id ?? req.headers.get("x-user-campus-id") ?? null,
        image_url: imageUrl ?? image_url ?? null,
        is_available: true,
        created_at: new Date().toISOString(),
      };

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("bikes")
        .insert([newBike])
        .select()
        .single();

      if (error) {
        console.error("DB insert bike error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, bike: data });
    }

    // Branch 2: Book / rent an existing bike
    const { bikeId, renterName, renterId, durationHours } = body;

    const supabase = await createClient();
    await supabase
      .from("bikes")
      .update({ is_available: false })
      .eq("id", bikeId);

    const { data: rentalData, error: rentalError } = await supabase
      .from("bike_rentals")
      .insert([
        {
          bike_id: bikeId,
          renter_name: renterName || req.headers.get("x-user-name") || "Student",
          renter_id: renterId || null,
          duration_hours: durationHours || 4,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (rentalError) {
      console.warn("Bike rental DB notice:", rentalError);
    }

    return NextResponse.json({
      success: true,
      rental: rentalData,
      message: "Bike rental request confirmed with owner!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process bike operation" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bikeId, isAvailable, model, dailyRate, rules, location, condition, imageUrl } = body;

    if (!bikeId) {
      return NextResponse.json(
        { success: false, error: "Bike ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (isAvailable !== undefined) updates.is_available = isAvailable;
    if (model !== undefined) updates.model = String(model).trim();
    if (dailyRate !== undefined) updates.daily_rate = Number(dailyRate);
    if (rules !== undefined) updates.rules = String(rules).trim();
    if (location !== undefined) updates.location = String(location).trim();
    if (condition !== undefined) updates.condition = condition;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bikes")
      .update(updates)
      .eq("id", bikeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bike: data,
      message: "Bike updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bike" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Bike ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("bikes").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Bike listing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete bike" },
      { status: 500 }
    );
  }
}
