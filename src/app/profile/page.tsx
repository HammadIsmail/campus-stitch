"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Compass,
  LogOut,
  ChevronRight,
  Plus,
  Package,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Listing, SharedItem } from "@/lib/data-service";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const user = {
    name: authUser?.name || "Muhammad Hammad",
    studentId: authUser?.studentId || "2021-CS-104",
    program: authUser?.program || "BSCS (Computer Science)",
    university: "UET Lahore",
    verified: authUser?.isVerified ?? true,
    role: authUser?.role || "student",
  };

  const [myBookings, setMyBookings] = React.useState<any[]>([]);
  const [myListings, setMyListings] = React.useState<Listing[]>([]);
  const [myShared, setMyShared] = React.useState<SharedItem[]>([]);

  React.useEffect(() => {
    async function loadProfileData() {
      try {
        const storedBookings = JSON.parse(
          localStorage.getItem("campus_stitch_my_bookings") || "[]"
        );
        setMyBookings(storedBookings);
      } catch {}

      const allListings = await DataService.getListings();
      setMyListings(allListings);

      const allShared = await DataService.getSharedItems();
      setMyShared(allShared);
    }
    loadProfileData();
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-bold text-lg tracking-tight text-black">
              Student Profile
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              UET Lahore · Verified Identity
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-zinc-600 hover:text-black flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 max-w-xl mx-auto w-full">
          {/* Student Card Identity Block */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-black">
                    {user.name}
                  </h1>
                  <div className="text-xs font-mono font-semibold text-zinc-600">
                    {user.studentId}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {user.program} · {user.university}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-black font-bold">
                <ShieldCheck size={16} className="text-black" />
                <span>Verified UET Student</span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Card verified for 2026
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">{myBookings.length}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                Active {myBookings.length === 1 ? "Ride" : "Rides"}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">{myListings.length}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                {myListings.length === 1 ? "Listing" : "Listings"}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">{myShared.length}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                Shared {myShared.length === 1 ? "Item" : "Items"}
              </div>
            </div>
          </div>

          {/* My Commute Bookings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                My Upcoming Commute
              </div>
              <Link
                href="/commute"
                className="text-xs font-semibold text-black hover:underline"
              >
                Find more
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs text-center space-y-2">
                <Compass size={24} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black">No active rides booked</div>
                <p className="text-[11px] text-zinc-500">
                  You haven’t joined any commute carpools or rickshaw splits yet.
                </p>
                <Link
                  href="/commute"
                  className="inline-block mt-1 text-xs font-bold text-black hover:underline"
                >
                  Browse Available Commutes →
                </Link>
              </div>
            ) : (
              myBookings.map((b: any, idx: number) => (
                <div key={b.id || idx} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-black flex items-center gap-2">
                        <span>{b.route || `${b.from_location} → ${b.to_location}`}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-bold">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {b.departure_time || "Tomorrow 8:00 AM"} · Organizer: {b.organizer_name || "Student"}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-black">Rs. {b.price_per_seat || b.cost || 50}</div>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex gap-2">
                    <Link
                      href={`/commute/ride?id=${b.ride_id || ""}`}
                      className="flex-1 h-8 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center transition-colors"
                    >
                      View Ride Details
                    </Link>
                    <Link
                      href={`/messages?context=ride&id=${b.ride_id || ""}`}
                      className="h-8 px-3 border border-zinc-300 rounded-lg text-xs font-semibold text-black hover:bg-zinc-100 flex items-center justify-center transition-colors"
                    >
                      Chat with Organizer
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* My Marketplace Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                My Marketplace Items
              </div>
              <Link
                href="/market/sell"
                className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add Item</span>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs text-center space-y-2">
                <Package size={24} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black">No items listed for sale</div>
                <p className="text-[11px] text-zinc-500">
                  Got old textbooks, electronics, or hostel furniture? Post them in the market.
                </p>
                <Link
                  href="/market/sell"
                  className="inline-block mt-1 text-xs font-bold text-black hover:underline"
                >
                  Sell an Item →
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-2xs">
                {myListings.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-black">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {item.location} · Rs. {Number(item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-black capitalize">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hub Navigation & Admin Safety */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1">
              Account & Safety
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-2xs">
              <Link
                href="/verify"
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-black">
                  <ShieldCheck size={16} />
                  <span>Update Student ID Card</span>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </Link>
              <Link
                href="/admin"
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-black">
                  <ShieldCheck size={16} />
                  <span>Campus Safety & Verification Queue</span>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
