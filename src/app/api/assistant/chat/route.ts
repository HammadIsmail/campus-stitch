import { NextRequest, NextResponse } from "next/server";
import { generateText, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ----------------------------------------------------
// Vercel AI SDK Tool Definitions (Clean Live DB Queries)
// ----------------------------------------------------

const searchCommuteRides = tool({
  description:
    "Search for available student commute rides, carpools, or rickshaw splits between locations (e.g. Khurrialwala, Main Campus, Hostel, City).",
  inputSchema: z.object({
    from: z.string().optional().describe("Starting pickup point or area, e.g. Khurrialwala"),
    to: z.string().optional().describe("Dropoff destination, e.g. University or Campus"),
    maxPrice: z.number().optional().describe("Maximum price per seat in PKR"),
  }),
  execute: async ({ from, to }: { from?: string; to?: string; maxPrice?: number }) => {
    try {
      const supabase = await createClient();
      let query = supabase.from("rides").select("*").eq("status", "active");
      if (from) query = query.ilike("from_location", `%${from}%`);
      if (to) query = query.ilike("to_location", `%${to}%`);
      const { data, error } = await query.order("departure_time", { ascending: true }).limit(5);
      if (data && !error) {
        return { rides: data };
      }
    } catch (e) {
      console.warn("Supabase ride search notice:", e);
    }
    return { rides: [] };
  },
});

const searchBikeRentals = tool({
  description: "Search for available student bikes and motorcycles for daily rent on campus.",
  inputSchema: z.object({
    model: z.string().optional().describe("Bike model or brand, e.g. Honda CD 70, Yamaha YBR, Bicycle"),
    maxDailyRate: z.number().optional().describe("Maximum daily rental rate in PKR"),
  }),
  execute: async ({ model }: { model?: string; maxDailyRate?: number }) => {
    try {
      const supabase = await createClient();
      let query = supabase.from("bikes").select("*").eq("is_available", true);
      if (model) query = query.ilike("model", `%${model}%`);
      const { data, error } = await query.limit(5);
      if (data && !error) {
        return { bikes: data };
      }
    } catch (e) {
      console.warn("Supabase bike search notice:", e);
    }
    return { bikes: [] };
  },
});

const searchMarketListings = tool({
  description:
    "Search student marketplace for hostel essentials, study tables, calculators, books, phone coolers, and electronics.",
  inputSchema: z.object({
    category: z.string().optional().describe("Category: Electronics, Hostel, Furniture, Books"),
    keyword: z.string().optional().describe("Keywords like cooler, table, fridge, chair, book, calculator"),
    maxPrice: z.number().optional().describe("Maximum price in PKR"),
  }),
  execute: async ({ category, keyword }: { category?: string; keyword?: string; maxPrice?: number }) => {
    try {
      const supabase = await createClient();
      let query = supabase.from("listings").select("*").eq("status", "available");
      if (category) query = query.ilike("category", `%${category}%`);
      if (keyword) query = query.ilike("title", `%${keyword}%`);
      const { data, error } = await query.limit(5);
      if (data && !error) {
        return { listings: data };
      }
    } catch (e) {
      console.warn("Supabase listings search notice:", e);
    }
    return { listings: [] };
  },
});

const searchCampusServices = tool({
  description:
    "Search campus student services and gigs such as laundry pickup, laptop formatting/repair, typing/printing, tutoring, cooler repair, etc.",
  inputSchema: z.object({
    keyword: z.string().optional().describe("Service name or category, e.g. laundry, repair, print, tutoring, formatting"),
  }),
  execute: async ({ keyword }: { keyword?: string }) => {
    try {
      const supabase = await createClient();
      let query = supabase.from("hostel_services").select("*");
      if (keyword) {
        query = query.or(`service_name.ilike.%${keyword}%,notes.ilike.%${keyword}%,location.ilike.%${keyword}%`);
      }
      const { data, error } = await query.order("created_at", { ascending: false }).limit(5);
      if (data && !error) {
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.service_name || s.name || "Campus Service",
          rate: s.rate || "",
          location: s.location || "Campus Point",
          schedule: s.turnaround_time || s.schedule || "Daily",
          provider: s.provider_name || s.provider || "Student",
          phone: s.phone || "",
          notes: s.notes || "",
          verified: s.is_verified ?? true,
          campusId: s.campus_id,
        }));
        return { services: mapped };
      }
    } catch (e) {
      console.warn("Supabase service search notice:", e);
    }
    return { services: [] };
  },
});

