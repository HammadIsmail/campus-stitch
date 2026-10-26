import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u_2023_cs_807";

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profile_ratings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0 && !error) {
        const totalReviews = data.length;
        const sum = data.reduce((acc, r) => acc + Number(r.rating || 5), 0);
        const averageRating = Number((sum / totalReviews).toFixed(1));

        const breakdown = {
          5: data.filter((r) => r.rating === 5).length,
          4: data.filter((r) => r.rating === 4).length,
          3: data.filter((r) => r.rating === 3).length,
          2: data.filter((r) => r.rating === 2).length,
          1: data.filter((r) => r.rating === 1).length,
        };

        return NextResponse.json({
          success: true,
          averageRating,
          totalReviews,
          breakdown,
          reviews: data,
        });
      }
    } catch (err) {
      console.warn("DB ratings query notice:", err);
    }

    // Zero fabricated data rule: Return true empty state when database has 0 reviews
    return NextResponse.json({
      success: true,
      averageRating: 0.0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      rating,
      category = "commute",
      comment,
      raterName = "Verified Peer",
      raterStudentId = "2022-CS-012",
      raterId = "u_peer",
    } = body;

    if (!userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Valid userId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    if (userId === raterId) {
      return NextResponse.json(
        { success: false, error: "You cannot review yourself" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check duplicate review
    const { data: existing } = await supabase
      .from("profile_ratings")
      .select("id")
      .eq("user_id", userId)
      .eq("rater_id", raterId)
      .eq("category", category)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this peer for this category" },
        { status: 409 }
      );
    }

    const newRating = {
      user_id: userId,
      rater_id: raterId,
      rater_name: raterName,
      rater_student_id: raterStudentId,
      rating: Number(rating),
      category,
      comment: comment?.trim() || "Positive campus peer experience.",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profile_ratings")
      .insert([newRating])
      .select()
      .single();

    if (error) {
      console.error("DB insert rating error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Calculate new average
    const { data: allRatings } = await supabase
      .from("profile_ratings")
      .select("rating")
      .eq("user_id", userId);

    const count = allRatings ? allRatings.length : 1;
    const avg = allRatings
      ? Number((allRatings.reduce((acc, r) => acc + Number(r.rating), 0) / count).toFixed(1))
      : Number(rating);

    await supabase
      .from("profiles")
      .update({ rating_avg: avg, rating_count: count })
      .eq("id", userId);

    return NextResponse.json({
      success: true,
      review: data,
      averageRating: avg,
      totalReviews: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
