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
      "Tag posts with appropriate flair (Resource, Question, Discussion)",
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
      "Keep hostel room drama civil",
      "Verify room availability details before agreeing",
      "Respect room privacy and curfew timings",
    ],
  },
  {
    id: "c_3",
    name: "r/commute-splits",
    title: "Daily Rides & Rickshaw Splits",
    description:
      "Coordinate daily commute between Khurrianwala, Gulberg, Wapda Town, Johar Town, and UET campus.",
    category: "Commute",
    member_count: 1150,
    rules: [
      "State exact pickup and dropoff points",
      "Always adhere to agreed fuel/cost share per seat",
      "Only verified students for carpools",
    ],
  },
  {
    id: "c_4",
    name: "r/electrical-eng",
    title: "Electrical, Telecom & Electronics Hub",
    description:
      "Discussions on circuit analysis, MATLAB projects, power engineering, and semester projects.",
    category: "Academic",
    member_count: 980,
    rules: [
      "Share lab schematics responsibly",
      "Tag questions with subject course codes",
      "Help juniors with hardware debugging",
    ],
  },
  {
    id: "c_5",
    name: "r/exam-pastpapers",
    title: "Midterm & Final Exam Archives",
    description:
      "Past papers, professor hints, solved quizzes, and study drives for all engineering departments.",
    category: "Academic",
    member_count: 1850,
    rules: [
      "Verify subject code and session year on files",
      "No unauthorized leakage of live exams",
      "Keep Drive links public for campus students",
    ],
  },
  {
    id: "c_6",
    name: "r/career-internships",
    title: "Junior Jobs, GSoC & Internships",
    description:
      "Referrals, interview experiences, CV reviews, and remote tech job leads for Pakistani students.",
    category: "Careers",
    member_count: 1280,
    rules: [
      "Include company name, stipend, and deadline in listings",
      "No unpaid exploitation roles",
      "Share constructive resume feedback",
    ],
  },
  {
    id: "c_7",
    name: "r/campus-memes",
    title: "UET Memes & Relatable Campus Life",
    description:
      "8:00 AM lectures, GPA struggles, cafeteria chai, and campus culture memes.",
    category: "Campus Life",
    member_count: 2450,
    rules: [
      "Keep banter friendly and lighthearted",
      "No personal attacks or targeted harassment",
      "OC (Original Content) appreciated",
    ],
  },
  {
    id: "c_8",
    name: "r/sports-uet",
    title: "Cricket, Futsal, Gym & Badminton",
    description:
      "Organize evening matches on UET grounds, find gym workout partners, and inter-department sports fixtures.",
    category: "Campus Life",
    member_count: 760,
    rules: [
      "Specify ground location and match timing",
      "Bring your own kit or mention shared equipment",
      "Maintain sportsman spirit",
    ],
  },
  {
    id: "c_9",
    name: "r/acm-uet",
    title: "ACM UET Student Chapter & Hackathons",
    description:
      "Competitive programming, ICPC prep, campus hackathons, and software workshops.",
    category: "Societies",
    member_count: 670,
    rules: [
      "Keep coding challenges clear with test cases",
      "Share hackathon registration deadlines early",
      "Support beginner programmers",
    ],
  },
  {
    id: "c_10",
    name: "r/lost-and-found",
    title: "Campus Lost & Found Bulletin",
    description:
      "Report or recover misplaced student IDs, keys, calculators, bags, and items across campus.",
    category: "General",
    member_count: 530,
    rules: [
      "Hand over found official student cards to Department Admin or post here",
      "Require proof of ownership before returning valuables",
      "Update flair to [RESOLVED] once claimed",
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