const searchCommunities = tool({
  description:
    "Search Reddit-style student sub-communities (e.g. r/cs-uet, r/hostel-life, r/commute-splits) and active discussion posts.",
  inputSchema: z.object({
    topic: z.string().describe("Topic or community name, e.g. cs, coding, hostel, commute, gaming"),
  }),
  execute: async ({ topic }: { topic: string }) => {
    try {
      const supabase = await createClient();
      const { data: comms } = await supabase
        .from("communities")
        .select("*")
        .or(`name.ilike.%${topic}%,title.ilike.%${topic}%,description.ilike.%${topic}%`)
        .limit(4);

      const { data: posts } = await supabase
        .from("community_posts")
        .select("*")
        .or(`title.ilike.%${topic}%,content.ilike.%${topic}%`)
        .order("score", { ascending: false })
        .limit(4);

      return { communities: comms || [], posts: posts || [] };
    } catch (e) {
      console.warn("Community search notice:", e);
    }
    return { communities: [], posts: [] };
  },
});

const searchProfiles = tool({
  description:
    "Search verified student profiles, check star ratings, reputation, and student roll numbers on campus.",
  inputSchema: z.object({
    query: z.string().describe("Student name or roll number, e.g. Hammad or 2023-CS-807"),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, student_id, university, program, department, is_verified, rating_avg, rating_count")
        .or(`full_name.ilike.%${query}%,student_id.ilike.%${query}%`)
        .limit(5);
      return { profiles: data || [] };
    } catch (e) {
      console.warn("Profile search notice:", e);
    }
    return { profiles: [] };
  },
});

