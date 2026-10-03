"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Calendar,
  HelpCircle,
  ShieldCheck,
  Check,
  ChevronRight,
  Plus,
  MessageSquare,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";

interface CommunityItem {
  id: string;
  name: string;
  category: string;
  verified: boolean;
}

interface CampusEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  location: string;
  time: string;
  organizer: string;
}

interface HelpInquiry {
  id: string;
  question: string;
  batch: string;
  verified: boolean;
}

export default function CommunityPage() {
  const [communities, setCommunities] = React.useState<CommunityItem[]>([]);
  const [events, setEvents] = React.useState<CampusEvent[]>([]);
  const [inquiries, setInquiries] = React.useState<HelpInquiry[]>([]);
  const [showInquiryInput, setShowInquiryInput] = React.useState(false);
  const [inquiryText, setInquiryText] = React.useState("");

  React.useEffect(() => {
    try {
      const storedComm = localStorage.getItem("campus_stitch_communities");
      if (storedComm) setCommunities(JSON.parse(storedComm));
      const storedEvents = localStorage.getItem("campus_stitch_events");
      if (storedEvents) setEvents(JSON.parse(storedEvents));
      const storedInq = localStorage.getItem("campus_stitch_help_inquiries");
      if (storedInq) setInquiries(JSON.parse(storedInq));
    } catch {}
  }, []);

  const handlePostInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;

    const newInquiry: HelpInquiry = {
      id: "help_" + Date.now(),
      question: inquiryText.trim(),
      batch: "Batch 2024",
      verified: true,
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    try {
      localStorage.setItem("campus_stitch_help_inquiries", JSON.stringify(updated));
    } catch {}

    setInquiryText("");
    setShowInquiryInput(false);
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-bold text-lg tracking-tight text-black">
              Campus Community
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              UET Lahore · Verified student societies & groups
            </div>
          </div>
          <Link
            href="/assistant"
            aria-label="Search or ask"
            className="w-9 h-9 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Search size={18} className="stroke-[2px]" />
          </Link>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Your Communities Horizontal Scroll */}
          <section className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
                Your Communities
              </div>
              <button
                type="button"
                onClick={() =>
                  alert("Official societies list: CS Society, Debating Club, IEEE, ASME, ICE.")
                }
                className="text-xs font-semibold text-black hover:underline cursor-pointer"
              >
                Browse societies
              </button>
            </div>

            {communities.length === 0 ? (
              <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs text-center space-y-2">
                <Users size={24} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black">No student groups joined</div>
                <p className="text-[11px] text-zinc-500">
                  Connect with batchmates, hostel peers, and official university societies.
                </p>
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {communities.map((c) => (
                  <div key={c.id} className="w-38 shrink-0 p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs">
                    <div className="text-sm font-bold text-black">{c.name}</div>
                    <div className="text-[10px] text-zinc-500 font-semibold mt-1 flex items-center gap-1">
                      {c.verified && <ShieldCheck size={11} className="stroke-[2.5px] text-black" />}
                      {c.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: This Week Events */}
          <section className="space-y-2.5">
            <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              This Week on Campus
            </div>

            {events.length === 0 ? (
              <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-2xs text-center space-y-2">
                <Calendar size={28} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black">No events scheduled this week</div>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  University seminars, workshops, and society orientations will appear here once announced.
                </p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-3">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-12 shrink-0 text-center border-r border-zinc-200 pr-3.5">
                      <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
                        {ev.month}
                      </div>
                      <div className="text-2xl font-black text-black leading-none mt-0.5">
                        {ev.day}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-black">{ev.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {ev.organizer} · {ev.time} · {ev.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Section: Students Asking for Help */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
                Student Help Board
              </div>
              <button
                type="button"
                onClick={() => setShowInquiryInput(!showInquiryInput)}
                className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Ask Question</span>
              </button>
            </div>

            {showInquiryInput && (
              <form onSubmit={handlePostInquiry} className="p-3 bg-white border border-black rounded-xl shadow-xs space-y-2">
                <input
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Need calculator, past papers, hostel advice...?"
                  className="w-full text-xs border border-zinc-300 rounded-lg p-2.5 outline-none focus:border-black"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInquiryInput(false)}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-black text-white hover:bg-zinc-800 text-xs h-7"
                  >
                    Post to Board
                  </Button>
                </div>
              </form>
            )}

            {inquiries.length === 0 ? (
              <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-2xs text-center space-y-2">
                <HelpCircle size={28} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black">No questions on the help board</div>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Have a question about campus life, textbooks, or hostel facilities? Ask your fellow UETians!
                </p>
                <Button
                  onClick={() => setShowInquiryInput(true)}
                  className="h-8 px-4 bg-black text-white hover:bg-zinc-800 text-xs font-semibold"
                >
                  Post a Question
                </Button>
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1.5 hover:border-black transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-black leading-snug">
                    {inq.question}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span>{inq.batch}</span>
                    <span>·</span>
                    <span className="text-black font-semibold flex items-center gap-1">
                      <ShieldCheck size={11} className="stroke-[2.5px]" />
                      Verified student
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
