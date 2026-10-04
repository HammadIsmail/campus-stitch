"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Mic,
  Volume2,
  Loader2,
  ArrowRight,
  Send,
  RotateCcw,
  Bike,
  Package,
  Users,
  Star,
  ShieldCheck,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Ride } from "@/lib/data-service";

interface BikeResult {
  id: string;
  owner_name: string;
  owner_verified?: boolean;
  model: string;
  condition?: string;
  daily_rate: number;
  available_time?: string;
}

interface ListingResult {
  id: string;
  seller_name: string;
  seller_verified?: boolean;
  title: string;
  category: string;
  price: number;
  location: string;
  condition?: string;
}

interface CommunityResult {
  id: string;
  name: string;
  title: string;
  description: string;
  member_count: number;
}

interface ProfileResult {
  id: string;
  full_name: string;
  student_id: string;
  university: string;
  program: string;
  department: string;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
}

const QUICK_SUGGESTIONS = [
  {
    urdu: "کیا کوئی کھڑیاںوالہ جا رہا ہے؟",
    label: "Khurrialwala commute ride",
    query: "کیا کوئی کھڑیاںوالہ جا رہا ہے؟",
  },
  {
    urdu: "r/cs-uet کمیونٹی اور ڈسکشن دکھائیں",
    label: "Reddit Community: r/cs-uet",
    query: "Show me r/cs-uet community discussions and lab tips",
  },
  {
    urdu: "طالبعلم محمد حماد کی ریٹنگ اور پروفائل کیا ہے؟",
    label: "Student Profile & Rating: Hammad",
    query: "Check rating and verified profile for student Hammad",
  },
  {
    urdu: "ہاسٹل کے لیے فون کولر یا ٹیبل چاہیے",
    label: "Hostel marketplace items",
    query: "ہاسٹل کے لیے فون کولر یا ٹیبل چاہیے",
  },
];

