"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  LogOut,
  ChevronRight,
  Loader2,
  X,
  CreditCard,
  Camera,
  Edit3,
  Sun,
  Moon,
  Monitor,
  Settings,
  Check,
  Upload,
  Bell,
  Eye,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Star,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "@/hooks/use-profile-queries";
import { StudentProfileModal } from "@/components/student-profile-modal";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const user = {
    userId: authUser?.userId || "",
    name: authUser?.name || "Student",
    email: authUser?.email || "",
    studentId: authUser?.studentId || "",
    program: authUser?.program || "",
    university: authUser?.universityName || "UET Lahore",
    campus: authUser?.campusName || "Main Campus (Lahore)",
    verified: authUser?.isVerified ?? false,
    role: authUser?.role || "student",
    avatarUrl: authUser?.avatarUrl || null,
  };

  const [bio, setBio] = React.useState<string | null>(authUser?.bio || null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    authUser?.avatarUrl || null
  );
  const [profileUniversity, setProfileUniversity] = React.useState<string>(
    authUser?.universityName || "UET Lahore"
  );

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = React.useState(false);
  const [editBioInput, setEditBioInput] = React.useState(bio || "");
  const [editAvatarUrlInput, setEditAvatarUrlInput] = React.useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState<string | null>(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Preferences toggles
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [publicProfile, setPublicProfile] = React.useState(true);

  // Ratings & Public Preview State
  const [ratingData, setRatingData] = React.useState<{
    averageRating: number;
    totalReviews: number;
    reviews: any[];
  }>({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [showPublicPreview, setShowPublicPreview] = React.useState(false);

  // Load Profile Data
  React.useEffect(() => {
    async function loadData() {
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
          if (data.profile.university) {
            setProfileUniversity(data.profile.university);
          }
        }
      } catch (err) {
        console.warn("Failed to load user profile:", err);
      }

      // Fetch real ratings from /api/profile/ratings
      try {
        const queryUserId = user.userId || user.email || user.name;
        if (queryUserId) {
          const ratRes = await fetch(`/api/profile/ratings?userId=${encodeURIComponent(queryUserId)}`);
          if (ratRes.ok) {
            const ratJson = await ratRes.json();
            if (ratJson.success) {
              setRatingData({
                averageRating: Number(ratJson.averageRating) || 0,
                totalReviews: Number(ratJson.totalReviews) || 0,
                reviews: Array.isArray(ratJson.reviews) ? ratJson.reviews : [],
              });
            }
          }
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

  // Save Profile (Bio & Profile Picture) via React Query Mutation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    updateProfileMutation.mutate(
      {
        bio: editBioInput.trim(),
        avatarUrl: editAvatarUrlInput.trim() || undefined,
      },
      {
        onSuccess: (data) => {
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
          setIsSavingProfile(false);
        },
        onError: (err) => {
          console.error("Failed to save profile:", err);
          setIsSavingProfile(false);
        },
      }
    );
  };

  // Permanent Account & Data Deletion via React Query Mutation
  const handleDeleteAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDeletingAccount(true);
    setDeleteError(null);

    deleteAccountMutation.mutate(
      {
        email: user.email,
        reason: "User requested permanent deletion from profile settings",
      },
      {
        onSuccess: async () => {
          setShowDeleteModal(false);
          try {
            localStorage.clear();
          } catch {}
          await logout();
          router.push("/sign-in?deleted=true");
          setIsDeletingAccount(false);
        },
        onError: (err: any) => {
          console.error("Account deletion failed:", err);
          setDeleteError(err.message || "Failed to delete account. Please try again.");
          setIsDeletingAccount(false);
        },
      }
    );
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
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {user.university} &bull; {user.campus}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Eye size={13} />
              <span>Public Preview</span>
            </button>
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
          </div>
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
                  <h1 className="text-base font-extrabold text-black dark:text-white truncate">
                    {user.name}
                  </h1>
                  <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {user.studentId}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {user.program ? `${user.program} • ` : ""}{user.campus}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {user.role === "super_admin" ? (
                      <Link
                        href="/admin/super"
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                      >
                        Super Admin Console &rarr;
                      </Link>
                    ) : user.role === "campus_admin" ? (
                      <Link
                        href="/admin"
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                      >
                        Campus Admin Panel &rarr;
                      </Link>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        Student
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Tag */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-xl">
                  <span className="text-xs font-bold text-black dark:text-white">
                    {profileUniversity}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                  Campus Member
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

            </div>

          {/* ======================================================== */}
          {/* PEER RATINGS & REPUTATION SUMMARY                        */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-black dark:text-white flex items-center gap-1.5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span>Peer Reviews & Trust Score</span>
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Honest feedback from carpools, marketplace deals, and campus services
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublicPreview(true)}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Profile</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black text-black dark:text-white">
                  {ratingData.totalReviews > 0 ? ratingData.averageRating.toFixed(1) : "0.0"}
                </span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= Math.round(ratingData.averageRating) && ratingData.totalReviews > 0
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-300 dark:text-zinc-700"
                        }
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    {ratingData.totalReviews > 0
                      ? `${ratingData.totalReviews} peer ${ratingData.totalReviews === 1 ? "review" : "reviews"}`
                      : "No peer reviews yet"}
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Student Member
              </span>
            </div>

            {/* Recent Peer Feedback List */}
            {ratingData.reviews.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Recent Peer Comments
                </div>
                <div className="space-y-2">
                  {ratingData.reviews.slice(0, 3).map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-black dark:text-white">
                          {r.rater_name || "Student"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={
                                s <= Number(r.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic text-center py-2">
                You have not received any peer reviews yet. Complete rides or marketplace exchanges with peers to build your reviews.
              </p>
            )}
          </div>



          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* DANGER ZONE / ACCOUNT DELETION                           */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-[#121214] border border-red-200 dark:border-red-950/70 rounded-2xl p-5 shadow-2xs space-y-3 transition-colors">
            <div>
              <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Trash2 size={15} />
                <span>Delete Account</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Permanently delete your account and personal data.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteModal(true);
                }}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Trash2 size={14} />
                <span>Delete Account</span>
              </button>
            </div>
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
                    Show your profile bio to campus peers
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
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut size={15} />
                  <span>Sign Out</span>
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
        {/* MODAL 2: PERMANENT ACCOUNT DELETION CONFIRMATION        */}
        {/* ======================================================== */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-extrabold text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Trash2 size={18} />
                  <span>Delete Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Your account and all data will be deleted permanently. This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs h-9 px-4 rounded-xl cursor-pointer"
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDeleteAccount()}
                  disabled={isDeletingAccount}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-9 px-4 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Public Profile Preview Modal */}
        {showPublicPreview && (
          <StudentProfileModal
            isOpen={showPublicPreview}
            onClose={() => setShowPublicPreview(false)}
            userId={user.userId || user.email || user.name}
            fallbackName={user.name}
          />
        )}
      </div>
    </MobileShell>
  );
}
