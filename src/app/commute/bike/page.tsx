"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  ShieldCheck,
  FileText,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, BikeItem } from "@/lib/data-service";

function BikeDetailsContent() {
  const searchParams = useSearchParams();
  const bikeId = searchParams.get("id");

  const [bike, setBike] = React.useState<BikeItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    async function loadBike() {
      setLoading(true);
      const allBikes = await DataService.getBikes();
      const found = bikeId ? allBikes.find((b) => b.id === bikeId) : allBikes[0];
      if (found) {
        setBike(found);
      }
      setLoading(false);
    }
    loadBike();
  }, [bikeId]);

  const handleRequestBike = async () => {
    if (!bike) return;
    await DataService.rentBike(bike.id, "Muhammad Hammad");
    setRequested(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xs text-zinc-500">
        Loading bike details...
      </div>
    );
  }

  if (!bike) {
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
            Bike Rental
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <Bike size={40} className="text-zinc-400 stroke-[1.5px]" />
          <div className="text-sm font-bold text-black">No bike rental selected</div>
          <p className="text-xs text-zinc-500 max-w-xs">
            There are currently no bikes available under this ID. You can browse available commute options.
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
          Bike Rental Details
        </div>
        <Link
          href={`/messages?context=bike&id=${bike.id}`}
          className="text-xs text-zinc-600 font-semibold hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <MessageSquare size={14} />
          <span>Chat</span>
        </Link>
      </header>

      {/* Scrollable Body */}
      <main className="flex-1 min-h-0 overflow-y-auto max-w-xl mx-auto w-full">
        {/* Showcase */}
        <div className="h-48 bg-zinc-100 border-b border-zinc-200 flex flex-col items-center justify-center text-zinc-500 relative">
          <Bike size={44} className="text-zinc-400 stroke-[1.6px]" />
          <span className="text-xs mt-1 font-semibold text-zinc-600">
            {bike.model} · Verified Campus Bike
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Title & Location */}
          <div>
            <div className="text-xl font-extrabold tracking-tight text-black">
              {bike.model}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {bike.location} · {bike.condition} · Campus rental
            </div>
          </div>

          {/* Time & Cost Section */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                Availability Window
              </span>
              <span className="text-xs font-bold text-black bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                {bike.available_date}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 border border-zinc-200 rounded-xl bg-zinc-50/50">
                <div className="text-[11px] text-zinc-500">Date</div>
                <div className="text-sm font-bold text-black">{bike.available_date}</div>
              </div>
              <div className="p-2.5 border border-zinc-200 rounded-xl bg-zinc-50/50">
                <div className="text-[11px] text-zinc-500">Timing</div>
                <div className="text-sm font-bold text-black">
                  {bike.available_time}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">Daily Rent</span>
                <b className="text-black font-extrabold text-sm">Rs. {bike.daily_rate}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Refundable Deposit</span>
                <b className="text-black font-bold">Rs. {bike.deposit_amount}</b>
              </div>
            </div>
          </section>

          {/* Rental Rules */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="text-xs font-bold text-black flex items-center gap-1.5">
              <FileText size={14} className="text-black" />
              <span>Rental Rules</span>
            </div>
            <div className="text-xs leading-relaxed text-zinc-600">
              {bike.rules || "Valid driving licence required. Return with the same fuel level."}
            </div>
          </section>

          {/* Owner Profile */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {bike.owner_name ? bike.owner_name.charAt(0) : "S"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black">{bike.owner_name}</div>
              <div className="text-xs text-zinc-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={13} className="text-black" />
                <span>Verified UET Student</span>
              </div>
            </div>
            <Link
              href={`/messages?context=bike&id=${bike.id}`}
              className="h-9 px-3.5 border border-zinc-300 rounded-lg text-xs font-bold text-black hover:bg-zinc-100 transition-colors flex items-center gap-1"
            >
              <MessageSquare size={13} />
              <span>Message</span>
            </Link>
          </section>

          {requested && (
            <div className="p-3 bg-zinc-100 text-black text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-300">
              <CheckCircle2 size={16} className="text-black" />
              <span>Bike requested! {bike.owner_name} has received your rental request.</span>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Booking Action */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-zinc-200 bg-white flex-none">
        <div>
          <div className="text-[11px] text-zinc-500">Daily Rent</div>
          <div className="text-lg font-extrabold text-black">Rs. {bike.daily_rate}</div>
        </div>
        <Button
          onClick={handleRequestBike}
          disabled={requested}
          className="flex-1 h-11 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white disabled:opacity-40 cursor-pointer shadow-xs"
        >
          {requested ? "Requested ✓" : "Request Bike"}
        </Button>
      </div>
    </div>
  );
}

export default function BikeDetailsPage() {
  return (
    <MobileShell>
      <React.Suspense fallback={<div className="p-6 text-xs text-zinc-500">Loading bike...</div>}>
        <BikeDetailsContent />
      </React.Suspense>
    </MobileShell>
  );
}
