"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Mic,
  Compass,
  Tag,
  Building2,
  Users,
  Plus,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: null },
  { name: "Commute", href: "/commute", icon: Compass },
  { name: "Marketplace", href: "/market", icon: Tag },
  { name: "Hostel", href: "/hostel", icon: Building2 },
  { name: "Community", href: "/community", icon: Users },
];

export function MobileShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#09090B] flex flex-col antialiased selection:bg-black selection:text-white">
      {/* ======================================================== */}
      {/* TOP GLOBAL WEB APP NAVIGATION HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Classic Monogram Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm tracking-widest shadow-xs group-hover:bg-zinc-800 transition-colors">
                CS
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-[18px] tracking-tight text-black leading-none">
                  CampuStitch
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mt-0.5">
                  UET Lahore
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-black text-white shadow-2xs font-bold"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-100",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions (Search, Messages, Notifications, Profile, Offer Ride) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* AI Assistant Quick Search */}
            <Link
              href="/assistant"
              className="hidden lg:flex items-center gap-2 h-9 px-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-black rounded-lg text-xs font-medium transition-colors border border-zinc-200"
            >
              <Search size={13} className="text-zinc-500" />
              <span>Ask Student AI...</span>
              <kbd className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-zinc-300 font-mono text-zinc-500 shadow-2xs">
                ⌘K
              </kbd>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              title="Messages"
              aria-label="Messages"
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors relative",
                pathname.startsWith("/messages")
                  ? "bg-black text-white border-black"
                  : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-black",
              )}
            >
              <MessageSquare size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black ring-1 ring-white" />
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              title="Notifications"
              aria-label="Notifications"
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors relative",
                pathname.startsWith("/notifications")
                  ? "bg-black text-white border-black"
                  : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-black",
              )}
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black ring-1 ring-white" />
            </Link>

            {/* Profile / Account */}
            <Link
              href="/profile"
              title="Student Profile"
              aria-label="Student Profile"
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors",
                pathname.startsWith("/profile")
                  ? "bg-black text-white border-black"
                  : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-black",
              )}
            >
              <User size={16} />
            </Link>

            {/* Offer Ride CTA */}
            <Link
              href="/commute/offer"
              className="h-9 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ml-0.5"
            >
              <Plus size={14} className="stroke-[2.5px]" />
              <span className="hidden sm:inline">Offer Ride</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN APPLICATION CONTENT AREA */}
      {/* ======================================================== */}
      <main className="w-full flex-1 flex flex-col items-center">
        <div className="w-full max-w-6xl xl:max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex-1 flex flex-col">
          <div
            className={cn(
              "w-full bg-white sm:rounded-2xl sm:border border-[#E4E4E7] sm:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:overflow-hidden flex flex-col flex-1",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* FLOATING URDU VOICE AI BUTTON (BOTTOM RIGHT FOR MOBILE & WEB) */}
      {/* ======================================================== */}
      {pathname !== "/voice" && (
        <Link
          href="/voice"
          aria-label="Urdu Voice Assistant"
          title="Ask by Voice (Urdu / English)"
          className="fixed z-40 bottom-20 md:bottom-8 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white hover:bg-zinc-800 shadow-[0_6px_24px_rgba(0,0,0,0.3)] border border-zinc-700/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <Mic
            size={22}
            className="stroke-[2.2px] group-hover:scale-110 transition-transform"
          />
          <span className="sr-only">Voice Assistant</span>
        </Link>
      )}

      {/* ======================================================== */}
      {/* CLASSIC MONOCHROME WEB APP FOOTER */}
      {/* ======================================================== */}
      <footer className="hidden md:block w-full bg-white border-t border-[#E4E4E7] py-6 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="font-bold text-black">CampuStitch</span>
            <span>— The Student Commute & Campus Marketplace Platform</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-zinc-600">
            <Link
              href="/commute"
              className="hover:text-black transition-colors"
            >
              Commute
            </Link>
            <Link href="/market" className="hover:text-black transition-colors">
              Marketplace
            </Link>
            <Link href="/hostel" className="hover:text-black transition-colors">
              Hostel
            </Link>
            <Link
              href="/community"
              className="hover:text-black transition-colors"
            >
              Community
            </Link>
            <Link href="/admin" className="hover:text-black transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
