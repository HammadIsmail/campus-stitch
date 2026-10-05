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
  Camera,
  Edit3,
  Sun,
  Moon,
  Monitor,
  Settings,
  Check,
  Upload,
  User,
  Sparkles,
  Bell,
  Eye,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Listing, SharedItem } from "@/lib/data-service";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ProfileReview {
  id: string;
  rater_name: string;
  rater_student_id: string;
  rating: number;
  category: string;
  comment: string;
  created_at: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const user = {
    userId: authUser?.userId || "",
    name: authUser?.name || "Student",
    email: authUser?.email || "",
    studentId: authUser?.studentId || "",
    program: authUser?.program || "",
    university: "UET Lahore",
    verified: authUser?.isVerified ?? true,
    role: authUser?.role || "student",
    avatarUrl: authUser?.avatarUrl || null,
  };

  const [bio, setBio] = React.useState<string | null>(authUser?.bio || null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    authUser?.avatarUrl || null
  );

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = React.useState(false);
  const [editBioInput, setEditBioInput] = React.useState(bio || "");
  const [editAvatarUrlInput, setEditAvatarUrlInput] = React.useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState<string | null>(null);

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

  // Preferences toggles
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [publicProfile, setPublicProfile] = React.useState(true);

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

      // Check current user cache
      try {
        const storedUser = localStorage.getItem("campus_stitch_current_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.avatarUrl || parsed.avatar_url) {
            setAvatarUrl(parsed.avatarUrl || parsed.avatar_url);
            setEditAvatarUrlInput(parsed.avatarUrl || parsed.avatar_url);
          }
          if (parsed.bio) {
            setBio(parsed.bio);
            setEditBioInput(parsed.bio);
          }
        }
      } catch {}

      const allListings = await DataService.getListings();
      setMyListings(allListings);

      const allShared = await DataService.getSharedItems();
      setMyShared(allShared);

      // Fetch Profile Details (Bio and Avatar) with userId, email, and studentId
      try {
        const queryParams = new URLSearchParams();
        if (user.userId) queryParams.set("userId", user.userId);
        if (user.email) queryParams.set("email", user.email);
        if (user.studentId) queryParams.set("studentId", user.studentId);

        const res = await fetch(`/api/profile?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && data.profile) {
          if (data.profile.bio) {
            setBio(data.profile.bio);
            setEditBioInput(data.profile.bio);
          }
          if (data.profile.avatar_url) {
            setAvatarUrl(data.profile.avatar_url);
            setEditAvatarUrlInput(data.profile.avatar_url);
          }
        }
      } catch (err) {
        console.warn("Failed to load user profile:", err);
      }

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

  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logout();
  };

  // Upload image file to Cloudinary
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "campus_stitch/avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setEditAvatarUrlInput(data.url);
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Profile (Bio & Profile Picture)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          bio: editBioInput.trim(),
          avatarUrl: editAvatarUrlInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBio(editBioInput.trim());
        setAvatarUrl(editAvatarUrlInput.trim() || null);
        setShowEditProfileModal(false);
        setSaveSuccessMsg("Profile bio and picture updated successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3000);

        try {
          const stored = localStorage.getItem("campus_stitch_current_user");
          const parsed = stored ? JSON.parse(stored) : {};
          localStorage.setItem(
            "campus_stitch_current_user",
            JSON.stringify({
              ...parsed,
              bio: editBioInput.trim(),
              avatar_url: editAvatarUrlInput.trim() || null,
            })
          );
        } catch {}
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
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
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Floating Success Feedback Toast */}
        {saveSuccessMsg && (
          <div className="fixed top-20 right-6 z-50 bg-black dark:bg-white text-white dark:text-black text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={14} className="text-emerald-400 dark:text-emerald-600" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
          <div>
            <div className="font-extrabold text-base tracking-tight text-black dark:text-white">
              Student Profile & Reputation
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              UET Lahore &bull; Verified Campus Identity
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSigningOut ? (
              <>
                <Loader2 size={14} className="animate-spin text-black dark:text-white" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut size={14} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 max-w-xl mx-auto w-full pb-16">
          {/* ======================================================== */}
          {/* STUDENT IDENTITY CARD (WITH PHOTO & BIO)                */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Profile Picture with Camera Action */}
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-2xl shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditBioInput(bio || "");
                      setEditAvatarUrlInput(avatarUrl || "");
                      setShowEditProfileModal(true);
                    }}
                    title="Change profile picture"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border border-white dark:border-zinc-900"
                  >
                    <Camera size={12} />
                  </button>
                </div>

                <div className="min-w-0">
                  <h1 className="text-base font-extrabold text-black dark:text-white flex items-center gap-1.5 truncate">
                    <span>{user.name}</span>
                    <ShieldCheck size={16} className="text-black dark:text-white shrink-0" />
                  </h1>
                  <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {user.studentId}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {user.program} &bull; {user.university}
                  </div>
                </div>
              </div>

              {/* Star Rating Badge */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-xl">
                  <Star size={14} className="fill-black dark:fill-white text-black dark:text-white" />
                  <span className="text-sm font-black text-black dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                  {totalReviews} peer {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            {/* User Bio Section */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  About Me / Student Bio
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditBioInput(bio || "");
                    setEditAvatarUrlInput(avatarUrl || "");
                    setShowEditProfileModal(true);
                  }}
                  className="font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>Edit Bio & Photo</span>
                </button>
              </div>
              {bio ? (
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  &ldquo;{bio}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed italic">
                  No bio added yet. Tell campus peers about your studies, interests, or carpool habits.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-black dark:text-white font-bold">
                <ShieldCheck size={16} className="text-black dark:text-white" />
                <span>Verified UET Student Card</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>Active Student</span>
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PROFILE RATINGS & PEER REVIEWS SECTION                  */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Campus Trust & Ratings
                </h2>
                <div className="text-base font-extrabold text-black dark:text-white mt-0.5">
                  Peer Feedback & Reputation
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowRateModal(true)}
                className="h-8 px-3 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Star size={12} className="fill-white dark:fill-black" />
                <span>Rate Student</span>
              </Button>
            </div>

            {/* Ratings Summary Card */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-4">
              <div className="text-center shrink-0 pr-3 border-r border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-black text-black dark:text-white leading-none">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-0.5 my-1 text-black dark:text-white">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= Math.round(averageRating)
                          ? "fill-black dark:fill-white text-black dark:text-white"
                          : "text-zinc-300 dark:text-zinc-700"
                      }
                    />
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
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
                      <span className="w-4 font-mono font-bold text-zinc-600 dark:text-zinc-400">
                        {stars}★
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black dark:bg-white rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-3 text-right font-mono text-zinc-500 dark:text-zinc-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Reviews List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Recent Reviews from Peers
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500 dark:text-zinc-400">
                  No peer reviews yet. Complete your first ride or trade to get rated!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-black dark:text-white">
                          {rev.rater_name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                          ({rev.rater_student_id})
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase">
                          {rev.category}
                        </span>
                      </div>
                      <div className="flex items-center text-black dark:text-white">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            className={
                              s <= rev.rating
                                ? "fill-black dark:fill-white text-black dark:text-white"
                                : "text-zinc-300 dark:text-zinc-700"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
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
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black dark:text-white">
                {myBookings.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                Active Rides
              </div>
            </div>
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black dark:text-white">
                {myListings.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                Market Listings
              </div>
            </div>
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center shadow-2xs">
              <div className="text-lg font-extrabold text-black dark:text-white">
                {myShared.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                Shared Items
              </div>
            </div>
          </div>

          {/* My Commute Bookings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                My Upcoming Commute
              </div>
              <Link
                href="/commute"
                className="text-xs font-semibold text-black dark:text-white hover:underline"
              >
                Find more
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs text-center space-y-2">
                <Compass size={24} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                <div className="text-xs font-bold text-black dark:text-white">No active rides booked</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  You haven&apos;t joined any commute carpools or rickshaw splits yet.
                </p>
                <Link
                  href="/commute"
                  className="inline-block mt-1 text-xs font-bold text-black dark:text-white hover:underline"
                >
                  Browse Available Commutes &rarr;
                </Link>
              </div>
            ) : (
              myBookings.map((b: any, idx: number) => (
                <div
                  key={b.id || idx}
                  className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                        <span>{b.route || `${b.from_location} → ${b.to_location}`}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {b.departure_time || "Tomorrow 8:00 AM"} &bull; Organizer:{" "}
                        {b.organizer_name || "Student"}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-black dark:text-white">
                      Rs. {b.price_per_seat || b.cost || 50}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ======================================================== */}
          {/* SETTINGS & PREFERENCES SECTION                          */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Settings size={14} />
                  <span>Settings & Preferences</span>
                </h2>
                <div className="text-base font-extrabold text-black dark:text-white mt-0.5">
                  App Appearance & Account Options
                </div>
              </div>
            </div>

            {/* Appearance Mode / Dark Mode Selector */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  {resolvedTheme === "dark" ? (
                    <Moon size={14} className="text-zinc-700 dark:text-zinc-300" />
                  ) : (
                    <Sun size={14} className="text-amber-500" />
                  )}
                  <span>Appearance Theme</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 capitalize">
                  Active: {theme} {theme === "system" ? `(${resolvedTheme})` : ""}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border",
                    theme === "light"
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-2xs font-extrabold"
                      : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                  )}
                >
                  <Sun size={15} className={theme === "light" ? "text-amber-400" : ""} />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border",
                    theme === "dark"
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-2xs font-extrabold"
                      : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                  )}
                >
                  <Moon size={15} className={theme === "dark" ? "text-blue-300" : ""} />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border",
                    theme === "system"
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-2xs font-extrabold"
                      : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                  )}
                >
                  <Monitor size={15} />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Quick Profile Edit Shortcut Button */}
            <button
              type="button"
              onClick={() => {
                setEditBioInput(bio || "");
                setEditAvatarUrlInput(avatarUrl || "");
                setShowEditProfileModal(true);
              }}
              className="w-full h-10 px-4 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Edit3 size={14} />
                <span>Edit Bio & Profile Picture</span>
              </span>
              <ChevronRight size={15} className="text-zinc-400" />
            </button>

            {/* Additional Campus Preferences */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Bell size={13} />
                    <span>Commute & Chat Notifications</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Receive instant alerts for booked rides and peer messages
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Eye size={13} />
                    <span>Campus Peer Visibility</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Show your bio and verification badge to verified UET students
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Account & Verification Links */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
              Account & Safety
            </div>
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800 shadow-2xs">
              <Link
                href="/verify"
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-black dark:text-white">
                  <CreditCard size={16} />
                  <span>Update University Student Card</span>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </Link>
              <Link
                href="/admin"
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-black dark:text-white">
                  <ShieldCheck size={16} />
                  <span>Campus Safety & Verification Queue</span>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Account Sign Out Action Card */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full h-11 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? (
                <>
                  <Loader2 size={15} className="animate-spin text-red-600 dark:text-red-400" />
                  <span>Signing Out of CampuStitch...</span>
                </>
              ) : (
                <>
                  <LogOut size={15} />
                  <span>Sign Out of CampuStitch</span>
                </>
              )}
            </button>
          </div>
        </main>

        {/* ======================================================== */}
        {/* MODAL 1: EDIT PROFILE (BIO & PROFILE PICTURE)           */}
        {/* ======================================================== */}
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-extrabold text-base text-black dark:text-white flex items-center gap-2">
                  <Edit3 size={17} />
                  <span>Edit Bio & Profile Picture</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Profile Picture Uploader */}
                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-2">
                    Profile Picture
                  </label>

                  <div className="flex items-center gap-4">
                    {/* Live Preview Avatar */}
                    <div className="relative shrink-0">
                      {editAvatarUrlInput ? (
                        <img
                          src={editAvatarUrlInput}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-black dark:border-white shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-2xl shadow-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                          <Loader2 size={18} className="animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Upload button & presets */}
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                        <Upload size={13} />
                        <span>{isUploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadFile}
                          disabled={isUploadingAvatar}
                        />
                      </label>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Uploads are converted to high-speed WebP
                      </div>
                    </div>
                  </div>

                  {/* Preset Avatars Selection */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1.5">
                      Or pick a campus preset avatar:
                    </span>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditAvatarUrlInput(url)}
                          className={cn(
                            "w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer",
                            editAvatarUrlInput === url
                              ? "border-black dark:border-white ring-2 ring-black dark:ring-white scale-105"
                              : "border-zinc-200 dark:border-zinc-700 opacity-75 hover:opacity-100"
                          )}
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct URL input fallback */}
                  <div className="mt-2.5">
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={editAvatarUrlInput}
                      onChange={(e) => setEditAvatarUrlInput(e.target.value)}
                      className="w-full h-9 px-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                {/* Bio Editor Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-black dark:text-white">
                      Your Bio
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {editBioInput.length}/250
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={250}
                    required
                    placeholder="Tell your campus peers about your department, commute route, societies, or hobbies..."
                    value={editBioInput}
                    onChange={(e) => setEditBioInput(e.target.value)}
                    className="w-full p-3.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-black dark:focus:border-white leading-relaxed"
                  />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">
                    Tip: Mention your department and routine commute route to help find rides easily.
                  </span>
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditProfileModal(false)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingProfile || !editBioInput.trim()}
                    className="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: RATE STUDENT PEER                              */}
        {/* ======================================================== */}
        {showRateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-md p-5 shadow-2xl border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-extrabold text-base text-black dark:text-white flex items-center gap-1.5">
                  <Star size={16} className="fill-black dark:fill-white text-black dark:text-white" />
                  <span>Rate Student Peer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePostRating} className="space-y-3.5">
                {/* Star Selector */}
                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-2">
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
                              ? "fill-black dark:fill-white text-black dark:text-white"
                              : "text-zinc-300 dark:text-zinc-700 hover:text-zinc-500"
                          }
                        />
                      </button>
                    ))}
                    <span className="text-sm font-extrabold text-black dark:text-white ml-2">
                      {ratingInput} out of 5
                    </span>
                  </div>
                </div>

                {/* Context Selector */}
                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Interaction Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="commute">Commute / Ride-Sharing</option>
                    <option value="marketplace">Marketplace Item / Trade</option>
                    <option value="hostel">Hostel Living / Maintenance</option>
                    <option value="community">Campus Society / Study Group</option>
                  </select>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Your Feedback & Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your experience (punctuality, item condition, helpfulness)..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRateModal(false)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingRating || !commentInput.trim()}
                    className="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
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
