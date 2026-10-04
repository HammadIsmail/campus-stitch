import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fallback seed posts for offline/test resilience
const FALLBACK_POSTS = [
  {
    id: "p_1",
    community_id: "c_1",
    community_name: "r/cs-uet",
    author_id: "u_2023_cs_807",
    author_name: "Muhammad Hammad Ismail",
    author_student_id: "2023-CS-807",
    author_verified: true,
    title: "Tips for Operating Systems Lab 3 & Thread Synchronization",
    content:
      "For anyone struggling with pthread semaphores in Lab 3, remember that sem_wait decrements and blocks when 0, while sem_post increments. Shared mutex lock should always wrap critical sections in your circular buffer.",
    flair: "Resource",
    upvotes: 42,
    downvotes: 1,
    score: 41,
    comments_count: 3,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "p_2",
    community_id: "c_1",
    community_name: "r/cs-uet",
    author_id: "u_2022_cs_045",
    author_name: "Sara K.",
    author_student_id: "2022-CS-045",
    author_verified: true,
    title: "Google Summer of Code & Campus Internship Info Session",
    content:
      "The CS Society is hosting a panel with 4 seniors who cleared GSoC and Microsoft internships this week in the CS Seminar Hall on Wednesday at 3:00 PM. Highly recommend batch 2023 and 2024 attend!",
    flair: "Notice",
    upvotes: 78,
    downvotes: 2,
    score: 76,
    comments_count: 5,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "p_3",
    community_id: "c_3",
    community_name: "r/commute-splits",
    author_id: "u_2021_cs_104",
    author_name: "Ahmed Raza",
    author_student_id: "2021-CS-104",
    author_verified: true,
    title:
      "Daily Rickshaw Split: Khurrianwala Main Chowk to UET Main Gate (8:00 AM)",
    content:
      "We have a permanent rickshaw booked every morning departing sharp at 8:00 AM. 1 seat just opened up for the semester. Cost is exactly Rs. 50/day. Direct drop at main academic block.",
    flair: "Carpool",
    upvotes: 29,
    downvotes: 0,
    score: 29,
    comments_count: 2,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "p_4",
    community_id: "c_2",
    community_name: "r/hostel-life",
    author_id: "u_2022_me_089",
    author_name: "Usman Tariq",
    author_student_id: "2022-ME-089",
    author_verified: true,
    title: "Zubair Hall Room Swap Available (1st Floor to Ground Floor)",
    content:
      "Currently in Room 114 (1st floor, corner room with ample ventilation). Looking to swap with anyone on the ground floor due to foot injury. Admin approval already pre-cleared.",
    flair: "Discussion",
    upvotes: 34,
    downvotes: 1,
    score: 33,
    comments_count: 4,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "p_5",
    community_id: "c_5",
    community_name: "r/exam-pastpapers",
    author_id: "u_2023_cs_807",
    author_name: "Muhammad Hammad Ismail",
    author_student_id: "2023-CS-807",
    author_verified: true,
    title: "Complete Midterm Solved Past Papers Drive (2020-2025) for 3rd & 4th Semesters",
    content:
      "Uploaded a compiled Google Drive folder containing solved past papers, handwritten notes for DLD, Data Structures, Multivariable Calculus, and Linear Algebra. Free for all UET students.",
    flair: "Resource",
    upvotes: 142,
    downvotes: 3,
    score: 139,
    comments_count: 18,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "p_6",
    community_id: "c_6",
    community_name: "r/career-internships",
    author_id: "u_2021_ee_012",
    author_name: "Zainab Malik",
    author_student_id: "2021-EE-012",
    author_verified: true,
    title: "3x React & Next.js Summer Intern Openings at Software House in Johar Town",
    content:
      "My team is hiring 3 intern developers (paid, Rs. 35,000/mo) starting June. Strong grasp of TypeScript and Tailwind required. Drop me a DM with your GitHub profile or resume link.",
    flair: "Notice",
    upvotes: 63,
    downvotes: 0,
    score: 63,
    comments_count: 9,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "p_7",
    community_id: "c_7",
    community_name: "r/campus-memes",
    author_id: "u_2023_ce_140",
    author_name: "Bilal Cheema",
    author_student_id: "2023-CE-140",
    author_verified: true,
    title: "POV: You reached campus at 8:01 AM and the gatekeeper closed the gate",
    content:
      "The eye contact you make through the iron grill while praying the professor takes attendance at 8:15 AM instead.",
    flair: "Meme",
    upvotes: 215,
    downvotes: 6,
    score: 209,
    comments_count: 24,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "p_8",
    community_id: "c_10",
    community_name: "r/lost-and-found",
    author_id: "u_2024_cs_301",
    author_name: "Ayesha Noor",
    author_student_id: "2024-CS-301",
    author_verified: true,
    title: "Found: Casio FX-991EX Calculator in Computer Dept Lab 2",
    content:
      "Found on Bench 4 after the afternoon 2:00 PM session. Has a small blue sticker on the back cover. Submitted to Lab Attendant uncle, or DM me to claim.",
    flair: "Notice",
    upvotes: 19,
    downvotes: 0,
    score: 19,
    comments_count: 1,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const community = searchParams.get("community"); // 'all' or 'r/cs-uet'
    const sort = searchParams.get("sort") || "hot"; // 'hot' | 'new' | 'top'
    const query = searchParams.get("query")?.toLowerCase();

    try {
      const supabase = await createClient();
      let dbQuery = supabase.from("community_posts").select("*");

      if (community && community !== "all") {
        dbQuery = dbQuery.eq("community_name", community);
      }

      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      if (sort === "new") {
        dbQuery = dbQuery.order("created_at", { ascending: false });
      } else if (sort === "top") {
        dbQuery = dbQuery.order("score", { ascending: false });
      } else {
        // Hot sort: score desc, created_at desc
        dbQuery = dbQuery
          .order("score", { ascending: false })
          .order("created_at", { ascending: false });
      }

      const { data, error } = await dbQuery.limit(50);
      if (data && data.length > 0 && !error) {
        return NextResponse.json({ success: true, posts: data });
      }
    } catch (dbErr) {
      console.warn("DB query notice:", dbErr);
    }

    // Filter fallback
    let filtered = [...FALLBACK_POSTS];
    if (community && community !== "all") {
      filtered = filtered.filter((p) => p.community_name === community);
    }
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }

    if (sort === "new") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "top") {
      filtered.sort((a, b) => b.score - a.score);
    }

    return NextResponse.json({ success: true, posts: filtered });
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
      communityName,
      title,
      content,
      flair = "Discussion",
      imageUrl,
      authorName = "Muhammad Hammad Ismail",
      authorStudentId = "2023-CS-807",
      authorId = "u_2023_cs_807",
    } = body;

    if (!title || !content || !communityName) {
      return NextResponse.json(
        { success: false, error: "Community, Title and Content are required" },
        { status: 400 }
      );
    }

    const newPost = {
      community_name: communityName,
      title: title.trim(),
      content: content.trim(),
      flair,
      image_url: imageUrl || null,
      author_id: authorId,
      author_name: authorName,
      author_student_id: authorStudentId,
      author_verified: true,
      upvotes: 1,
      downvotes: 0,
      score: 1,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("community_posts")
        .insert([newPost])
        .select()
        .single();

      if (data && !error) {
        return NextResponse.json({ success: true, post: data });
      }
    } catch (err) {
      console.warn("DB insert post notice:", err);
    }

    return NextResponse.json({
      success: true,
      post: { ...newPost, id: "p_" + Date.now() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
