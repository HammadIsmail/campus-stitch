"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Mail, ExternalLink, ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="w-full bg-zinc-100 dark:bg-[#0c0c0e] border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/home" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm tracking-widest shadow-xs">
                CS
              </span>
              <span className="font-extrabold text-xl tracking-tight text-zinc-950 dark:text-white">
                CampuStitch
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-zinc-600 dark:text-zinc-400">
              Pakistan&apos;s premier multi-tenant university superapp. Connecting verified students for secure campus carpools, peer-to-peer textbook & gear marketplace, verified hostel discovery, and campus communities.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Strict Campus ID verification required for all students.</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Campus Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/commute" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Campus Commute & Rides
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Student Marketplace
                </Link>
              </li>
              <li>
                <Link href="/hostel" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Hostel & Roommate Finder
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  University Community Feed
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Student KYC Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policy (Crucial for Google Play Store compliance) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="font-medium hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="font-medium hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/delete-account"
                  className="font-medium hover:text-zinc-950 dark:hover:text-white transition-colors text-amber-600 dark:text-amber-400"
                >
                  <span>Account & Data Deletion</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  <span>Community Safety Guide</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  <span>Contact & Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Universities & App */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Universities
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>UET Lahore (Main & Sub-campuses)</li>
              <li>NUST Islamabad</li>
              <li>FAST NUCES (All Campuses)</li>
              <li>LUMS Lahore</li>
              <li>COMSATS University</li>
              <li>Punjab University (PU)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Store Compliance Notes */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>&copy; {new Date().getFullYear()} CampuStitch Pakistan. All rights reserved.</span>
            <span>&bull;</span>
            <span>Complies with Google Play Developer Policy.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/delete-account" className="hover:underline">
              Data Safety
            </Link>
            <Link href="/contact" className="hover:underline">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
