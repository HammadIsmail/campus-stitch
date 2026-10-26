"use client";

import * as React from "react";
import { X, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName: string;
  defaultCategory?: "commute" | "marketplace" | "service" | "rental";
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  targetUserId,
  targetName,
  defaultCategory = "commute",
  onSuccess,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [category, setCategory] = React.useState(defaultCategory);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(0);
      setComment("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          raterId: user?.userId,
          raterName: user?.name || "Student Peer",
          raterStudentId: user?.studentId,
          rating,
          category,
          comment: comment.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSuccessMsg("Your review has been submitted successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="text-sm font-black text-black dark:text-white">
              Rate {targetName}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Honest peer ratings maintain campus safety and trust
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-1">
              <CheckCircle2 size={24} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                Review Published
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {successMsg}
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating Input */}
              <div className="text-center space-y-2 py-2">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-300 dark:text-zinc-700 stroke-[1.5px]"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  {rating === 5 && "Excellent (5 Stars)"}
                  {rating === 4 && "Good (4 Stars)"}
                  {rating === 3 && "Average (3 Stars)"}
                  {rating === 2 && "Below Average (2 Stars)"}
                  {rating === 1 && "Poor (1 Star)"}
                </div>
              </div>

              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                  Interaction Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(["commute", "marketplace", "service", "rental"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                        category === cat
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                  Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, item condition, or communication..."
                  rows={3}
                  maxLength={400}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              {/* Policy Notice */}
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                Notice: All payments and fuel splits are handled in person directly between students. Only submit reviews for completed exchanges.
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-9 text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
