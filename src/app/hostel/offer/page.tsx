"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wrench,
  Shirt,
  Printer,
  Zap,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const SERVICE_PRESETS = [
  { name: "Laundry Pickup & Wash", icon: Shirt, defaultRate: "Rs. 40 / pair" },
  { name: "Cooler & Electrician Repairs", icon: Zap, defaultRate: "Rs. 200 visit" },
  { name: "Past Papers & Printout Delivery", icon: Printer, defaultRate: "Rs. 5 / page" },
  { name: "Laptop Setup & OS Formatting", icon: Wrench, defaultRate: "Rs. 500" },
];

export default function OfferServicePage() {
  const router = useRouter();
  const [serviceName, setServiceName] = React.useState("");
  const [providerName, setProviderName] = React.useState("Muhammad Hammad");
  const [location, setLocation] = React.useState("Hostel Block A");
  const [schedule, setSchedule] = React.useState("Daily 5 PM – 10 PM");
  const [rate, setRate] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSelectPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setServiceName(preset.name);
    if (!rate) setRate(preset.defaultRate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !rate.trim()) return;

    setLoading(true);
    const newService = {
      id: "srv_" + Date.now(),
      name: serviceName.trim(),
      provider: providerName.trim(),
      location: location.trim(),
      schedule: schedule.trim(),
      rate: rate.trim(),
      phone: phone.trim() || "0300-1234567",
      notes: notes.trim(),
      verified: true,
      created_at: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(
        localStorage.getItem("campus_stitch_hostel_services") || "[]"
      );
      stored.unshift(newService);
      localStorage.setItem("campus_stitch_hostel_services", JSON.stringify(stored));

      const supabase = createClient();
      await supabase.from("hostel_services").insert([newService]);
    } catch (err) {
      console.warn("Service save warning:", err);
    } finally {
      setLoading(false);
      router.push("/hostel");
    }
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/hostel"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Offer Campus Service
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">Hostel Hub</span>
        </header>

        {/* Scrollable Form */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 max-w-xl mx-auto w-full">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Quick Service Templates
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = serviceName === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? "bg-black text-white border-black shadow-2xs"
                        : "bg-white border-zinc-200 text-zinc-800 hover:border-black"
                    }`}
                  >
                    <Icon size={16} className={isSelected ? "text-white" : "text-black"} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-snug truncate">{p.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                        {p.defaultRate}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Service Title
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Desert Cooler Cleaning & Pump Setup"
                className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-black block mb-1">
                  Pricing / Rate
                </label>
                <input
                  type="text"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. Rs. 200 visit"
                  className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black block mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-black block mb-1">
                  Hostel / Area
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hostel Block A & B"
                  className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black block mb-1">
                  Availability Hours
                </label>
                <input
                  type="text"
                  required
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Daily 6 PM – 10 PM"
                  className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                WhatsApp / Phone (for bookings)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Service Details & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Turnaround time, what tools you bring, room delivery details..."
                rows={2}
                className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || !serviceName.trim() || !rate.trim()}
                className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    <span>Publishing Service...</span>
                  </>
                ) : (
                  "Publish Student Service"
                )}
              </Button>
            </div>
          </form>

          <div className="p-3 bg-zinc-100 rounded-xl text-[11px] text-zinc-600 flex items-center gap-1.5 border border-zinc-200">
            <ShieldCheck size={14} className="text-black shrink-0" />
            <span>All student services are linked to verified campus ID profiles.</span>
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
