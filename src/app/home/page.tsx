"use client";

import * as React from "react";
import Link from "next/link";
import {
  Car,
  Tag,
  Bike,
  Wrench,
  ShieldCheck,
  Globe,
  ArrowRight,
  HelpCircle,
  Banknote,
  GraduationCap,
  MessageCircle,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function LandingHomePage() {
  const [waitlistEmail, setWaitlistEmail] = React.useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = React.useState(false);
  const [waitlistStatus, setWaitlistStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) return;

    setWaitlistSubmitting(true);
    setWaitlistStatus(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistStatus({
          type: "success",
          message: data.message || "You're on the early access list!",
        });
        setWaitlistEmail("");
      } else {
        setWaitlistStatus({
          type: "error",
          message: data.message || "Failed to join waitlist. Please try again.",
        });
      }
    } catch {
      setWaitlistStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setWaitlistSubmitting(false);
    }
  };

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
      <PublicNav showDownloadButton={false} />

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80">
        {/* Subtle ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-zinc-400/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.08]">
            Campus life is easier when we help each other.
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-normal">
            Find rides, sell things you no longer need, rent out your bike, and discover services offered by students at your university.
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex items-center justify-center w-full">
            <Link
              href="/commute"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Globe size={16} />
              <span>Browse with Web</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Honest Student Guarantees (Consistent Emerald Accents) */}
          <div className="mt-14 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center max-w-3xl w-full">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-zinc-950 dark:text-white font-bold text-sm sm:text-base">
                <Banknote size={16} className="text-emerald-500 shrink-0" />
                <span>Direct Cash</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Split costs in person with zero platform cuts
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-zinc-950 dark:text-white font-bold text-sm sm:text-base">
                <GraduationCap size={16} className="text-emerald-500 shrink-0" />
                <span>Verified Students</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Student ID checks keep interactions safe
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-zinc-950 dark:text-white font-bold text-sm sm:text-base">
                <MessageCircle size={16} className="text-emerald-500 shrink-0" />
                <span>Direct Contact</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Connect with peers without middlemen
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-zinc-950 dark:text-white font-bold text-sm sm:text-base">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Your University</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Dedicated spaces for each university campus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. REAL-LIFE USE-CASE SECTION (CONSISTENT EMERALD THEME) */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0c0c0e] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Real Student Scenarios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Everyday campus problems, made easier.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Simple ways students help each other tackle the common challenges of university life.
            </p>
          </div>

          {/* Core Features Row: Ride Sharing & Buy & Sell */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 1. Ride Sharing Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121215] p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Car size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                        Ride Sharing
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Carpooling &amp; travel coordination
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Core Feature
                  </span>
                </div>

                {/* Q&A Pair 1 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Your lecture is over, but your friends are still busy?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                    Find other students heading your way and share a ride home instead of waiting or paying the full fare alone.
                  </p>
                </div>

                {/* Q&A Pair 2 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Need to get somewhere on a budget?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                    Find students travelling in the same direction and split the ride fare.
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/commute"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Browse Campus Rides</span>
                  <ArrowRight size={13} />
                </Link>
                <span className="text-[11px] text-zinc-500">Split petrol costs</span>
              </div>
            </div>

            {/* 2. Buy & Sell Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121215] p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Tag size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                        Buy &amp; Sell
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Campus student marketplace
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Core Feature
                  </span>
                </div>

                {/* Q&A Pair 1 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Have books or items you no longer need?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                    Sell them to other students on your campus instead of letting them sit unused.
                  </p>
                </div>

                {/* Q&A Pair 2 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Looking for something another student is selling?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                    Browse campus listings to find used books, calculators, and other useful items.
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/market"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight size={13} />
                </Link>
                <span className="text-[11px] text-zinc-500">In-person handoffs</span>
              </div>
            </div>
          </div>

          {/* Secondary Features Row: Rentals, Campus Services, Student Profiles & Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3. Rentals Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121215] p-6 flex flex-col justify-between space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bike size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      Rentals
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Campus bike rentals
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Your bike is sitting unused?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                    List it for rent at your own price and connect with students who need a bike.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/commute/bike"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Rent a Bike</span>
                  <ArrowRight size={13} />
                </Link>
                <span className="text-[10px] text-zinc-500">Daily or weekly</span>
              </div>
            </div>

            {/* 4. Campus Services Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121215] p-6 flex flex-col justify-between space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Wrench size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      Campus Services
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Student-offered skills &amp; help
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Offer a service on campus?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                    List your printing, repair, or other services so students can find and contact you.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Explore Services</span>
                  <ArrowRight size={13} />
                </Link>
                <span className="text-[10px] text-zinc-500">Hostel &amp; campus</span>
              </div>
            </div>

            {/* 5. Student Profiles and Reviews Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#121215] p-6 flex flex-col justify-between space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      Profiles &amp; Reviews
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Trust and student reputation
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      Want to know who you&apos;re dealing with?
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                    View student profiles, check verification badges, and read reviews where available.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Student Verification</span>
                  <ArrowRight size={13} />
                </Link>
                <span className="text-[10px] text-zinc-500">Official student cards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SUPPORTED UNIVERSITIES                                */}
      {/* ======================================================== */}
      <section className="py-14 bg-zinc-100/70 dark:bg-[#09090b] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Designed for students across Pakistani universities
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
      {/* 4. HOW IT WORKS (3 SIMPLE STEPS)                        */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0c0c0e] border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Simple Steps
            </h2>
            <p className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Get Started in Minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Pick Your University
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Choose your university campus and enter your department details to access your campus space.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Verify Student Card
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Upload a quick picture of your student ID card so everyone in the campus community knows they are interacting with real students.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Help &amp; Connect
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Find rides to campus, buy or sell used books and calculators, rent bikes, and discover student services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. GOOGLE PLAY STORE EARLY ACCESS / WAITLIST SECTION     */}
      {/* ======================================================== */}
      <section id="waitlist" className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#0c0c0e] border-b border-zinc-200/80 dark:border-zinc-800/80 scroll-mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-center">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Smartphone size={13} />
                <span>Google Play Store Release</span>
              </span>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Get Early Access to the Android App
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Be the first to download the official CampusStitch app when it launches on Google Play. Leave your email to receive an early access invite.
              </p>
            </div>

            {/* Email Waitlist Form */}
            <form onSubmit={handleJoinWaitlist} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your student email..."
                    disabled={waitlistSubmitting}
                    className="w-full h-11 pl-10 pr-4 rounded-xl text-xs bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={waitlistSubmitting}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {waitlistSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Early Access</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>

              {/* Status Message */}
              {waitlistStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in ${
                    waitlistStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
                  }`}
                >
                  {waitlistStatus.type === "success" ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0 text-red-500" />
                  )}
                  <span>{waitlistStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 gap-2">
                <span>No spam. Only invited Google Play Store testing alerts.</span>
                <Link
                  href="/commute"
                  className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Or browse on web</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
