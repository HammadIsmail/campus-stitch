"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Tag, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  matchExact?: boolean;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home, matchExact: true },
  { name: "Commute", href: "/commute", icon: Compass },
  { name: "Market", href: "/market", icon: Tag },
  { name: "Hostel", href: "/hostel", icon: Building2 },
  { name: "Community", href: "/community", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  const isAuthPage =
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

  if (isAuthPage) return null;

  return (
    <>
      {/* Invisible spacer so the fixed bottom bar never overlaps page content */}
      <div className="md:hidden h-16 w-full shrink-0" aria-hidden="true" />

      {/* Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md pb-2 pt-1.5 px-2 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        {navItems.map((item) => {
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 min-h-[50px] flex flex-col items-center justify-center gap-1 text-[11px] transition-colors rounded-lg active:scale-95",
                isActive
                  ? "font-bold text-black dark:text-white"
                  : "font-medium text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white",
              )}
            >
              <Icon
                size={20}
                className={cn(
                  "transition-transform",
                  isActive ? "stroke-[2.2px] scale-105" : "stroke-[1.8px]",
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
