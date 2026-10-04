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
  Star,
  MessageSquare,
  Award,
  ThumbsUp,
  Loader2,
  X,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Listing, SharedItem } from "@/lib/data-service";
import { useAuth } from "@/lib/auth-context";

interface ProfileReview {
  id: string;
  rater_name: string;
  rater_student_id: string;
  rating: number;
  category: string;
  comment: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const user = {
    userId: authUser?.userId || "u_2023_cs_807",
    name: authUser?.name || "Muhammad Hammad Ismail",
    studentId: authUser?.studentId || "2023-CS-807",
    program: authUser?.program || "BS Computer Science",
    university: "UET Lahore",
    verified: authUser?.isVerified ?? true,
    role: authUser?.role || "student",
    hostel: authUser?.hostelBlock || "Hostel Block A",
  };

  const [myBookings, setMyBookings] = React.useState<any[]>([]);
  const [myListings, setMyListings] = React.useState<Listing[]>([]);
  const [myShared, setMyShared] = React.useState<SharedItem[]>([]);

  // Ratings State
  const [reviews, setReviews] = React.useState<ProfileReview[]>([]);
  const [averageRating, setAverageRating] = React.useState<number>(5.0);
  const [totalReviews, setTotalReviews] = React.useState<number>(3);
  const [breakdown, setBreakdown] = React.useState<Record<number, number>>({
    5: 3,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  // Rate Modal State
  const [showRateModal, setShowRateModal] = React.useState(false);
  const [ratingInput, setRatingInput] = React.useState(5);
  const [categoryInput, setCategoryInput] = React.useState("commute");
  const [commentInput, setCommentInput] = React.useState("");
  const [isSubmittingRating, setIsSubmittingRating] = React.useState(false);

  // Load Profile & Ratings Data
  React.useEffect(() => {
    async function loadData() {
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

      // Fetch Profile Ratings
      try {
        const res = await fetch(`/api/profile/ratings?userId=${user.userId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 5.0);
          setTotalReviews(data.totalReviews || 0);
          if (data.breakdown) setBreakdown(data.breakdown);
        }
      } catch (err) {
        console.warn("Failed to load ratings:", err);
      }
    }
    loadData();
  }, [user.userId]);

  const handleSignOut = async () => {
    await logout();
  };

  const handlePostRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);

    try {
      const res = await fetch("/api/profile/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          rating: ratingInput,
          category: categoryInput,
          comment: commentInput.trim(),
          raterName: "Verified Peer",
          raterStudentId: "2022-CS-012",
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setShowRateModal(false);
        setCommentInput("");
      }
    } catch (err) {
      console.error("Submit rating error:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-extrabold text-base tracking-tight text-black">
              Student Profile & Reputation
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              UET Lahore &bull; Verified Campus Identity
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-zinc-600 hover:text-black flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 max-w-xl mx-auto w-full pb-16">
          {/* Student Card Identity Block */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-black flex items-center gap-1.5">
                    <span>{user.name}</span>
                    <ShieldCheck size={16} className="text-black" />
                  </h1>
                  <div className="text-xs font-mono font-bold text-zinc-700">
                    {user.studentId}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {user.program} &bull; {user.university}
                  </div>
                </div>
              </div>

              {/* Star Rating Badge */}
              <div className="text-right">
                <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-xl">
                  <Star size={14} className="fill-black text-black" />
                  <span className="text-sm font-black text-black">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {totalReviews} peer {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-black font-bold">
                <ShieldCheck size={16} className="text-black" />
                <span>Verified UET Student Card</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {user.hostel}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PROFILE RATINGS & PEER REVIEWS SECTION                  */}
          {/* ======================================================== */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Campus Trust & Ratings
                </h2>
                <div className="text-base font-extrabold text-black mt-0.5">
                  Peer Feedback & Reputation
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowRateModal(true)}
                className="h-8 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Star size={12} className="fill-white" />
                <span>Rate Student</span>
              </Button>
            </div>

            {/* Ratings Summary Card */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-4">
              <div className="text-center shrink-0 pr-3 border-r border-zinc-200">
                <div className="text-3xl font-black text-black leading-none">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-0.5 my-1 text-black">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= Math.round(averageRating)
                          ? "fill-black text-black"
                          : "text-zinc-300"
                      }
                    />
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500 font-semibold">
                  {totalReviews} Ratings
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = breakdown[stars] || 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[10px]">
                      <span className="w-4 font-mono font-bold text-zinc-600">
                        {stars}★
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-3 text-right font-mono text-zinc-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Reviews List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-zinc-700">
                Recent Reviews from Peers
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  No peer reviews yet. Complete your first ride or trade to get rated!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-black">
                          {rev.rater_name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({rev.rater_student_id})
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 uppercase">
                          {rev.category}
                        </span>
                      </div>
                      <div className="flex items-center text-black">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            className={
                              s <= rev.rating
                                ? "fill-black text-black"
                                : "text-zinc-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(rev.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">
                {myBookings.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                Active Rides
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">
                {myListings.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                Market Listings
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black">
                {myShared.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
                Shared Items
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
                  You haven&apos;t joined any commute carpools or rickshaw splits yet.
                </p>
                <Link
                  href="/commute"
                  className="inline-block mt-1 text-xs font-bold text-black hover:underline"
                >
                  Browse Available Commutes &rarr;
                </Link>
              </div>
            ) : (
              myBookings.map((b: any, idx: number) => (
                <div
                  key={b.id || idx}
                  className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-black flex items-center gap-2">
                        <span>{b.route || `${b.from_location} → ${b.to_location}`}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-bold">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {b.departure_time || "Tomorrow 8:00 AM"} &bull; Organizer:{" "}
                        {b.organizer_name || "Student"}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-black">
                      Rs. {b.price_per_seat || b.cost || 50}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Account & Verification Links */}
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
                  <CreditCard size={16} />
                  <span>Update University Student Card</span>
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

        {/* ======================================================== */}
        {/* MODAL: RATE STUDENT PEER                                */}
        {/* ======================================================== */}
        {showRateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-base text-black flex items-center gap-1.5">
                  <Star size={16} className="fill-black" />
                  <span>Rate Student Peer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePostRating} className="space-y-3.5">
                {/* Star Selector */}
                <div>
                  <label className="text-xs font-bold text-black block mb-2">
                    Rating Score
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRatingInput(s)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            s <= ratingInput
                              ? "fill-black text-black"
                              : "text-zinc-300 hover:text-zinc-500"
                          }
                        />
                      </button>
                    ))}
                    <span className="text-sm font-extrabold text-black ml-2">
                      {ratingInput} out of 5
                    </span>
                  </div>
                </div>

                {/* Context Selector */}
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Interaction Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black bg-white focus:outline-none focus:border-black"
                  >
                    <option value="commute">Commute / Ride-Sharing</option>
                    <option value="marketplace">Marketplace Item / Trade</option>
                    <option value="hostel">Hostel Living / Maintenance</option>
                    <option value="community">Campus Society / Study Group</option>
                  </select>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Your Feedback & Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your experience (punctuality, item condition, helpfulness)..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRateModal(false)}
                    className="text-xs h-10 px-4 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingRating || !commentInput.trim()}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
                  >
                    {isSubmittingRating ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Rating"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
