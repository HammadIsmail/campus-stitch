import * as React from "react";
import { ShieldCheck, ShieldAlert, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified?: boolean;
  status?: "unverified" | "pending" | "verified" | "rejected";
  size?: "xs" | "sm" | "md";
  showText?: boolean;
  className?: string;
}

export function VerificationBadge({
  isVerified = false,
  status,
  size = "xs",
  showText = true,
  className,
}: VerificationBadgeProps) {
  // Determine effective status
  const currentStatus =
    status || (isVerified ? "verified" : "unverified");

  if (currentStatus === "verified") {
    return (
      <span
        title="Verified Student Account"
        className={cn(
          "inline-flex items-center gap-1 font-bold rounded-full select-none transition-colors",
          size === "xs" && "text-[10px] px-2 py-0.5",
          size === "sm" && "text-xs px-2.5 py-0.5",
          size === "md" && "text-sm px-3 py-1",
          "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700",
          className
        )}
      >
        <ShieldCheck
          size={size === "xs" ? 11 : size === "sm" ? 13 : 15}
          className="text-black dark:text-white stroke-[2.5px]"
        />
        {showText && <span>Verified</span>}
      </span>
    );
  }

  if (currentStatus === "pending") {
    return (
      <span
        title="Student ID Verification Under Review"
        className={cn(
          "inline-flex items-center gap-1 font-bold rounded-full select-none transition-colors",
          size === "xs" && "text-[10px] px-2 py-0.5",
          size === "sm" && "text-xs px-2.5 py-0.5",
          size === "md" && "text-sm px-3 py-1",
          "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
          className
        )}
      >
        <Clock
          size={size === "xs" ? 11 : size === "sm" ? 13 : 15}
          className="stroke-[2.2px] animate-pulse"
        />
        {showText && <span>Pending Review</span>}
      </span>
    );
  }

  // Default: unverified
  return (
    <span
      title="Unverified Student Account"
      className={cn(
        "inline-flex items-center gap-1 font-bold rounded-full select-none transition-colors",
        size === "xs" && "text-[10px] px-2 py-0.5",
        size === "sm" && "text-xs px-2.5 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        className
      )}
    >
      <ShieldAlert
        size={size === "xs" ? 11 : size === "sm" ? 13 : 15}
        className="stroke-[2.2px]"
      />
      {showText && <span>Unverified</span>}
    </span>
  );
}
