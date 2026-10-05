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
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { NotificationsSlider } from "@/components/notifications-slider";

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
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const isAuthPage =
    hideNav ||
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify" ||
    Boolean(pathname?.startsWith("/sign-in")) ||
    Boolean(pathname?.startsWith("/sign-up")) ||
    Boolean(pathname?.startsWith("/login")) ||
    Boolean(pathname?.startsWith("/register")) ||
    Boolean(pathname?.startsWith("/forgot-password")) ||
    Boolean(pathname?.startsWith("/reset-password")) ||
    Boolean(pathname?.startsWith("/verify")) ||
    Boolean(pathname?.startsWith("/auth"));

  const isMessagesPage =
    pathname === "/messages" || Boolean(pathname?.startsWith("/messages"));
  const isCommunityPage =
    pathname === "/community" || Boolean(pathname?.startsWith("/community"));
  const isAppLayoutPage = isMessagesPage || isCommunityPage;

  return (
    <div
      className={cn(
        "bg-[#F7F7F8] dark:bg-[#09090b] text-[#09090B] dark:text-[#fafafa] flex flex-col antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200",
        isAppLayoutPage ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"
      )}
    >
      {/* ======================================================== */}
      {/* TOP GLOBAL WEB APP NAVIGATION HEADER (HIDDEN ON AUTH)    */}
      {/* ======================================================== */}
      {!isAuthPage && (
        <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border-b border-[#E4E4E7] dark:border-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Classic Monogram Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm tracking-widest shadow-xs group-hover:bg-zinc-800 dark:group-hover:bg-zinc-200 transition-colors">
                CS
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-[18px] tracking-tight text-black dark:text-white leading-none">
                  CampuStitch
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
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
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-2xs font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Quick Actions (Search, Messages, Notifications, Profile, Theme Toggle) - Hidden on Auth Pages */}
          {!isAuthPage && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Campus Search (Desktop Only, Hidden on Mobile & Auth Pages) */}
              <Link
                href="/assistant"
                className="hidden lg:flex items-center gap-2 h-9 px-3 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-lg text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                <Search size={13} className="text-zinc-500 dark:text-zinc-400" />
                <span>Search campus...</span>
                <kbd className="text-[9px] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-zinc-500 dark:text-zinc-400 shadow-2xs">
                  ⌘K
                </kbd>
              </Link>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle dark mode"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={16} className="text-amber-400 animate-in spin-in-180 duration-200" />
                ) : (
                  <Moon size={16} className="text-zinc-700 animate-in spin-in-180 duration-200" />
                )}
              </button>

              {/* Messages */}
              <Link
                href="/messages"
                title="Messages"
                aria-label="Messages"
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors relative",
                  pathname.startsWith("/messages")
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white",
                )}
              >
                <MessageSquare size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black dark:bg-white ring-1 ring-white dark:ring-black" />
              </Link>

              {/* Notifications Slider Toggle */}
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                title="Notifications"
                aria-label="Open notifications slider"
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors relative cursor-pointer",
                  isNotificationsOpen
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white",
                )}
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black dark:bg-white ring-1 ring-white dark:ring-black" />
              </button>

              {/* Profile / Account */}
              <Link
                href="/profile"
                title="Student Profile"
                aria-label="Student Profile"
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors",
                  pathname.startsWith("/profile")
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white",
                )}
              >
                <User size={16} />
              </Link>
            </div>
          )}
        </div>
      </header>
      )}

      {/* ======================================================== */}
      {/* MAIN APPLICATION CONTENT AREA */}
      {/* ======================================================== */}
      <main
        className={cn(
          "w-full flex-1 flex flex-col items-center min-h-0",
          isAppLayoutPage && "h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden",
          isAuthPage && "min-h-screen justify-center py-0"
        )}
      >
        <div
          className={cn(
            "w-full max-w-6xl xl:max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex-1 flex flex-col",
            isMessagesPage && "h-full py-0 sm:py-4 min-h-0 overflow-hidden",
            isCommunityPage && "h-full py-0 sm:py-2 min-h-0 overflow-hidden max-w-7xl xl:max-w-[1536px]",
            isAuthPage && "max-w-full px-0 sm:px-0 py-0 sm:py-0 justify-center items-center"
          )}
        >
          <div
            className={cn(
              "w-full bg-white dark:bg-[#121215] sm:rounded-2xl sm:border border-[#E4E4E7] dark:border-zinc-800 sm:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:overflow-hidden flex flex-col flex-1",
              isAppLayoutPage && "h-full min-h-0 overflow-hidden",
              isAuthPage && "sm:border-0 sm:rounded-none sm:shadow-none bg-transparent dark:bg-transparent justify-center",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* FLOATING URDU VOICE SEARCH (MOBILE ONLY, HIDDEN ON DESKTOP, AUTH, MESSAGES & COMMUNITY) */}
      {/* ======================================================== */}
      {!isAuthPage && !isAppLayoutPage && pathname !== "/voice" && (
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

      {/* Cart-style Notifications Slide-Over Drawer */}
      <NotificationsSlider
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
