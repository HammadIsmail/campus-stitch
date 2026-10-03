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
    "Search for available student commute rides, carpools, or rickshaw splits between locations (e.g. Khurrialwala, Main Campus, Hostel).",
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
    model: z.string().optional().describe("Bike model or brand, e.g. Honda CD 70, Yamaha YBR"),
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
    "Search student marketplace for hostel essentials, electronics, study tables, phone coolers, and graduation sales.",
  inputSchema: z.object({
    category: z.string().optional().describe("Category: Electronics, Hostel, Furniture, Books"),
    keyword: z.string().optional().describe("Keywords like cooler, table, fridge, chair"),
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

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";
    let toolCallsRecorded: any[] = [];
    let ridesFound: any[] = [];
    let bikesFound: any[] = [];
    let listingsFound: any[] = [];
    let optionsType: "ride" | "bike" | "listing" | undefined;

    // Use Vercel AI SDK generateText with tools
    if (apiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const result = await generateText({
          model: google("gemini-3.8-flash"),
          system: `You are CampusStitch Student AI, an intelligent campus assistant for Pakistani university students (specifically UET Lahore).
You assist students with:
1. Daily commute rides & splits (especially Khurrialwala to campus).
2. Campus bike rentals (daily rates, Honda, Yamaha).
3. Hostel items and marketplace listings (coolers, study tables, mini fridges).

When a student asks about rides, bikes, or marketplace items, ALWAYS use the provided tools to query active records.
Keep your response concise, polite, and directly answer in the student's language (Urdu if they ask in Urdu/Roman Urdu, English if English).`,
          prompt: query,
          tools: {
            searchCommuteRides,
            searchBikeRentals,
            searchMarketListings,
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
            }
          }
        }
      } catch (sdkError: any) {
        console.warn("Vercel AI SDK execution notice:", sdkError?.message || sdkError);
      }
    }

    // Direct tool fallback execution if model was throttled/unavailable
    if (!optionsType && ridesFound.length === 0 && bikesFound.length === 0 && listingsFound.length === 0) {
      const lower = query.toLowerCase();
      const isUrdu = /[\u0600-\u06FF]/.test(query);

      const isRide =
        lower.includes("ride") ||
        lower.includes("khurrialwala") ||
        lower.includes("commute") ||
        lower.includes("car") ||
        lower.includes("rickshaw") ||
        lower.includes("jana") ||
        query.includes("کھڑیاںوالہ") ||
        query.includes("رائیڈ") ||
        query.includes("گاڑی") ||
        query.includes("سفر");

      const isBike =
        lower.includes("bike") ||
        lower.includes("cycle") ||
        lower.includes("honda") ||
        lower.includes("yamaha") ||
        query.includes("بائیک") ||
        query.includes("موٹرسائیکل");

      const isMarket =
        lower.includes("buy") ||
        lower.includes("sell") ||
        lower.includes("cooler") ||
        lower.includes("table") ||
        lower.includes("fridge") ||
        lower.includes("chair") ||
        query.includes("کولر") ||
        query.includes("ٹیبل") ||
        query.includes("سامان") ||
        query.includes("خرید");

      if (isRide) {
        const res = await (searchCommuteRides.execute as any)({ from: "Khurrialwala" });
        ridesFound = res.rides || [];
        optionsType = "ride";
        toolCallsRecorded.push({ toolName: "searchCommuteRides", args: { from: "Khurrialwala" } });
        if (!replyText) {
          if (ridesFound.length > 0) {
            const first = ridesFound[0];
            replyText = isUrdu
              ? `جی، کھڑیاںوالہ سے رائیڈز دستیاب ہیں۔ سب سے پہلی رائیڈ ${first.organizer_name} کی ہے: ${first.departure_time}، ${first.price_per_seat} روپے فی سیٹ۔`
              : `Found ${ridesFound.length} rides from Khurrialwala. Earliest is ${first.organizer_name} at ${first.departure_time} (Rs. ${first.price_per_seat}/seat).`;
          } else {
            replyText = isUrdu
              ? "کھڑیاںوالہ کے لیے اس وقت کوئی فعال رائیڈ موجود نہیں ہے۔ آپ 'Offer Ride' سے نئی رائیڈ بنا سکتے ہیں۔"
              : "No active rides currently scheduled for this route. You can be the first to offer a ride!";
          }
        }
      } else if (isBike) {
        const res = await (searchBikeRentals.execute as any)({});
        bikesFound = res.bikes || [];
        optionsType = "bike";
        toolCallsRecorded.push({ toolName: "searchBikeRentals", args: {} });
        if (!replyText) {
          if (bikesFound.length > 0) {
            replyText = isUrdu
              ? `جی، کیمپس پر ${bikesFound.length} تصدیق شدہ بائیکس دستیاب ہیں۔`
              : `Found ${bikesFound.length} verified bikes available for rent.`;
          } else {
            replyText = isUrdu
              ? "اس وقت کیمپس پر کوئی بائیک کرایہ کے لیے دستیاب نہیں ہے۔"
              : "No student bikes are currently listed for rent on campus.";
          }
        }
      } else if (isMarket) {
        const res = await (searchMarketListings.execute as any)({});
        listingsFound = res.listings || [];
        optionsType = "listing";
        toolCallsRecorded.push({ toolName: "searchMarketListings", args: {} });
        if (!replyText) {
          if (listingsFound.length > 0) {
            replyText = isUrdu
              ? `جی، مارکیٹ میں ${listingsFound.length} سامان کے اشتہار موجود ہیں۔`
              : `Found ${listingsFound.length} matching items on the student marketplace.`;
          } else {
            replyText = isUrdu
              ? "مارکیٹ میں فی الحال اس حوالے سے کوئی سامان دستیاب نہیں ہے۔ آپ خود اپنا سامان بیچ سکتے ہیں۔"
              : "No marketplace items found matching your query. You can list your item on the Market tab!";
          }
        }
      } else {
        if (!replyText) {
          replyText = isUrdu
            ? `ہم نے "${query}" کے حوالے سے تلاش کیا۔ آپ کیمپس رائیڈ، بائیک کرایہ یا ہاسٹل سامان کے بارے میں پوچھ سکتے ہیں۔`
            : `I searched campus records for "${query}". You can ask about Khurrialwala rides, bike rentals, or hostel essentials.`;
        }
      }
    }

    const chips =
      optionsType === "ride"
        ? ["Commute", "Shared Split", "Verified Student"]
        : optionsType === "bike"
        ? ["Bike", "Campus Verified", "Daily Rent"]
        : optionsType === "listing"
        ? ["Marketplace", "Student Deal", "Hostel Pickup"]
        : ["Commute", "Bikes", "Marketplace"];

    return NextResponse.json({
      reply: replyText,
      optionsType,
      chips,
      rides: ridesFound,
      bikes: bikesFound,
      listings: listingsFound,
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
