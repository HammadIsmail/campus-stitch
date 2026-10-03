"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  Users,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Ride } from "@/lib/data-service";

function RideDetailsContent() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get("id") || "r1";

  const [ride, setRide] = React.useState<Ride | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [requested, setRequested] = React.useState(false);
  const [riderCount, setRiderCount] = React.useState(3);

  React.useEffect(() => {
    async function loadRide() {
      setLoading(true);
      const allRides = await DataService.getRides();
      const found = rideId ? allRides.find((r) => r.id === rideId) : allRides[0];
      if (found) {
        setRide(found);
        setRiderCount(found.total_seats - found.available_seats);
      }
      setLoading(false);
    }
    loadRide();
  }, [rideId]);

  const handleRequestSeat = async () => {
    if (!ride) return;
    const res = await DataService.bookRideSeat(ride.id, "Muhammad Hammad");
    if (res.success) {
      setRequested(true);
      setRide({ ...ride, available_seats: res.available_seats });
      setRiderCount((prev) => Math.min(ride.total_seats, prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xs text-zinc-500">
        Loading ride details...
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/commute"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Ride Details
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="text-sm font-bold text-black">No ride found</div>
          <p className="text-xs text-zinc-500 max-w-xs">
            There are currently no active rides scheduled under this route. You can search or post a new ride.
          </p>
          <Link
            href="/commute"
            className="h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            Back to Commute
          </Link>
        </div>
      </div>
    );
  }

  const cost2 = Math.round(Number(ride.total_cost) / 2);
  const cost3 = Math.round(Number(ride.total_cost) / 3);
  const cost4 = Math.round(Number(ride.total_cost) / 4);

  return (
    <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
        <Link
          href="/commute"
          aria-label="Back"
          className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="stroke-[2px]" />
        </Link>
        <div className="flex-1 font-bold text-base tracking-tight text-black">
          Ride Details
        </div>
        <Link
          href={`/messages?context=ride&id=${ride.id}`}
          className="text-xs text-zinc-600 font-semibold hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <MessageSquare size={14} />
          <span>Chat</span>
        </Link>
      </header>

      {/* Scrollable Main */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5 max-w-xl mx-auto w-full">
        {/* Time & Route Card */}
        <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-zinc-500">Tomorrow</div>
          <div className="text-2xl font-extrabold text-black tracking-tight mt-0.5">
            {ride.departure_time}
          </div>
          <div className="flex gap-3.5 mt-4">
            <div className="flex flex-col items-center pt-1">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-black" />
              <span className="w-0.5 flex-1 bg-zinc-300 my-1" />
              <span className="w-2.5 h-2.5 bg-black rounded-xs" />
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <div className="text-[14px] font-bold text-black">
                  {ride.from_location}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {ride.pickup_point || "Pickup point confirmed via chat"}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-black">
                  {ride.to_location}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Main campus gate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Cost Split Calculator */}
        <section className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold text-black">
              Rickshaw Cost Split
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              <span className="capitalize">{ride.vehicle_type}</span> · Rs.{" "}
              {ride.total_cost} total
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`text-center py-2.5 px-1 rounded-lg transition-all ${
                riderCount === 2
                  ? "border-2 border-black bg-zinc-100 font-bold text-black"
                  : "border border-zinc-200 text-zinc-600"
              }`}
            >
              <div className="text-[11px]">2 riders</div>
              <div className="text-sm font-extrabold">Rs. {cost2}</div>
            </div>
            <div
              className={`text-center py-2.5 px-1 rounded-lg transition-all ${
                riderCount === 3
                  ? "border-2 border-black bg-zinc-100 font-bold text-black"
                  : "border border-zinc-200 text-zinc-600"
              }`}
            >
              <div className="text-[11px]">3 riders</div>
              <div className="text-sm font-extrabold">Rs. {cost3}</div>
            </div>
            <div
              className={`text-center py-2.5 px-1 rounded-lg transition-all ${
                riderCount >= 4
                  ? "border-2 border-black bg-zinc-100 font-bold text-black"
                  : "border border-zinc-200 text-zinc-600"
              }`}
            >
              <div className="text-[11px]">4 riders</div>
              <div className="text-sm font-extrabold">Rs. {cost4}</div>
            </div>
          </div>
          <div className="text-xs text-zinc-600 leading-relaxed">
            {riderCount} of {ride.total_seats} seats filled. Cost drops to{" "}
            <b>Rs. {cost4}</b> as students join.
          </div>
        </section>

        {/* Organizer Card */}
        <section className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="text-xs font-bold text-black">Organizer</div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {ride.organizer_name.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black">
                {ride.organizer_name}
              </div>
              <div className="text-xs text-zinc-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={13} className="text-black" />
                Verified UET student
              </div>
            </div>
            <Link
              href={`/messages?context=ride&id=${ride.id}`}
              className="h-9 px-3.5 border border-zinc-300 rounded-lg text-xs font-bold text-black hover:bg-zinc-100 transition-colors flex items-center gap-1"
            >
              <MessageSquare size={13} />
              <span>Message</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-500">
            <span>Joined passengers:</span>
            <div className="flex gap-1">
              <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-bold inline-flex items-center justify-center border border-zinc-200">
                B
              </span>
              <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-bold inline-flex items-center justify-center border border-zinc-200">
                U
              </span>
              {requested && (
                <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold inline-flex items-center justify-center">
                  You
                </span>
              )}
            </div>
          </div>
        </section>

        {requested && (
          <div className="p-3 bg-zinc-100 text-black text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-300">
            <CheckCircle2 size={16} className="text-black" />
            <span>
              Seat booked! Your share is confirmed at Rs. {ride.price_per_seat}.
            </span>
          </div>
        )}
      </main>

      {/* Bottom Booking Action Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-zinc-200 bg-white flex-none">
        <div>
          <div className="text-[11px] text-zinc-500">Your share</div>
          <div className="text-lg font-extrabold text-black">
            Rs. {ride.price_per_seat}
          </div>
        </div>
        <Button
          onClick={handleRequestSeat}
          disabled={requested || ride.available_seats <= 0}
          className="flex-1 h-11 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white disabled:opacity-40 cursor-pointer shadow-xs"
        >
          {requested
            ? "Seat Booked ✓"
            : ride.available_seats <= 0
              ? "Ride Full"
              : "Request Seat"}
        </Button>
      </div>
    </div>
  );
}

export default function RideDetailsPage() {
  return (
    <MobileShell>
      <React.Suspense
        fallback={<div className="p-4 text-xs">Loading ride...</div>}
      >
        <RideDetailsContent />
      </React.Suspense>
    </MobileShell>
  );
}
