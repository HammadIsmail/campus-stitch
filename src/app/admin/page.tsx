"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  LogOut,
  ChevronRight,
  Loader2,
  User,
  GraduationCap,
  MapPin,
  Building2,
  Mail,
  Clock,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/verification-badge";

interface VerificationItem {
  id: string;
  user_id?: string;
  email?: string;
  name: string;
  student_id: string;
  program: string;
  department: string;
  university: string;
  city?: string;
  confidence_status: string;
  status: "pending" | "approved" | "rejected" | "reupload";
  card_photo_url?: string;
  live_photo_url?: string;
  created_at?: string;
}

export default function AdminVerificationPage() {
  const [queue, setQueue] = React.useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  // Fetch verifications from API
  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/verifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.verifications)) {
        setQueue(data.verifications);
      }
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVerifications();
  }, []);

  const currentItem = queue[selectedIdx] || queue[0];

  const handleAction = async (status: "approved" | "rejected" | "pending") => {
    if (!currentItem) return;
    setIsUpdating(true);
    setActionFeedback(null);

    try {
      const res = await fetch("/api/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentItem.id,
          status,
          userId: currentItem.user_id,
          studentId: currentItem.student_id,
          email: currentItem.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === selectedIdx ? { ...item, status } : item
          )
        );
        setActionFeedback(
          status === "approved"
            ? `Student ${currentItem.name} has been verified!`
            : `Verification for ${currentItem.name} was rejected.`
        );
      } else {
        alert(data.message || "Failed to update verification status.");
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <MobileShell hideNav>
      <div className="w-full min-h-screen flex flex-col bg-background text-foreground select-none max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div>
            <div className="font-extrabold text-lg tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
              <span>Admin Verification Portal</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Review live selfie & student ID card side-by-side for campus trust
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVerifications}
              disabled={isLoading}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span>Exit Admin</span>
            </Link>
          </div>
        </header>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="mb-4 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left / Review Details (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-5">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground border border-border rounded-2xl bg-card flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-foreground mb-2" />
                <span className="text-xs font-medium">Loading verification requests...</span>
              </div>
            ) : currentItem ? (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <span className="text-sm font-extrabold text-foreground">
                      Student Identity Comparison
                    </span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Check if the face selfie matches the face on the student card
                    </div>
                  </div>
                  <VerificationBadge
                    status={
                      currentItem.status === "approved"
                        ? "verified"
                        : currentItem.status === "rejected"
                        ? "rejected"
                        : "pending"
                    }
                    isVerified={currentItem.status === "approved"}
                    size="sm"
                  />
                </div>

                {/* SIDE-BY-SIDE COMPARISON: Live Selfie & Student ID Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Live Selfie (Binance KYC) */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>1. Live Facial Selfie</span>
                    </div>
                    <div className="aspect-square rounded-xl bg-muted/40 border border-border overflow-hidden flex items-center justify-center relative">
                      {currentItem.live_photo_url ? (
                        <img
                          src={currentItem.live_photo_url}
                          alt="Live Selfie"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-xs text-muted-foreground">
                          <Camera className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span>No live photo submitted</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                        Live Webcam Capture
                      </span>
                    </div>
                  </div>

                  {/* Student ID Card */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>2. University Student ID</span>
                    </div>
                    <div className="aspect-square rounded-xl bg-muted/40 border border-border overflow-hidden flex items-center justify-center relative">
                      {currentItem.card_photo_url ? (
                        <img
                          src={currentItem.card_photo_url}
                          alt="Student ID Card"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-4 text-xs text-muted-foreground">
                          <ShieldAlert className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span>No card photo submitted</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                        Student ID Front
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Full Name</span>
                    <span className="font-bold text-foreground">{currentItem.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Verification Type</span>
                    <span className="font-bold text-foreground">KYC Live Face + ID</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">University</span>
                    <span className="font-bold text-foreground">{currentItem.university}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Campus City</span>
                    <span className="font-bold text-foreground">{currentItem.city || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Program / Department</span>
                    <span className="font-bold text-foreground truncate block">
                      {currentItem.program} · {currentItem.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Email Address</span>
                    <span className="font-bold text-foreground truncate block">{currentItem.email || "N/A"}</span>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {currentItem.status === "pending" ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => handleAction("approved")}
                        disabled={isUpdating}
                        className="flex-1 h-11 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Verify Student
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAction("rejected")}
                        disabled={isUpdating}
                        className="flex-1 h-11 border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Application
                      </Button>
                    </>
                  ) : currentItem.status === "approved" ? (
                    <div className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Student is currently Approved & Verified.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAction("pending")}
                        disabled={isUpdating}
                        className="underline text-[11px] hover:opacity-80"
                      >
                        Reset to Pending
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        Application was Rejected.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAction("pending")}
                        disabled={isUpdating}
                        className="underline text-[11px] hover:opacity-80"
                      >
                        Reset to Pending
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 bg-card border border-border rounded-2xl text-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-bold text-foreground">All Requests Reviewed!</div>
                <p className="mt-1">No pending student verification requests at this time.</p>
              </div>
            )}
          </div>

          {/* Right Column: Queue Sidebar */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Verification Queue ({queue.length})</span>
              <span className="text-[10px] lowercase text-muted-foreground font-normal">
                {queue.filter((q) => q.status === "pending").length} pending
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="p-6 bg-card border border-border rounded-2xl text-center text-xs text-muted-foreground">
                No verification submissions yet.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60 max-h-[500px] overflow-y-auto">
                {queue.map((req, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={req.id || idx}
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full text-left p-3 text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800 font-bold text-foreground border-l-4 border-black dark:border-white"
                          : "hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate">{req.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {req.program || "Student"} &bull; {req.university || "UET"}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            req.status === "approved"
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                              : req.status === "rejected"
                              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {req.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
