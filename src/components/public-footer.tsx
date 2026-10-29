"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";

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
                CampusStitch
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-zinc-600 dark:text-zinc-400">
              Campus life is easier when we help each other. Connect with students at your university to share rides, buy and sell items, rent bikes, and discover campus services.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Student ID checks keep interactions safe for everyone.</span>
            </div>
          </div>

          {/* Student Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/commute" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Ride Sharing
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Buy &amp; Sell Marketplace
                </Link>
              </li>
              <li>
                <Link href="/commute/bike" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Bike Rentals
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Campus Services
                </Link>
              </li>
              <li>
                <Link
                  href="/home#waitlist"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Play Store Early Access</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Safety &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/delete-account"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Account &amp; Data Deletion
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Community Safety Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Universities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Campuses
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>UET Lahore (Main &amp; Campuses)</li>
              <li>NUST Islamabad</li>
              <li>FAST NUCES (All Campuses)</li>
              <li>LUMS Lahore</li>
              <li>COMSATS University</li>
              <li>Punjab University (PU)</li>
              <li>GIKI Topi</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>&copy; {new Date().getFullYear()} CampusStitch Pakistan. All rights reserved.</span>
            <span>&bull;</span>
            <span>Connecting university students.</span>
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
