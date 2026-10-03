"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Trophy,
  Building2,
  Loader2,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Academic & Tech",
  "Official Society",
  "Hostel Community",
  "Sports & Fitness",
  "Batch Network",
  "Hobbies & Arts",
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Academic & Tech");
  const [description, setDescription] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [batchRestriction, setBatchRestriction] = React.useState("All UET Students");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const newCommunity = {
      id: "comm_" + Date.now(),
      name: name.trim(),
      category: category,
      description: description.trim(),
      venue: venue.trim() || "Main Campus",
      batch: batchRestriction,
      verified: true,
      memberCount: 1,
      lead: "Muhammad Hammad",
      created_at: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(
        localStorage.getItem("campus_stitch_communities") || "[]"
      );
      stored.unshift(newCommunity);
      localStorage.setItem("campus_stitch_communities", JSON.stringify(stored));
    } catch {}

    setLoading(false);
    router.push("/community");
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/community"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Create Campus Community
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">UET Groups</span>
        </header>

        {/* Scrollable Form */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 max-w-xl mx-auto w-full">
          <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1.5">
            <div className="text-sm font-bold text-black flex items-center gap-1.5">
              <Sparkles size={16} className="text-black" />
              <span>Start a Verified Student Group</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Create a study circle, batch community, hostel floor group, or official society hub for verified UET Lahore students.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Community / Society Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. UET Competitive Programmers, Block B Night Owls"
                className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      category === cat
                        ? "bg-black text-white shadow-2xs"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Eligibility / Audience
              </label>
              <select
                value={batchRestriction}
                onChange={(e) => setBatchRestriction(e.target.value)}
                className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs bg-white outline-none focus:border-black"
              >
                <option value="All UET Students">All UET Students (Open)</option>
                <option value="CS Department Only">Computer Science Department Only</option>
                <option value="Electrical Department Only">Electrical Engineering Only</option>
                <option value="Mechanical Department Only">Mechanical Engineering Only</option>
                <option value="Batch 2021-2025">Batch 2021–2025</option>
                <option value="Hostel Residents Only">Hostel Residents Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Meeting Venue / Activity Hub
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. CS Seminar Hall, Zubair Hall common room, or Discord"
                className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-black block mb-1">
                Description & Objectives
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will members do together? Weekly coding contests, hostel badminton sessions, or course revisions..."
                rows={3}
                className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    <span>Creating Group...</span>
                  </>
                ) : (
                  "Create Community Hub"
                )}
              </Button>
            </div>
          </form>

          <div className="p-3 bg-zinc-100 rounded-xl text-[11px] text-zinc-600 flex items-center gap-1.5 border border-zinc-200">
            <ShieldCheck size={14} className="text-black shrink-0" />
            <span>Community leaders must have a verified student card.</span>
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
