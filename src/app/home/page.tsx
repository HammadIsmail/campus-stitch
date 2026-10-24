"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Tag,
  Building2,
  Users,
  ShieldCheck,
  Smartphone,
  Globe,
  ArrowRight,
  Download,
  Mic,
  Car,
  BookOpen,
  Home as HomeIcon,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronRight,
  Star,
  ExternalLink,
  QrCode,
  X,
  FileText,
  Shield,
  Layers,
  Award,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function LandingHomePage() {
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);
  const [showMobilePrompt, setShowMobilePrompt] = React.useState(false);
  const [showDownloadModal, setShowDownloadModal] = React.useState(false);
  const [selectedFeatureTab, setSelectedFeatureTab] = React.useState<
    "commute" | "market" | "hostel" | "community" | "kyc" | "voice"
  >("commute");

  // Detect mobile device on client mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isMobileUA =
          /android|avantgo|blackberry|iemobile|ipad|iphone|ipod|opera mini|palmos|webos|mobile/i.test(
            userAgent
          );
        const isSmallScreen = window.innerWidth < 768;
        const mobile = isMobileUA || isSmallScreen;
        setIsMobileDevice(mobile);

        // Check if user has already dismissed or selected a preference this session
        const hasChosen = sessionStorage.getItem("campus_stitch_mobile_choice");
        if (mobile && !hasChosen) {
          setShowMobilePrompt(true);
        }
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const handleChooseBrowseWeb = () => {
    setShowMobilePrompt(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("campus_stitch_mobile_choice", "web");
    }
  };

  const handleChooseDownloadApp = () => {
    setShowMobilePrompt(false);
    setShowDownloadModal(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("campus_stitch_mobile_choice", "app");
    }
  };

  const features = [
    {
      id: "commute" as const,
      name: "Campus Commute",
      tagline: "Student-Verified Carpooling & Fuel Sharing",
      icon: Car,
      color: "from-blue-500/20 to-indigo-500/10",
      description:
        "Connect with batchmates and professors traveling on your daily route. Split rising petrol costs, ensure passenger safety with 100% verified campus IDs, and coordinate pickup spots inside campus gates.",
      highlights: [
        "Peer-to-peer fuel cost sharing (zero commission)",
        "Verified student & faculty drivers only",
        "Gender-preferential carpooling options for female students",
        "Real-time seat reservations & pickup coordination",
      ],
      previewBadge: "100+ Daily Campus Rides",
      stat: "Save up to PKR 15,000/month",
    },
    {
      id: "market" as const,
      name: "Textbook & Gear Market",
      tagline: "Peer-to-Peer Student Marketplace with 0% Fees",
      icon: Tag,
      color: "from-purple-500/20 to-pink-500/10",
      description:
        "Buy and sell engineering drafters, medical lab coats, scientific calculators, course textbooks, and semester notes directly with students from your department. Safe handoffs inside university libraries and cafeterias.",
      highlights: [
        "100% verified peer buyers and sellers",
        "Safe in-campus meeting zone guidelines",
        "Filter specifically by degree program and semester",
        "Zero broker commissions or transaction fees",
      ],
      previewBadge: "500+ Active Semester Listings",
      stat: "Save 60% on Course Books",
    },
    {
      id: "hostel" as const,
      name: "Hostel & Roommate Finder",
      tagline: "Verified Accommodations Near Your Campus",
      icon: Building2,
      color: "from-emerald-500/20 to-teal-500/10",
      description:
        "Searching for affordable private hostels or batchmate flatmates? Discover verified rooms near campus gates, inspect amenities (Wi-Fi, generator, mess), and connect with students before signing tenancy contracts.",
      highlights: [
        "Verified student-only roommate listings",
        "Proximity tags (walking distance to campus gates)",
        "Direct peer contact without intermediary agent fees",
        "Genuine reviews from current student boarders",
      ],
      previewBadge: "No Estate Agent Fees",
      stat: "Find Flatmates in 48 Hours",
    },
    {
      id: "community" as const,
      name: "Campus Community Hub",
      tagline: "Reddit-Style University Feeds & Society Notices",
      icon: Users,
      color: "from-amber-500/20 to-orange-500/10",
      description:
        "Stay in sync with everything happening across your campus. Course reviews, past paper tips, lost & found items, university society announcements, and student discussions isolated to your university tenant.",
      highlights: [
        "Strict campus tenant isolation (no outsider spam)",
        "Upvoting, downvoting, and flair categories",
        "Campus admin moderation for anti-harassment",
        "Urgent lost & found and campus alerts",
      ],
      previewBadge: "Real-Time Campus Pulse",
      stat: "10,000+ Monthly Discussions",
    },
    {
      id: "kyc" as const,
      name: "Verified Student Identity",
      tagline: "Student ID Card + Live Camera Verification",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-green-500/10",
      description:
        "We maintain a zero-tolerance policy against fake accounts and outsiders. Every student undergoes automated facial comparison and validation by designated campus moderators before unlocking ride coordinates or posting.",
      highlights: [
        "Official student card verification",
        "Live camera snapshot selfie comparison",
        "Campus Moderator review queue per university",
        "Guarantees a safe, 100% authentic community",
      ],
      previewBadge: "Zero Impersonation Tolerance",
      stat: "100% Verified Student Base",
    },
    {
      id: "voice" as const,
      name: "Smart Urdu Voice Assistant",
      tagline: "Search Your Campus Naturally in Urdu or English",
      icon: Mic,
      color: "from-rose-500/20 to-red-500/10",
      description:
        "Speak naturally in Roman Urdu or English to find anything. Say 'Mujhe kal subah UET Lahore se Gulberg ride chahiye' or 'Calculus Anton Bivens book' to instantly fetch campus records with zero typing.",
      highlights: [
        "Bilingual Urdu & English natural language understanding",
        "Instant query execution for rides, market, and hostels",
        "Hands-free accessibility for walking across campus",
        "Built specifically for university campus life",
      ],
      previewBadge: "Roman Urdu & English",
      stat: "< 1s Instant Query Match",
    },
  ];

  const partnerUniversities = [
    { name: "UET Lahore", city: "Lahore (Main & Sub-campuses)", acronym: "UET" },
    { name: "NUST Islamabad", city: "Islamabad (H-12)", acronym: "NUST" },
    { name: "FAST NUCES", city: "Lahore • Islamabad • Karachi", acronym: "FAST" },
    { name: "LUMS", city: "DHA Lahore", acronym: "LUMS" },
    { name: "COMSATS University", city: "Islamabad & Lahore", acronym: "CUI" },
    { name: "Punjab University", city: "New Campus & Old Campus", acronym: "PU" },
    { name: "GIKI", city: "Topi, Swabi", acronym: "GIKI" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <PublicNav onDownloadClick={() => setShowDownloadModal(true)} />

      {/* ======================================================== */}
      {/* MOBILE SMART PROMPT BANNER (TRIGGERED ON MOBILE VIEW)   */}
      {/* ======================================================== */}
      {showMobilePrompt && (
        <div className="fixed top-16 inset-x-0 z-40 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-3 shadow-xl border-b border-zinc-800 dark:border-zinc-200 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="w-8 h-8 rounded-lg bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                📱
              </span>
              <div>
                <div className="text-xs font-bold leading-tight">
                  How would you like to experience CampuStitch?
                </div>
                <div className="text-[11px] opacity-80">
                  Choose between our responsive web portal or high-performance native Android app.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleChooseBrowseWeb}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/20 dark:border-black/20 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer text-center"
              >
                Browse with Web
              </button>
              <a
                href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-950 dark:bg-zinc-900 dark:text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download size={13} />
                <span>Download App</span>
              </a>
              <button
                type="button"
                onClick={() => setShowMobilePrompt(false)}
                className="w-7 h-7 flex items-center justify-center text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* HERO SECTION                                             */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-200/80 dark:border-zinc-800/80">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-zinc-400/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">


          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.08]">
            Your Entire Campus Life,{" "}
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-950 dark:from-white dark:via-zinc-300 dark:to-white bg-clip-text text-transparent underline decoration-emerald-500/40 decoration-wavy decoration-2">
              Stitched Together
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-normal">
A platform that makes university life easier. Students can share rides and split fares, buy and sell hostel items, find services like printing and repairing, and join campus communities to share updates, discuss topics, and stay updated about events. Anyone can create their own community and connect with students who share the same interests. Each university has its own space for students.
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Globe size={16} />
              <span>Browse with Web</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-300 font-bold text-sm shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={16} />
              <span>Download Android App</span>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 text-center max-w-3xl w-full">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                15+
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                University Campuses
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                10,000+
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Verified Students
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                0%
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Platform Fees
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                100%
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Verified Students
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE FEATURE SHOWCASE                             */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0c0c0e] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Campus Ecosystem
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Everything Pakistani University Students Need
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tailored specifically to the realities of Pakistani higher education: high fuel prices, expensive textbooks, hostel searches, and campus community coordination.
            </p>
          </div>

          {/* Feature Selector Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {features.map((f) => {
              const Icon = f.icon;
              const isSelected = selectedFeatureTab === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFeatureTab(f.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Active Feature Card */}
          {(() => {
            const active = features.find((f) => f.id === selectedFeatureTab) || features[0];
            const Icon = active.icon;

            return (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Description Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                      <Icon size={13} className="text-emerald-500" />
                      <span>{active.previewBadge}</span>
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                      {active.tagline}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {active.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5">
                    {active.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href={
                        active.id === "commute"
                          ? "/commute"
                          : active.id === "market"
                          ? "/market"
                          : active.id === "hostel"
                          ? "/hostel"
                          : active.id === "community"
                          ? "/community"
                          : active.id === "voice"
                          ? "/voice"
                          : "/verify"
                      }
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <span>Explore {active.name}</span>
                      <ArrowRight size={13} />
                    </Link>

                    <div className="text-xs font-bold text-zinc-500">
                      {active.stat}
                    </div>
                  </div>
                </div>

                {/* Right Interactive Mockup / Metric Visual */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-[11px] font-mono font-bold text-zinc-400 ml-2">
                        tenant://uet-lahore-main/{active.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      LIVE TENANT
                    </span>
                  </div>

                  {active.id === "commute" && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-zinc-950 dark:text-white">
                            Gulberg III ➔ UET Lahore Main Campus
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Leaving 07:45 AM &bull; Toyota Corolla (White)
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Driver: Ahmed (2022-EE-104 &bull; Verified Student)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black">PKR 150</div>
                          <div className="text-[10px] text-zinc-400">2 seats left</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-zinc-950 dark:text-white">
                            DHA Phase 5 ➔ UET Lahore
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Leaving 08:00 AM &bull; Honda City (Silver)
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Driver: Fatima (BSCS &bull; Female-Only Carpool)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black">PKR 200</div>
                          <div className="text-[10px] text-zinc-400">1 seat left</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "market" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                        <div className="w-full h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500">
                          📐 Engineering Drafter
                        </div>
                        <div className="text-xs font-bold truncate">Omega A2 Drafter + T-Scale</div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-zinc-950 dark:text-white">PKR 1,800</span>
                          <span className="text-emerald-600 font-bold">Save 55%</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                        <div className="w-full h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500">
                          🔢 Scientific Calculator
                        </div>
                        <div className="text-xs font-bold truncate">Casio fx-991EX ClassWiz</div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-zinc-950 dark:text-white">PKR 3,500</span>
                          <span className="text-emerald-600 font-bold">Original</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "hostel" && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-zinc-950 dark:text-white">
                            Al-Razi Student Hall (Near Gate 3)
                          </div>
                          <span className="text-xs font-bold">PKR 12,000/mo</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          2-Seater Room &bull; Attached Bath &bull; 24/7 UPS & Wi-Fi &bull; 3 mins walk to campus
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-zinc-950 dark:text-white">
                            Looking for 1 CS/EE Roommate in Flat
                          </div>
                          <span className="text-xs font-bold">PKR 8,500/mo</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Canal Road near UET &bull; Study-focused apartment &bull; Cooking mess included
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "community" && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            #Advising
                          </span>
                          <span className="text-[11px] text-zinc-400">Posted by @2023-CS-42</span>
                        </div>
                        <div className="text-xs font-bold">
                          Best electives for 6th semester Computer Science? High GPA vs Industry skills?
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-3 pt-1">
                          <span>▲ 48 Upvotes</span>
                          <span>&bull;</span>
                          <span>24 Comments</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "kyc" && (
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck size={16} />
                        <span>Student Verification Flow</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="font-bold">Step 1</div>
                          <div className="text-zinc-500">Official Student ID Card</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="font-bold">Step 2</div>
                          <div className="text-zinc-500">Live Camera Selfie</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 text-center">
                        Verified by assigned Campus Admin before gaining access.
                      </div>
                    </div>
                  )}

                  {active.id === "voice" && (
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <Mic size={16} className="text-red-500 animate-pulse" />
                        <span>Voice Query Preview</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                        &quot;Mujhe subah 8 baje Johar Town se UET Main Campus ride chahiye&quot;
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Parsed: Commute &bull; Origin: Johar Town &bull; Dest: UET Main &bull; 8:00 AM</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ======================================================== */}
      {/* PARTNER CAMPUSES TICKER                                  */}
      {/* ======================================================== */}
      <section className="py-14 bg-zinc-100/70 dark:bg-[#09090b] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Available & Supported Pakistani Higher Education Institutions
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {partnerUniversities.map((u, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs text-center space-y-1 hover:border-zinc-950 dark:hover:border-zinc-400 transition-colors"
              >
                <div className="font-extrabold text-sm text-zinc-950 dark:text-white">
                  {u.acronym}
                </div>
                <div className="text-[10px] text-zinc-500 truncate" title={u.name}>
                  {u.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* HOW IT WORKS (3 SIMPLE STEPS)                           */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0c0c0e] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Quick Onboarding
            </h2>
            <p className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Get Started in Under 2 Minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Register Your University
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Select your university and campus from our cascading directory. Enter your student roll number and degree program.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Verify Student ID
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Upload a snapshot of your physical student ID card and take a quick live camera selfie. Your campus moderator validates your credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Stitch Into Your Campus
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Share rides to campus, buy second-hand engineering & medical textbooks, discover hostel vacancies, and engage in campus feeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MOBILE VS WEB EXPERIENCE CTA BANNER                      */}
      {/* ======================================================== */}
      <section className="py-16 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-[#0c0c0e] dark:to-[#09090b] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 dark:bg-black/10 border border-white/20 dark:border-black/20">
                <Smartphone size={13} />
                <span>Available on Android & Web</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Use in Your Browser or Install the Android App
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-700 leading-relaxed">
                CampuStitch runs seamlessly across both modern desktop/mobile web browsers and native Android devices with offline caching.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Globe size={15} />
                <span>Launch Web Portal</span>
              </Link>
              <a
                href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 dark:border-black/30 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
              >
                <Download size={15} />
                <span>Download Android APK</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* APP DOWNLOAD MODAL DIALOG                                */}
      {/* ======================================================== */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#121215] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Download CampuStitch APK
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official Android Release (v1.0.0 &bull; 50.2 MB)
              </p>
            </div>

            <a
              href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
              className="w-full h-12 px-4 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
            >
              <Download size={16} />
              <span>Download APK</span>
            </a>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
