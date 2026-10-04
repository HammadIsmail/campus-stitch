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
  hideNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  const pathname = usePathname();
  const isAuthPage =
    hideNav ||
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    Boolean(pathname?.startsWith("/sign-in")) ||
    Boolean(pathname?.startsWith("/sign-up")) ||
    Boolean(pathname?.startsWith("/login"));

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#09090B] flex flex-col antialiased selection:bg-black selection:text-white">
      {/* ======================================================== */}
      {/* TOP GLOBAL WEB APP NAVIGATION HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div
          className={cn(
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4",
            isAuthPage ? "justify-center sm:justify-start" : "justify-between"
          )}
        >
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

          {/* Desktop Navigation Links (Hidden on Auth Pages) */}
          {!isAuthPage && (
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
          )}

          {/* Quick Actions (Search, Messages, Notifications, Profile) - Hidden on Auth Pages */}
          {!isAuthPage && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Campus Search (Desktop Only, Hidden on Mobile & Auth Pages) */}
              <Link
                href="/assistant"
                className="hidden lg:flex items-center gap-2 h-9 px-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-black rounded-lg text-xs font-medium transition-colors border border-zinc-200"
              >
                <Search size={13} className="text-zinc-500" />
                <span>Search campus...</span>
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
            </div>
          )}
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
      {/* FLOATING URDU VOICE SEARCH (MOBILE ONLY, HIDDEN ON DESKTOP & AUTH) */}
      {/* ======================================================== */}
      {!isAuthPage && pathname !== "/voice" && (
        <Link
          href="/voice"
          aria-label="Campus Voice Search Assistant"
          title="Search by Voice or Text (Urdu / English)"
          className="md:hidden fixed z-40 bottom-20 right-4 w-12 h-12 rounded-full bg-black text-white hover:bg-zinc-800 shadow-[0_6px_24px_rgba(0,0,0,0.3)] border border-zinc-700/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <span className="absolute -inset-0.5 rounded-full bg-black/20 animate-ping pointer-events-none" />
          <Mic
            size={22}
            className="stroke-[2.2px] group-hover:scale-110 transition-transform relative z-10"
          />
          <span className="sr-only">Voice Search Assistant</span>
        </Link>
      )}

      {/* ======================================================== */}
      {/* CLASSIC MONOCHROME WEB APP FOOTER (HIDDEN ON AUTH PAGES) */}
      {/* ======================================================== */}
      {!isAuthPage && (
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
      )}
    </div>
  );
}
