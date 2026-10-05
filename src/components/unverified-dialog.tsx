"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ShieldCheck, ArrowRight, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function UnverifiedDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Only check in client browser
    if (typeof window === "undefined") return;

    // Do not show on auth pages or verify page itself
    if (
      pathname?.startsWith("/sign-in") ||
      pathname?.startsWith("/sign-up") ||
      pathname?.startsWith("/verify")
    ) {
      setIsOpen(false);
      return;
    }

    const shouldShow = localStorage.getItem("campus_stitch_show_verify_prompt");
    if (shouldShow === "true" && user && !user.isVerified) {
      setIsOpen(true);
    }
  }, [user, pathname]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("campus_stitch_show_verify_prompt");
    }
    setIsOpen(false);
  };

  const handleVerifyNow = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("campus_stitch_show_verify_prompt");
    }
    setIsOpen(false);
    router.push("/verify");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#121215] border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Icon Header */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            Account Created — You are Unverified
          </h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Welcome to <strong className="text-foreground">Campus Stitch</strong>! Your student account is active, but currently carries an{" "}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Unverified
            </span>{" "}
            badge.
          </p>
        </div>

        {/* Informational Perks / Trust Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Why verify your student status?
          </div>
          <ul className="space-y-1.5 text-muted-foreground text-[11px]">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Build instant trust when offering/booking carpool rides</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Get the official green Verified Student badge on all posts</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Unlock verified-only roommate listings and safe campus marketplace</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <Button
            onClick={handleVerifyNow}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Yourself Now (Takes ~1 min)
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue as Unverified
          </button>
        </div>
      </div>
    </div>
  );
}
