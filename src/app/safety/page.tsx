"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Car,
  ShoppingBag,
  Building,
  AlertTriangle,
  PhoneCall,
  CheckCircle,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      {/* Hero Header */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Campus Community Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Trust, Safety & Campus Guidelines
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            CampuStitch is built on trust between verified university peers. Learn how we safeguard your campus experience across carpooling, marketplace trades, and student forums.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              100% Student Verified
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every student must submit their physical campus card and take a live facial verification photo, reviewed by designated campus administrators. Outsiders and non-students are barred from entering campus feeds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car size={20} />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Safe Campus Commute
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Rides are shared exclusively with verified university batchmates and faculty. Check driver profiles, vehicle plates, and mutual batch ratings before booking or boarding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              On-Campus Safe Trades
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Never meet outside campus boundaries for item handoffs. All exchanges of books, drawing boards, and lab gear should happen in designated public campus spots like central libraries or departmental cafeterias.
            </p>
          </div>
        </div>

        {/* Community Rules */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Users size={18} />
            <span>Community Rules & Zero-Tolerance Policies</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <span className="font-bold text-zinc-950 dark:text-white block">No Harassment or Bullying</span>
              <p>We do not tolerate abusive language, stalking, sectarian slurs, or harassment towards any student, faculty member, or group.</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <span className="font-bold text-zinc-950 dark:text-white block">Academic Integrity</span>
              <p>Sale or dissemination of leaked exam papers, unauthorized exam keys, or commercial ghostwriting services is strictly prohibited.</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <span className="font-bold text-zinc-950 dark:text-white block">No Prohibited Goods</span>
              <p>Weapons, narcotics, counterfeit medications, or stolen electronic property listings will result in an immediate police and university referral.</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <span className="font-bold text-zinc-950 dark:text-white block">Authentic KYC Documents Only</span>
              <p>Submitting falsified or altered student identification cards results in an irreversible permanent ban and reporting to university administration.</p>
            </div>
          </div>
        </section>

        {/* Emergency & Reporting Contact */}
        <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <PhoneCall size={18} className="text-emerald-400" />
            <span>Need Help or Witnessed a Violation?</span>
          </div>
          <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
            If you encounter unsafe driving, inappropriate marketplace items, or harassment on campus forums, use the in-app <strong>Report</strong> button or contact your Campus Moderator team immediately.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/terms"
              className="underline text-zinc-300 hover:text-white transition-colors"
            >
              View Full Terms of Service
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
