"use client";

import Link from "next/link";
import { MessageSquare, Bell, ArrowLeft, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  showClose?: boolean;
  closeHref?: string;
  actions?: React.ReactNode;
  rightText?: string;
  className?: string;
}

export function AppHeader({
  title = "CampuStitch",
  subtitle,
  showBack,
  backHref = "/",
  showClose,
  closeHref = "/",
  actions,
  rightText,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-2.5 flex-none bg-white border-b border-[#E4E7EC] min-h-[56px] z-20",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <Link
            href={backHref}
            aria-label="Back"
            className="w-10 h-10 -ml-1.5 flex items-center justify-center text-[#101828] hover:bg-[#F2F4F7] rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft size={22} className="stroke-[1.8px]" />
          </Link>
        )}

        {showClose && (
          <Link
            href={closeHref}
            aria-label="Close"
            className="w-10 h-10 -ml-1.5 flex items-center justify-center text-[#101828] hover:bg-[#F2F4F7] rounded-full transition-colors active:scale-95"
          >
            <X size={22} className="stroke-[1.8px]" />
          </Link>
        )}

        <div className="min-w-0">
          <div className="font-bold text-[18px] tracking-[-0.01em] text-[#101828] truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-[#5B6472] font-medium truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {actions ? (
          actions
        ) : rightText ? (
          <span className="text-xs font-semibold text-[#5B6472]">
            {rightText}
          </span>
        ) : (
          !showBack &&
          !showClose && (
            <>
              <button
                type="button"
                aria-label="Messages"
                onClick={() =>
                  alert("Messages feature: 2 new messages from Ahmed & Sara")
                }
                className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors relative"
              >
                <MessageSquare size={19} className="stroke-[1.8px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black" />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() =>
                  alert("Notifications: Ride confirmed for tomorrow 8:00 AM")
                }
                className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors relative"
              >
                <Bell size={19} className="stroke-[1.8px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-400" />
              </button>
            </>
          )
        )}
      </div>
    </header>
  );
}

export function UniversityBadge({
  university = "UET Lahore",
  isVerified = true,
}: {
  university?: string;
  isVerified?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
      <span>{university}</span>
      {isVerified && (
        <span className="text-black font-semibold inline-flex items-center gap-1 text-[11px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
          <ShieldCheck size={12} className="stroke-[2.2px]" />
          Verified student
        </span>
      )}
    </div>
  );
}
