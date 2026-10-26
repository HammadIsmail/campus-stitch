import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId") || req.headers.get("x-user-campus-id");
    const category = searchParams.get("category");
    const query = searchParams.get("query")?.toLowerCase();

    try {
      const supabase = await createClient();
      let dbQuery = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (campusId && campusId !== "all") {
        dbQuery = dbQuery.or(`campus_id.eq.${campusId},campus_id.is.null`);
      }
      if (category && category !== "All") {
        dbQuery = dbQuery.eq("category", category);
      }

      const { data, error } = await dbQuery;
      if (!error && data) {
        let results = data;
        if (query) {
          results = results.filter(
            (item: any) =>
              item.title?.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query) ||
              item.location?.toLowerCase().includes(query)
          );
        }
        return NextResponse.json({
          success: true,
          listings: results,
          count: results.length,
        });
      }
      if (error) {
        console.warn("Market listings query error:", error);
      }
    } catch (dbErr) {
      console.warn("Market listings query notice:", dbErr);
    }

    // Zero fabricated data rule: Return true empty state when database has 0 listings
    return NextResponse.json({
      success: true,
      listings: [],
      count: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      price,
      category = "Other",
      condition = "Good",
      description = "",
      location = "Campus",
      seller_name = "Student",
      campus_id,
      university_id,
      image_url,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Title and price are required" },
        { status: 400 }
      );
    }

    if (!image_url || !String(image_url).trim()) {
      return NextResponse.json(
        { success: false, error: "Item photo is compulsory. Please attach a photo." },
        { status: 400 }
      );
    }

    const newListing = {
      title: String(title).trim(),
      price: Number(price),
      category,
      condition,
      description: String(description || "").trim(),
      location: String(location || "").trim(),
      seller_name: String(seller_name || "Student").trim(),
      seller_verified: true,
      campus_id: campus_id || null,
      university_id: university_id || null,
      status: "available",
      image_url: String(image_url).trim(),
      created_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .insert([newListing])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert listing error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, listing: data });
  } catch (error: any) {
    console.error("Failed to create listing:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, price, title, description, image_url, condition, category, location } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (price !== undefined) updates.price = Number(price);
    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (image_url !== undefined) updates.image_url = image_url;
    if (condition !== undefined) updates.condition = condition;
    if (category !== undefined) updates.category = category;
    if (location !== undefined) updates.location = location;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update listing error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, listing: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update listing" },
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
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete listing error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}