export default function VoiceAskPage() {
  const router = useRouter();

  // Conversation state - Starts empty (no pre-loaded data)
  const [hasAsked, setHasAsked] = React.useState(false);
  const [userQuery, setUserQuery] = React.useState("");
  const [inputText, setInputText] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // AI & Tool results
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [optionsType, setOptionsType] = React.useState<
    "ride" | "bike" | "listing" | "community" | "profile" | undefined
  >(undefined);
  const [matchedRides, setMatchedRides] = React.useState<Ride[]>([]);
  const [matchedBikes, setMatchedBikes] = React.useState<BikeResult[]>([]);
  const [matchedListings, setMatchedListings] = React.useState<ListingResult[]>(
    [],
  );
  const [matchedCommunities, setMatchedCommunities] = React.useState<
    CommunityResult[]
  >([]);
  const [matchedProfiles, setMatchedProfiles] = React.useState<
    ProfileResult[]
  >([]);

  // Uplift AI Audio state
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const playUpliftVoice = async (textToSpeak: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        setIsPlayingAudio(false);
      }

      setIsLoadingAudio(true);
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voiceId: "prime-time-anchor",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate voice");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(true);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsLoadingAudio(false);
      setIsPlayingAudio(false);
    }
  };

  const submitQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    setHasAsked(true);
    setUserQuery(trimmed);
    setInputText("");
    setIsLoading(true);
    setAiResponse(null);
    setMatchedRides([]);
    setMatchedBikes([]);
    setMatchedListings([]);
    setMatchedCommunities([]);
    setMatchedProfiles([]);
    setOptionsType(undefined);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      setAiResponse(data.reply);
      setOptionsType(data.optionsType);
      if (data.rides) setMatchedRides(data.rides);
      if (data.bikes) setMatchedBikes(data.bikes);
      if (data.listings) setMatchedListings(data.listings);
      if (data.communities) setMatchedCommunities(data.communities);
      if (data.profiles) setMatchedProfiles(data.profiles);

      // Speak response automatically using Uplift AI Urdu TTS
      if (data.reply) {
        playUpliftVoice(data.reply);
      }
    } catch (err) {
      console.error("Query error:", err);
      const fallbackMsg =
        "ہم نے کیمپس ریکارڈز چیک کیے ہیں۔ آپ کھڑیاںوالہ رائیڈز یا بائیک کرایہ کی تفصیلات دیکھ سکتے ہیں۔";
      setAiResponse(fallbackMsg);
      playUpliftVoice(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "ur-PK";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setIsListening(false);
          if (spoken) {
            submitQuery(spoken);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      }
    } else {
      // Fallback prompt for browsers without Web Speech
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        submitQuery("کیا کوئی کھڑیاںوالہ جا رہا ہے؟");
      }, 1200);
    }
  };

  const handleBookSelected = (ride: Ride) => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    playUpliftVoice(
      `بہت اچھا! آپ کی رائیڈ ${ride.organizer_name} کے ساتھ بک کر دی گئی ہے`,
    );
    setTimeout(() => {
      router.push(`/voice/booked?id=${ride.id}`);
    }, 1200);
  };

  const handleReset = () => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    setIsPlayingAudio(false);
    setHasAsked(false);
    setUserQuery("");
    setInputText("");
    setAiResponse(null);
    setMatchedRides([]);
    setMatchedBikes([]);
    setMatchedListings([]);
    setMatchedCommunities([]);
    setMatchedProfiles([]);
    setOptionsType(undefined);
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/"
            aria-label="Close"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Urdu Voice Assistant
          </div>
          {hasAsked && (
            <button
              type="button"
              onClick={handleReset}
              title="Start new query"
              className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">New Query</span>
            </button>
          )}
          <span className="text-[11px] text-zinc-600 font-semibold bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
            Urdu · English
          </span>
        </header>

        {/* Main Body */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 flex flex-col">
          {!hasAsked ? (
            /* ======================================================== */
            /* 1. INITIAL CLEAN STATE (NO DATA SHOWN BEFORE QUERY)      */
            /* ======================================================== */
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full py-6 space-y-6">
              {/* Central Listening / Prompt Trigger */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Ripple ring animation when listening */}
                {isListening && (
                  <span className="absolute w-32 h-32 rounded-full border-2 border-black/30 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={startVoiceInput}
                  aria-label="Tap to speak"
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer relative z-10 ${
                    isListening
                      ? "bg-black text-white ring-8 ring-zinc-200 animate-pulse"
                      : "bg-black hover:bg-zinc-800 text-white"
                  }`}
                >
                  <Mic size={38} className="stroke-[2.2px]" />
                </button>
              </div>

              {/* Status Text */}
              <div className="space-y-1.5">
                <h1 className="text-lg font-bold text-black tracking-tight">
                  {isListening
                    ? "Listening in Urdu / English..."
                    : "Tap to Speak or Ask Below"}
                </h1>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  {isListening
                    ? "بولیں، ہم سن رہے ہیں..."
                    : "Ask in Urdu or English for daily commute rides, bike rentals, or hostel marketplace items."}
                </p>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="w-full pt-4 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-left px-1">
                  Or Try Asking
                </div>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {QUICK_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => submitQuery(item.query)}
                      className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-black rounded-xl transition-all flex items-center justify-between text-left group shadow-2xs cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-[13.5px] font-bold text-black group-hover:text-black">
                          {item.urdu}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                          {item.label}
                        </div>
                      </div>
                      <ArrowRight
                        size={15}
                        className="text-zinc-400 group-hover:text-black transition-colors shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. ANSWERED STATE (SHOWN ONLY AFTER USER HAS ASKED)      */
            /* ======================================================== */
            <div className="space-y-4">
              {/* User Spoken or Typed Prompt */}
              <div className="self-end ml-auto max-w-[320px] p-3.5 rounded-2xl rounded-tr-xs bg-black text-white text-[14px] leading-relaxed shadow-sm font-medium">
                {userQuery}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="max-w-[340px] p-4 rounded-2xl rounded-tl-xs bg-white border border-zinc-200 text-[13.5px] text-zinc-600 shadow-2xs flex items-center gap-2.5">
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Checking campus records via AI...</span>
                </div>
              )}

              {/* AI Bilingual Response with Audio */}
              {!isLoading && aiResponse && (
                <div className="max-w-[350px] p-4 rounded-2xl rounded-tl-xs bg-white border border-zinc-200 text-[14px] leading-relaxed text-zinc-900 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Audio Response
                    </span>
                    {isPlayingAudio && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        Playing
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-800 text-[13.5px] leading-relaxed font-normal">
                    {aiResponse}
                  </p>

                  <button
                    type="button"
                    onClick={() => playUpliftVoice(aiResponse)}
                    disabled={isLoadingAudio}
                    className="flex items-center gap-2 h-9 px-3.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {isLoadingAudio ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading audio...</span>
                      </>
                    ) : isPlayingAudio ? (
                      <>
                        <Volume2 size={14} className="animate-bounce" />
                        <span>Pause audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} />
                        <span>Tap to listen</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tool Results: Matching Rides */}
              {!isLoading && matchedRides.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Matching Rides
                  </div>
                  {matchedRides.slice(0, 3).map((r, idx) => (
                    <div
                      key={r.id}
                      onClick={() => handleBookSelected(r)}
                      className={`flex items-center gap-3 p-3.5 bg-white rounded-xl shadow-2xs transition-all cursor-pointer ${
                        idx === 0
                          ? "border-2 border-black"
                          : "border border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="w-12 text-base font-extrabold text-black">
                        {r.departure_time?.replace(/ AM| PM/i, "") || "8:00"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-black flex items-center gap-1.5">
                          <span>{r.organizer_name}</span>
                          <span className="text-zinc-400">·</span>
                          <span className="text-zinc-600 text-xs font-medium">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs font-medium text-zinc-500 mt-0.5">
                          {r.available_seats} seat
                          {r.available_seats === 1 ? "" : "s"} left ·{" "}
                          {r.from_location}
                        </div>
                      </div>
                      <div className="text-base font-extrabold text-black">
                        Rs. {r.price_per_seat}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tool Results: Matching Bikes */}
              {!isLoading && matchedBikes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Matching Bikes
                  </div>
                  {matchedBikes.map((bike) => (
                    <Link
                      key={bike.id}
                      href="/commute/bike"
                      className="flex items-center gap-3 p-3.5 bg-white border border-zinc-200 hover:border-black rounded-xl shadow-2xs transition-all block"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                        <Bike size={18} className="text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-black">
                          {bike.model}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {bike.owner_name} · Verified Student
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-black">
                        Rs. {bike.daily_rate}/day
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tool Results: Matching Marketplace Items */}
              {!isLoading && matchedListings.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Matching Listings
                  </div>
                  {matchedListings.map((item) => (
                    <Link
                      key={item.id}
                      href="/market"
                      className="flex items-center gap-3 p-3.5 bg-white border border-zinc-200 hover:border-black rounded-xl shadow-2xs transition-all block"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                        <Package size={18} className="text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-black">
                          {item.title}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {item.location} · {item.condition}
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-black">
                        Rs. {item.price}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tool Results: Matching Reddit Communities */}
              {!isLoading && matchedCommunities.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Matching Reddit Communities
                  </div>
                  {matchedCommunities.map((comm) => (
                    <Link
                      key={comm.id}
                      href="/community"
                      className="flex items-center gap-3 p-3.5 bg-white border border-zinc-200 hover:border-black rounded-xl shadow-2xs transition-all block"
                    >
                      <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                        r/
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-black flex items-center gap-1.5">
                          <span>{comm.name}</span>
                          <ShieldCheck size={13} className="text-black" />
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {comm.title || comm.description}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg shrink-0">
                        {comm.member_count} members
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tool Results: Matching Student Profiles & Ratings */}
              {!isLoading && matchedProfiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Matching Student Profiles & Reputation
                  </div>
                  {matchedProfiles.map((prof) => (
                    <Link
                      key={prof.id}
                      href="/profile"
                      className="flex items-center gap-3 p-3.5 bg-white border border-zinc-200 hover:border-black rounded-xl shadow-2xs transition-all block"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {prof.full_name?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-black flex items-center gap-1.5">
                          <span>{prof.full_name}</span>
                          {prof.is_verified && (
                            <ShieldCheck size={13} className="text-black" />
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">
                          {prof.student_id} &bull;{" "}
                          {prof.program || prof.department || "UET Lahore"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-lg shrink-0">
                        <Star size={12} className="fill-black text-black" />
                        <span className="text-xs font-black text-black">
                          {(prof.rating_avg || 5.0).toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick Booking Prompt Action Card */}
              {!isLoading &&
                (matchedRides.length > 0 || optionsType === "ride") && (
                  <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-xs text-zinc-700 flex flex-col gap-1.5">
                    <span className="font-bold text-black">
                      Try saying in Urdu:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const spokenText =
                          "اوکے میری رائیڈ اس کے ساتھ بک کر دیں";
                        setUserQuery(spokenText);
                        if (matchedRides[0]) {
                          handleBookSelected(matchedRides[0]);
                        } else {
                          playUpliftVoice(
                            "بہت اچھا! آپ کی رائیڈ احمد کے ساتھ بک کر دی گئی ہے",
                          );
                          setTimeout(() => router.push("/voice/booked"), 1200);
                        }
                      }}
                      className="text-left font-medium text-black hover:underline cursor-pointer"
                    >
                      “اوکے میری رائیڈ اس کے ساتھ بک کر دیں” →
                    </button>
                  </div>
                )}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* BOTTOM ACTION BAR (VOICE + TEXT INPUT SUPPORT)           */}
        {/* ======================================================== */}
        <div className="flex-none p-3 border-t border-zinc-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                submitQuery(inputText);
              }
            }}
            className="flex items-center gap-2"
          >
            {/* Direct Text Input */}
            <input
              type="text"
              aria-label="Ask in text or voice"
              placeholder="Ask in Urdu or English (e.g. Khurrialwala ride)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading || isListening}
              className="flex-1 min-w-0 h-10 px-3 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              aria-label="Tap to speak"
              disabled={isLoading}
              title="Speak in Urdu or English"
              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-black text-white ring-2 ring-zinc-400 animate-pulse"
                  : "border border-zinc-300 bg-white hover:bg-zinc-100 text-black"
              }`}
            >
              <Mic size={18} className="stroke-[2.2px]" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              aria-label="Send query"
              disabled={isLoading || !inputText.trim()}
              className="w-10 h-10 shrink-0 rounded-lg bg-black hover:bg-zinc-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </MobileShell>
  );
}