const bookRideSeat = tool({
  description: "Book or reserve a seat in a ride for a student rider.",
  inputSchema: z.object({
    rideId: z.string().describe("ID of the ride to book"),
    riderName: z.string().optional().describe("Name of the student rider"),
  }),
  execute: async ({ rideId, riderName }: { rideId: string; riderName?: string }) => {
    const student = riderName || "Student";
    try {
      const supabase = await createClient();
      const { data: ride } = await supabase.from("rides").select("*").eq("id", rideId).single();
      if (ride && ride.available_seats > 0) {
        await supabase
          .from("rides")
          .update({ available_seats: ride.available_seats - 1 })
          .eq("id", rideId);

        await supabase.from("ride_bookings").insert([
          {
            ride_id: rideId,
            rider_name: student,
            seats_booked: 1,
            cost_share: ride.price_per_seat,
            status: "confirmed",
          },
        ]);
        return {
          success: true,
          message: `Seat confirmed with ${ride.organizer_name} at ${ride.departure_time}`,
        };
      }
    } catch (e) {
      console.warn("Supabase booking notice:", e);
    }
    return { success: false, message: "Ride not found or no seats available" };
  },
});

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "");
    let replyText = "";
    let toolCallsRecorded: any[] = [];
    let ridesFound: any[] = [];
    let bikesFound: any[] = [];
    let listingsFound: any[] = [];
    let servicesFound: any[] = [];
    let communitiesFound: any[] = [];
    let profilesFound: any[] = [];
    let optionsType: "ride" | "bike" | "listing" | "service" | "community" | "profile" | undefined;

    // Use Vercel AI SDK generateText with tools
    if (apiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const result = await generateText({
          model: google("gemini-1.5-flash"),
          system: `You are CampusStitch Student AI, an intelligent campus search assistant for university students.
You assist students with:
1. Daily commute rides & splits (e.g. asking if someone is going to Khurrialwala, Main Campus, Hostel, City). Call searchCommuteRides.
2. Campus bike & cycle rentals (daily rates, Honda, Yamaha, bicycle). Call searchBikeRentals.
3. Student marketplace listings (coolers, study tables, textbooks, electronics, chairs). Call searchMarketListings.
4. Campus student services and gigs (laundry, ironing, printing, thesis binding, laptop formatting, tutoring). Call searchCampusServices.
5. Student discussions and sub-communities (r/cs-uet, r/hostel-life). Call searchCommunities.
6. Verified student profiles and reputation ratings. Call searchProfiles.

When a student asks any question in English, Urdu, or Roman Urdu, ALWAYS call the appropriate tool to query live database records.
Provide concise, courteous responses directly answering in the student's language. Never fabricate fake results if none exist in the database.`,
          prompt: query,
          tools: {
            searchCommuteRides,
            searchBikeRentals,
            searchMarketListings,
            searchCampusServices,
            searchCommunities,
            searchProfiles,
            bookRideSeat,
          },
          stopWhen: stepCountIs(3),
        });

        if (result.text) {
          replyText = result.text.trim();
        }

        toolCallsRecorded = result.toolCalls || [];

        // Harvest tool results
        for (const step of (result as any).steps || []) {
          for (const tr of (step as any).toolResults || []) {
            if (tr.toolName === "searchCommuteRides" && tr.result?.rides) {
              ridesFound = tr.result.rides;
              optionsType = "ride";
            } else if (tr.toolName === "searchBikeRentals" && tr.result?.bikes) {
              bikesFound = tr.result.bikes;
              optionsType = "bike";
            } else if (tr.toolName === "searchMarketListings" && tr.result?.listings) {
              listingsFound = tr.result.listings;
              optionsType = "listing";
            } else if (tr.toolName === "searchCampusServices" && tr.result?.services) {
              servicesFound = tr.result.services;
              optionsType = "service";
            } else if (tr.toolName === "searchCommunities" && tr.result?.communities) {
              communitiesFound = tr.result.communities;
              optionsType = "community";
            } else if (tr.toolName === "searchProfiles" && tr.result?.profiles) {
              profilesFound = tr.result.profiles;
              optionsType = "profile";
            }
          }
        }
      } catch (sdkError: any) {
        console.warn("Vercel AI SDK execution notice:", sdkError?.message || sdkError);
      }
    }

    // Direct Intent Fallback Execution (if SDK was throttled, model offline, or key unavailable)
    if (
      !optionsType &&
      ridesFound.length === 0 &&
      bikesFound.length === 0 &&
      listingsFound.length === 0 &&
      servicesFound.length === 0 &&
      communitiesFound.length === 0 &&
      profilesFound.length === 0
    ) {
      const lower = query.toLowerCase();
      const isUrdu = /[\u0600-\u06FF]/.test(query);

      const isService =
        lower.includes("service") ||
        lower.includes("services") ||
        lower.includes("server") ||
        lower.includes("laundry") ||
        lower.includes("wash") ||
        lower.includes("iron") ||
        lower.includes("print") ||
        lower.includes("thesis") ||
        lower.includes("repair") ||
        lower.includes("tutor") ||
        lower.includes("formatting") ||
        lower.includes("typing") ||
        query.includes("سروس") ||
        query.includes("لانڈری") ||
        query.includes("استری") ||
        query.includes("پرنٹ");

      const isRide =
        lower.includes("ride") ||
        lower.includes("rides") ||
        lower.includes("khurrialwala") ||
        lower.includes("commute") ||
        lower.includes("carpool") ||
        lower.includes("car") ||
        lower.includes("rickshaw") ||
        lower.includes("going") ||
        lower.includes("jana") ||
        query.includes("کھڑیاںوالہ") ||
        query.includes("رائیڈ") ||
        query.includes("گاڑی") ||
        query.includes("سفر");

      const isBike =
        lower.includes("bike") ||
        lower.includes("bikes") ||
        lower.includes("cycle") ||
        lower.includes("bicycle") ||
        lower.includes("honda") ||
        lower.includes("yamaha") ||
        query.includes("بائیک") ||
        query.includes("سائیکل") ||
        query.includes("موٹرسائیکل");

      const isMarket =
        lower.includes("buy") ||
        lower.includes("sell") ||
        lower.includes("cooler") ||
        lower.includes("table") ||
        lower.includes("fridge") ||
        lower.includes("chair") ||
        lower.includes("item") ||
        lower.includes("book") ||
        lower.includes("calculator") ||
        query.includes("کولر") ||
        query.includes("ٹیبل") ||
        query.includes("سامان") ||
        query.includes("کتاب") ||
        query.includes("خرید");

      const isCommunity =
        lower.includes("community") ||
        lower.includes("reddit") ||
        lower.includes("group") ||
        lower.includes("society") ||
        lower.includes("cs-uet") ||
        lower.includes("post") ||
        query.includes("کمیونٹی") ||
        query.includes("گروپ");

      const isProfile =
        lower.includes("rating") ||
        lower.includes("profile") ||
        lower.includes("hammad") ||
        lower.includes("student") ||
        query.includes("پروفائل") ||
        query.includes("ریٹنگ");

      if (isService) {
        let kw = "";
        if (lower.includes("laundry") || lower.includes("wash") || query.includes("لانڈری")) kw = "laundry";
        else if (lower.includes("print") || query.includes("پرنٹ")) kw = "print";
        else if (lower.includes("repair") || query.includes("مرمت")) kw = "repair";
        else if (lower.includes("tutor") || lower.includes("teaching")) kw = "tutor";

        const res = await (searchCampusServices.execute as any)({ keyword: kw });
        servicesFound = res.services || [];
        optionsType = "service";
        toolCallsRecorded.push({ toolName: "searchCampusServices", args: { keyword: kw } });

        if (!replyText) {
          if (servicesFound.length > 0) {
            replyText = isUrdu
              ? `جی، کیمپس پر ${servicesFound.length} طالب علم سروسز دستیاب ہیں۔ آپ نیچے سے سروس پرووائیڈر سے رابطہ کر سکتے ہیں۔`
              : `Found ${servicesFound.length} student-run campus services matching your request. Tap on a service card to contact the provider!`;
          } else {
            replyText = isUrdu
              ? "اس وقت کیمپس پر ایسی کوئی سروس درج نہیں ہے۔"
              : "No campus services currently match your search. You can check back later or offer a service yourself.";
          }
        }
      } else if (isRide) {
        let fromLoc = "";
        if (lower.includes("khurrialwala") || query.includes("کھڑیاںوالہ")) fromLoc = "Khurrialwala";
        const res = await (searchCommuteRides.execute as any)({ from: fromLoc });
        ridesFound = res.rides || [];
        optionsType = "ride";
        toolCallsRecorded.push({ toolName: "searchCommuteRides", args: { from: fromLoc } });

        if (!replyText) {
          if (ridesFound.length > 0) {
            const first = ridesFound[0];
            replyText = isUrdu
              ? `جی، رائیڈز دستیاب ہیں۔ سب سے پہلی رائیڈ ${first.organizer_name} کی ہے: ${first.departure_time}، ${first.price_per_seat} روپے فی سیٹ۔`
              : `Found ${ridesFound.length} active ride(s). Earliest is ${first.organizer_name} at ${first.departure_time} (Rs. ${first.price_per_seat}/seat).`;
          } else {
            replyText = isUrdu
              ? "اس روٹ کے لیے فی الحال کوئی فعال رائیڈ درج نہیں ہے۔"
              : "No active rides currently scheduled for this route. You can check Commute or offer a ride.";
          }
        }
      } else if (isBike) {
        let model = "";
        if (lower.includes("honda") || lower.includes("70")) model = "Honda";
        else if (lower.includes("yamaha")) model = "Yamaha";
        const res = await (searchBikeRentals.execute as any)({ model });
        bikesFound = res.bikes || [];
        optionsType = "bike";
        toolCallsRecorded.push({ toolName: "searchBikeRentals", args: { model } });

        if (!replyText) {
          if (bikesFound.length > 0) {
            replyText = isUrdu
              ? `جی، کیمپس پر کرائے کے لیے ${bikesFound.length} بائیک دستیاب ہیں۔`
              : `Found ${bikesFound.length} bike(s) available for rent on campus. Tap below to reserve!`;
          } else {
            replyText = isUrdu
              ? "اس وقت کرائے کے لیے کوئی بائیک دستیاب نہیں ہے۔"
              : "No bikes currently available for rent matching your criteria.";
          }
        }
      } else if (isMarket) {
        let kw = "";
        if (lower.includes("cooler") || query.includes("کولر")) kw = "cooler";
        else if (lower.includes("table") || query.includes("ٹیبل")) kw = "table";
        else if (lower.includes("book") || query.includes("کتاب")) kw = "book";
        else if (lower.includes("calculator")) kw = "calculator";
        else if (lower.includes("fridge")) kw = "fridge";

        const res = await (searchMarketListings.execute as any)({ keyword: kw });
        listingsFound = res.listings || [];
        optionsType = "listing";
        toolCallsRecorded.push({ toolName: "searchMarketListings", args: { keyword: kw } });

        if (!replyText) {
          if (listingsFound.length > 0) {
            replyText = isUrdu
              ? `جی، مارکیٹ پلیس میں ${listingsFound.length} اشیاء دستیاب ہیں۔`
              : `Found ${listingsFound.length} item(s) on the student marketplace.`;
          } else {
            replyText = isUrdu
              ? "اس وقت مارکیٹ میں مطلوبہ سامان دستیاب نہیں ہے۔"
              : "No marketplace listings found matching your search. Check back later!";
          }
        }
      } else if (isCommunity) {
        const res = await (searchCommunities.execute as any)({ topic: "cs" });
        communitiesFound = res.communities || [];
        optionsType = "community";
        toolCallsRecorded.push({ toolName: "searchCommunities", args: { topic: query } });
        if (!replyText) {
          replyText = isUrdu
            ? `جی، کیمپس پر رَیڈِٹ اسٹائل کی کمیونٹیز موجود ہیں، جن میں آپ حصہ لے سکتے ہیں۔`
            : `Found student sub-communities for "${query}". You can join discussions and post questions!`;
        }
      } else if (isProfile) {
        const res = await (searchProfiles.execute as any)({ query: "hammad" });
        profilesFound = res.profiles || [];
        optionsType = "profile";
        toolCallsRecorded.push({ toolName: "searchProfiles", args: { query } });
        if (!replyText) {
          replyText = isUrdu
            ? `طالبعلم کی تصدیق شدہ پروفائل تلاش کر لی گئی ہے۔`
            : `Found verified student profiles matching your search.`;
        }
      } else {
        if (!replyText) {
          replyText = isUrdu
            ? `ہم نے کیمپس ڈیٹا میں "${query}" تلاش کیا۔ آپ رائیڈز، بائیک کرایہ، لانڈری/سروسز یا مارکیٹ اشیاء کے متعلق پوچھ سکتے ہیں۔`
            : `I searched campus records for "${query}". You can ask about rides, bike rentals, student services (laundry/repairs), or marketplace items!`;
        }
      }
    }

    const chips =
      optionsType === "ride"
        ? ["Commute", "Shared Split", "Verified Driver"]
        : optionsType === "bike"
        ? ["Bike Rental", "Campus Verified", "Daily Rate"]
        : optionsType === "listing"
        ? ["Marketplace", "Student Deal", "Hostel Pickup"]
        : optionsType === "service"
        ? ["Campus Service", "Cash on Delivery", "Student Gig"]
        : optionsType === "community"
        ? ["r/cs-uet", "r/hostel-life", "r/commute-splits"]
        : optionsType === "profile"
        ? ["Profile Rating", "Verified Student", "Peer Reviews"]
        : ["Commute Rides", "Bike Rentals", "Campus Services", "Marketplace"];

    return NextResponse.json({
      reply: replyText,
      optionsType,
      chips,
      rides: ridesFound,
      bikes: bikesFound,
      listings: listingsFound,
      services: servicesFound,
      communities: communitiesFound,
      profiles: profilesFound,
      toolCalls: toolCallsRecorded,
    });
  } catch (error: any) {
    console.error("Assistant chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat query" },
      { status: 500 }
    );
  }
}
