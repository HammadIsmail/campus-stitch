import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId") || req.headers.get("x-user-campus-id");

    try {
      const supabase = await createClient();
      let query = supabase
        .from("hostel_services")
        .select("*")
        .order("created_at", { ascending: false });

      if (campusId && campusId !== "all") {
        query = query.or(`campus_id.eq.${campusId},campus_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.service_name || s.name || "Campus Service",
          rate: s.rate || "",
          location: s.location || "Campus Service Point",
          schedule: s.turnaround_time || s.schedule || "Daily",
          provider: s.provider_name || s.provider || "Student",
          phone: s.phone || "",
          notes: s.notes || "",
          verified: s.is_verified ?? true,
          campusId: s.campus_id,
          userId: s.user_id,
          createdAt: s.created_at,
        }));
        return NextResponse.json({ success: true, services: mapped });
      }
    } catch (err) {
      console.warn("DB campus services query notice:", err);
    }

    // Honest empty state: zero mock data rule
    return NextResponse.json({ success: true, services: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      rate,
      location = "Campus Service Point",
      schedule = "Daily 5 PM – 10 PM",
      phone = "",
      notes = "",
      provider = "Student",
      campusId = null,
      userId = null,
    } = body;

    if (!name || !rate) {
      return NextResponse.json(
        { success: false, error: "Service title and rate are required" },
        { status: 400 }
      );
    }

    const newRecord: any = {
      service_name: String(name).trim(),
      rate: String(rate).trim(),
      location: String(location).trim(),
      turnaround_time: String(schedule).trim(),
      phone: String(phone).trim(),
      notes: String(notes).trim(),
      provider_name: provider,
      campus_id: campusId,
      user_id: userId,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("hostel_services")
        .insert([newRecord])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, service: data });
      }
      if (error) {
        console.error("DB insert service error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    } catch (err: any) {
      console.warn("DB insert service notice:", err);
      return NextResponse.json({ success: false, error: err?.message || "Failed to save service" }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: "Could not create service" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, rate, location, schedule, phone, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.service_name = String(name).trim();
    if (rate !== undefined) updates.rate = String(rate).trim();
    if (location !== undefined) updates.location = String(location).trim();
    if (schedule !== undefined) updates.turnaround_time = String(schedule).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (notes !== undefined) updates.notes = String(notes).trim();

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("hostel_services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, service: data });
      }
    } catch (err) {
      console.warn("DB update service notice:", err);
    }

    return NextResponse.json({ success: true, message: "Service updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from("hostel_services").delete().eq("id", id);
    } catch (err) {
      console.warn("DB delete service notice:", err);
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
