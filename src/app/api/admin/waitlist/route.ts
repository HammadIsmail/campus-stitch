import { NextRequest, NextResponse } from "next/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);
    const session = token ? await verifyJwtToken(token) : null;

    if (!session || session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Super Admin privileges required to view waitlist" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from("app_waitlist")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Super Admin waitlist fetch error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count || data?.length || 0,
      waitlist: data || [],
    });
  } catch (err: any) {
    console.error("Super Admin waitlist GET error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve waitlist" },
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Waitlist entry ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("app_waitlist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Waitlist delete error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete waitlist entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Waitlist entry removed successfully",
    });
  } catch (err: any) {
    console.error("Super Admin waitlist DELETE error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete entry" },
      { status: 500 }
    );
  }
}
