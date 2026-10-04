"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Mic,
  ChevronRight,
  Compass,
  Tag,
  Building2,
  Users,
  Car,
  Sparkles,
  Bike,
  ArrowRight,
  Plus,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";

export default function HomePage() {
  const [hasBooking, setHasBooking] = React.useState(false);
  const [latestBooking, setLatestBooking] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const bookings = JSON.parse(
          localStorage.getItem("campus_stitch_my_bookings") || "[]"
        );
        if (bookings && bookings.length > 0) {
          setHasBooking(true);
          setLatestBooking(bookings[bookings.length - 1]);
        }
      } catch {}
    }
  }, []);

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] text-zinc-900">
        {/* Hero Search Section */}
        <div className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-5">
          <div className="max-w-6xl mx-auto">
            {/* Smart Assistant Search Bar */}
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl shadow-2xs hover:border-black transition-all p-1.5 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5">
              <Link
                href="/assistant"
                className="flex-1 min-w-0 flex items-center gap-3 min-h-[44px] pl-3 text-zinc-500 text-xs sm:text-sm"
              >
                <Search size={16} className="text-black shrink-0" />
                <span className="truncate font-medium">
                  Search: &quot;Find rickshaw split from Khurrialwala to UET
                  tomorrow 8 AM&quot;
                </span>
              </Link>
              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                <Link
                  href="/voice"
                  aria-label="Search by Urdu voice"
                  className="h-9 px-3 bg-black text-white hover:bg-zinc-800 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                >
                  <Mic size={14} className="stroke-[2.2px]" />
                  <span className="hidden sm:inline">Urdu Voice Search</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-7 space-y-8">
          {/* Campus Services (4-Card Grid on Desktop, Hidden on Mobile Screen) */}
          <section className="hidden md:block space-y-3">
            <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              Campus Services · UET Lahore
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/commute"
                className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-black hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <Compass size={18} />
                  </span>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Commute
                  </span>
                </div>
                <div>
                  <div className="text-base font-bold text-black">
                    Student Commute
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Find and offer daily rides
                  </div>
                </div>
                <div className="text-xs font-semibold text-black flex items-center gap-1 pt-2 border-t border-zinc-100">
                  View rides <ArrowRight size={12} />
                </div>
              </Link>

              <Link
                href="/commute/bike"
                className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-black hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <Bike size={18} />
                  </span>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Bikes
                  </span>
                </div>
                <div>
                  <div className="text-base font-bold text-black">
                    Bike Rentals
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Daily student rentals on campus
                  </div>
                </div>
                <div className="text-xs font-semibold text-black flex items-center gap-1 pt-2 border-t border-zinc-100">
                  Rent on campus <ArrowRight size={12} />
                </div>
              </Link>

              <Link
                href="/market"
                className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-black hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <Tag size={18} />
                  </span>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Market
                  </span>
                </div>
                <div>
                  <div className="text-base font-bold text-black">
                    Student Market
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Buy, sell or co-own hostel items
                  </div>
                </div>
                <div className="text-xs font-semibold text-black flex items-center gap-1 pt-2 border-t border-zinc-100">
                  Browse deals <ArrowRight size={12} />
                </div>
              </Link>

              <Link
                href="/community"
                className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-black hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <Users size={18} />
                  </span>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Community
                  </span>
                </div>
                <div>
                  <div className="text-base font-bold text-black">
                    Campus Network
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Verified UET student groups
                  </div>
                </div>
                <div className="text-xs font-semibold text-black flex items-center gap-1 pt-2 border-t border-zinc-100">
                  Open community <ArrowRight size={12} />
                </div>
              </Link>
            </div>
          </section>

          {/* 2-Column Split: Active Next Ride + Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section: Your Next Ride */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
                  Your next ride
                </div>
                {hasBooking && (
                  <span className="text-[11px] font-bold text-black bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-300">
                    Confirmed · Active
                  </span>
                )}
              </div>

              {hasBooking ? (
                <Link
                  href="/commute/ride"
                  className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-black transition-all shadow-2xs block space-y-3"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-extrabold text-black">
                      Khurrialwala → University
                    </span>
                    <span className="text-lg font-extrabold text-black">
                      Rs. 50
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Tomorrow, 8:00 AM · Pickup Gate 3</span>
                    <span className="font-semibold text-black bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200">
                      Seat confirmed
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-3">
                  <div className="text-sm font-bold text-black">
                    No active ride bookings
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Search for carpools and rickshaw splits, or offer empty seats to fellow students.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/commute"
                      className="flex-1 h-9 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center transition-colors"
                    >
                      Browse Rides
                    </Link>
                    <Link
                      href="/commute/offer"
                      className="h-9 px-3.5 border border-zinc-300 rounded-lg text-xs font-semibold text-black hover:bg-zinc-100 flex items-center justify-center transition-colors gap-1"
                    >
                      <Plus size={13} />
                      <span>Offer Ride</span>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Section: Coming Up */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
                  Coming up on campus
                </div>
                <Link
                  href="/community"
                  className="text-xs font-semibold text-black hover:underline"
                >
                  View all
                </Link>
              </div>
              <Link
                href="/community"
                className="flex gap-4 items-center p-5 bg-white border border-zinc-200 rounded-xl hover:border-black transition-all shadow-2xs block"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                  <Users size={22} className="text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-black truncate">
                    Campus Societies & Study Groups
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Connect with fellow UET students and join activities
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-400 shrink-0" />
              </Link>
            </section>
          </div>
        </main>

        {/* Bottom Navigation for Mobile Devices */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
