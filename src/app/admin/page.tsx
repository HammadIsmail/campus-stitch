"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, VerificationRequest } from "@/lib/data-service";

const TABS = ["Verification", "Reports · 3", "Listings", "Users"];

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = React.useState("Verification");
  const [queue, setQueue] = React.useState<VerificationRequest[]>([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);

  React.useEffect(() => {
    async function loadQueue() {
      const data = await DataService.getVerifications();
      setQueue(data);
    }
    loadQueue();
  }, []);

  const currentItem = queue[selectedIdx] || queue[0];

  const handleAction = async (
    status: "approved" | "rejected" | "reupload" | "pending",
  ) => {
    if (!currentItem) return;
    await DataService.updateVerificationStatus(currentItem.id, status);
    setQueue((prev) =>
      prev.map((item, idx) =>
        idx === selectedIdx ? { ...item, status } : item,
      ),
    );
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-extrabold text-base tracking-tight text-black">
              Admin Panel
            </div>
            <div className="text-[11px] font-medium text-zinc-500">
              UET Lahore Verification & Safety Portal
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-zinc-600 font-semibold hover:text-black px-2 flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={13} />
            Exit
          </Link>
        </header>

        {/* Tab Pills */}
        <div className="flex gap-2 overflow-x-auto p-3 flex-none bg-white border-b border-zinc-200 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 h-8 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-black text-white shadow-2xs"
                  : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {tab === "Verification" ? `Verification · ${queue.length}` : tab}
            </button>
          ))}
        </div>

        {/* Main Review Section */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {currentItem ? (
            <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-extrabold text-black">
                  Student Card Review
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-100 border border-zinc-300 text-black">
                  {currentItem.confidence_status}
                </span>
              </div>

              {/* Student ID Card Preview */}
              <div className="h-44 rounded-xl bg-zinc-100 border border-zinc-300 overflow-hidden flex flex-col items-center justify-center text-xs text-zinc-500 relative">
                {currentItem.card_photo_url ? (
                  <img
                    src={currentItem.card_photo_url}
                    alt="Uploaded Student ID"
                    className="w-full h-full object-contain bg-black/5"
                  />
                ) : (
                  <>
                    <Camera size={26} className="text-zinc-400" />
                    <span className="font-semibold text-xs text-zinc-800 mt-1">
                      {currentItem.name} · Student Card Photo
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {currentItem.university}
                    </span>
                  </>
                )}
              </div>

              {/* Data Table */}
              <div className="divide-y divide-zinc-100 text-xs">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-500">Name</span>
                  <span className="font-bold text-black">
                    {currentItem.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-500">Student Roll Number</span>
                  <span className="font-bold text-black font-mono">
                    {currentItem.student_id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-500">Program & Dept</span>
                  <span className="font-bold text-black">
                    {currentItem.program} · {currentItem.department}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-500">University</span>
                  <span className="font-bold text-black">
                    {currentItem.university}
                  </span>
                </div>
              </div>

              {currentItem.status === "pending" && (
                <>
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleAction("approved")}
                      className="flex-1 h-10 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      Approve Student
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction("rejected")}
                      className="flex-1 h-10 rounded-lg text-xs font-semibold text-black border-zinc-300 hover:bg-zinc-100 cursor-pointer"
                    >
                      Reject
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAction("reupload")}
                    className="w-full text-center text-xs font-medium text-zinc-600 hover:text-black hover:underline py-1 cursor-pointer"
                  >
                    Request Clear Photo Re-upload
                  </button>
                </>
              )}

              {currentItem.status === "approved" && (
                <div className="p-3 bg-zinc-100 text-black text-xs font-bold rounded-lg flex items-center justify-between border border-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Approved! Student is now verified.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAction("pending")}
                    className="underline text-[11px] cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              )}

              {currentItem.status === "rejected" && (
                <div className="p-3 bg-zinc-100 text-zinc-800 text-xs font-bold rounded-lg flex items-center justify-between border border-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <XCircle size={15} />
                    Application marked as rejected.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAction("pending")}
                    className="underline text-[11px] cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              )}
            </section>
          ) : (
            <div className="p-8 bg-white border border-zinc-200 rounded-xl text-center text-xs text-zinc-500">
              All verification requests reviewed!
            </div>
          )}

          {/* Queue List */}
          <section className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              All Queue Items ({queue.length})
            </div>
            {queue.length === 0 ? (
              <div className="p-6 bg-white border border-zinc-200 rounded-xl text-center text-xs text-zinc-500 shadow-2xs">
                No student ID cards currently awaiting moderation. Students can submit cards at /verify.
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-zinc-100">
                {queue.map((req, idx) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`flex items-center justify-between min-h-[50px] px-4 cursor-pointer transition-colors ${
                      selectedIdx === idx
                        ? "bg-zinc-100 font-bold"
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-black">
                      {req.name}{" "}
                      <span className="font-normal text-zinc-500">
                        · {req.program}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-black">
                        {req.status === "approved" ? "Verified ✓" : req.status}
                      </span>
                      <ChevronRight size={14} className="text-zinc-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
