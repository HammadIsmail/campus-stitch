"use client";

import * as React from "react";
import Link from "next/link";
import { X, Mic, Check, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";

export default function VoiceRideBookedPage() {
  const [cancelled, setCancelled] = React.useState(false);

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
          <span className="text-[11px] text-zinc-600 font-semibold bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
            Urdu · English
          </span>
        </header>

        {/* Scrollable Conversation */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5">
          {/* Reference pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
              Ahmed · 8:00 AM · Rs. 50{" "}
              <span className="text-zinc-500">· Khurrialwala</span>
            </span>
          </div>

          {/* User Confirmation */}
          <div className="self-end ml-auto max-w-[290px] p-3 rounded-2xl rounded-tr-xs bg-black text-white text-[14px] leading-snug shadow-xs font-medium">
            اوکے میری رائیڈ اس کے ساتھ بک کر دیں
          </div>

          {/* Assistant Confirmation */}
          <div className="max-w-[330px] p-3.5 rounded-2xl rounded-tl-xs bg-white border border-zinc-200 text-[14px] leading-relaxed text-zinc-900 shadow-2xs space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Audio Response
            </div>
            <p>
              بہت اچھا! احمد کے ساتھ کل صبح <b>8:00</b> بجے کی رائیڈ بک کر دی
              گئی ہے۔ آپ کا کرایہ حصہ <b>Rs. 50</b> ہے۔
            </p>
          </div>

          {/* Ride Booked Card */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                <Check size={18} className="stroke-[3px]" />
              </span>
              <span className="text-[17px] font-extrabold text-black">
                {cancelled ? "Ride Cancelled" : "Ride Booked Successfully"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[15px] font-bold text-black">
                Khurrialwala → University
              </span>
              <span className="text-[16px] font-extrabold text-black">
                Rs. 50
              </span>
            </div>

            <div className="flex justify-between text-xs text-zinc-500">
              <span>Tomorrow, 8:00 AM</span>
              <span className="font-semibold text-black">
                {cancelled ? "0 of 4 seats" : "4 of 4 joined"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 text-xs font-semibold">
              <span className="w-7 h-7 rounded-full bg-zinc-100 text-black border border-zinc-200 font-bold flex items-center justify-center">
                A
              </span>
              <span className="text-zinc-800">
                Ahmed ·{" "}
                <span className="text-black font-bold">Verified Student</span>
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                asChild
                className="flex-1 h-11 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white"
              >
                <Link href="/commute/ride">View in My Rides</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCancelled(true)}
                disabled={cancelled}
                className="h-11 px-4 rounded-xl text-xs font-bold text-black border-zinc-300 hover:bg-zinc-100"
              >
                {cancelled ? "Cancelled" : "Cancel Ride"}
              </Button>
            </div>
          </section>

          <div className="text-[12px] leading-relaxed text-zinc-500">
            Booked via Urdu Voice Assistant. You can view or manage all bookings
            from <b>Commute</b>.
          </div>
        </main>

        {/* Big Microphone */}
        <div className="flex-none p-4 pb-6 border-t border-zinc-200 bg-white flex flex-col items-center gap-2">
          <Link
            href="/voice"
            aria-label="Tap to speak"
            className="w-16 h-16 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Mic size={28} className="stroke-[2px]" />
          </Link>
          <div className="text-xs text-zinc-500 font-medium">
            Tap to ask something else
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
