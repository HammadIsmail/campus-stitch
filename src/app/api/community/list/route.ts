import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_COMMUNITIES = [
  {
    id: "c_1",
    name: "r/cs-uet",
    title: "UET Computer Science & Software Devs",
    description:
      "Official hub for UET CS students, coding projects, lab solutions, internships, and tech talks.",
    category: "Academic",
    member_count: 1420,
    rules: [
      "Be respectful and collaborative",
      "No plagiarism or honor-code violations",
      "Tag posts with appropriate flair",
    ],
  },
  {
    id: "c_2",
    name: "r/hostel-life",
    title: "UET Hostels (A, B, Zubair & Girls)",
    description:
      "Hostel life, mess reviews, room swaps, laundry notices, late-night tea spots, and survival tips.",
    category: "Hostel",
    member_count: 890,
    rules: [
      "Keep hostel drama out of general feeds",
      "Verify room availability details",
      "Respect room privacy",
    ],
  },
  {
    id: "c_3",
    name: "r/commute-splits",
    title: "Daily Rides & Rickshaw Splits",
    description:
      "Coordinate daily commute between Khurrialwala, Gulberg, Wapda Town, Johar Town, and UET campus.",
    category: "Commute",
    member_count: 1150,
    rules: [
      "State exact pickup and dropoff points",
      "Always adhere to agreed fuel/cost share",
      "Only verified students",
    ],
  },
  {
    id: "c_4",
    name: "r/uet-admissions",
    title: "Admissions, ECAT & Guidance",
    description:
      "Freshman guidance, department selection, merit lists, documents verification, and campus life FAQs.",
    category: "General",
    member_count: 640,
    rules: [
      "Be helpful to juniors and applicants",
      "Provide authentic UET prospectus information",
      "No fake rumors",
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false });

      if (data && data.length > 0 && !error) {
        return NextResponse.json({ success: true, communities: data });
      }
    } catch (err) {
      console.warn("DB communities query notice:", err);
    }

    return NextResponse.json({
      success: true,
      communities: FALLBACK_COMMUNITIES,
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
    const { name, title, description, category = "General", rules = [] } = body;

    if (!name || !title) {
      return NextResponse.json(
        { success: false, error: "Community name and title are required" },
        { status: 400 }
      );
    }

    const cleanName = name.startsWith("r/") ? name : `r/${name}`;

    const newCommunity = {
      name: cleanName,
      title: title.trim(),
      description: description?.trim() || "",
      category,
      member_count: 1,
      rules:
        rules.length > 0
          ? rules
          : [
              "Be respectful to fellow students",
              "Campus-relevant content only",
              "No spam",
            ],
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("communities")
        .insert([newCommunity])
        .select()
        .single();

      if (data && !error) {
        return NextResponse.json({ success: true, community: data });
      }
    } catch (err) {
      console.warn("DB insert community notice:", err);
    }

    return NextResponse.json({
      success: true,
      community: { ...newCommunity, id: "c_" + Date.now() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
