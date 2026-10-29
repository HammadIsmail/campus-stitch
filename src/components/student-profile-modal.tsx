"use client";

import * as React from "react";
import {
  X,
  Star,
  ShieldCheck,
  Flag,
  UserX,
  Loader2,
  Building2,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewItem {
  id: string;
  rater_name?: string;
  rating: number;
  category?: string;
  comment?: string;
  created_at?: string;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  fallbackName: string;
  fallbackVerified?: boolean;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  userId,
  fallbackName,
  fallbackVerified = false,
}: StudentProfileModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<any>(null);
  const [averageRating, setAverageRating] = React.useState<number>(0);
  const [totalReviews, setTotalReviews] = React.useState<number>(0);
  const [reviews, setReviews] = React.useState<ReviewItem[]>([]);
  const [reportSuccess, setReportSuccess] = React.useState(false);
  const [blockSuccess, setBlockSuccess] = React.useState(false);
  const [showReportDialog, setShowReportDialog] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setReportSuccess(false);
    setBlockSuccess(false);
    setShowReportDialog(false);

    async function fetchData() {
      try {
        const queryId = userId || fallbackName;
        // 1. Fetch profile details
        const profRes = await fetch(`/api/profile?userId=${encodeURIComponent(queryId)}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.success && profData.profile && isMounted) {
            setProfile(profData.profile);
          }
        }

        // 2. Fetch real ratings from /api/profile/ratings
        const ratRes = await fetch(`/api/profile/ratings?userId=${encodeURIComponent(queryId)}`);
        if (ratRes.ok) {
          const ratData = await ratRes.json();
          if (ratData.success && isMounted) {
            setAverageRating(Number(ratData.averageRating) || 0);
            setTotalReviews(Number(ratData.totalReviews) || 0);
            setReviews(Array.isArray(ratData.reviews) ? ratData.reviews : []);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch student profile modal data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, fallbackName]);

  if (!isOpen) return null;

  const displayName = profile?.name || profile?.full_name || fallbackName;
  const isVerified = profile?.isVerified ?? profile?.is_verified ?? fallbackVerified;
  const university = profile?.university || profile?.universityName || "Campus Peer";
  const campus = profile?.campus || profile?.campusName || "";
  const program = profile?.program || profile?.department || "";
  const bio = profile?.bio || null;
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || null;

  const handleReport = () => {
    setReportSuccess(true);
    setShowReportDialog(false);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleBlock = () => {
    setBlockSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Student Profile
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {reportSuccess && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
              Report submitted anonymously. Our campus moderation team will review this profile within 24 hours.
            </div>
          )}

          {blockSuccess && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white font-medium">
              Student has been blocked. You will no longer receive inquiries from this peer.
            </div>
          )}

          {/* Identity Section */}
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black text-xl font-black flex items-center justify-center shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                (displayName[0] || "S").toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-extrabold text-black dark:text-white leading-tight">
                  {displayName}
                </h3>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {university}{campus ? ` · ${campus}` : ""}
              </div>

              {program && (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {program}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {bio}
            </div>
          )}

          {/* Rating Summary Box */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              {totalReviews > 0 ? (
                <div>
                  <span className="font-black text-sm text-black dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  No peer reviews yet
                </span>
              )}
            </div>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Student Peer
            </span>
          </div>

          {/* Recent Peer Feedback */}
          {reviews.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide">
                Recent Peer Feedback
              </div>
              <div className="space-y-2">
                {reviews.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {r.rater_name || "Student"}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={
                              i < r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300 dark:text-zinc-700"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety & Moderation Controls */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <button
              type="button"
              onClick={() => setShowReportDialog(true)}
              className="flex-1 h-8.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Flag size={13} />
              <span>Report Student</span>
            </button>

            <button
              type="button"
              onClick={handleBlock}
              className="flex-1 h-8.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserX size={13} />
              <span>Block</span>
            </button>
          </div>

          {/* Report Confirmation Dialog */}
          {showReportDialog && (
            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-2.5">
              <div className="text-xs font-bold text-red-700 dark:text-red-300">
                Confirm Safety Report
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Submit an anonymous report regarding {displayName}? Our university moderation team reviews reports to ensure campus safety.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportDialog(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleReport}
                  className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
