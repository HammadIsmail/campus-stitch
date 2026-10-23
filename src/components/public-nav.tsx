"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Tag,
  Building2,
  Users,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface PublicNavProps {
  onDownloadClick?: () => void;
}

export function PublicNav({ onDownloadClick }: PublicNavProps) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const links = [
    { name: "Overview", href: "/home" },
    { name: "Commute", href: "/commute", icon: Compass },
    { name: "Market", href: "/market", icon: Tag },
    { name: "Hostels", href: "/hostel", icon: Building2 },
    { name: "Community", href: "/community", icon: Users },
    { name: "Safety", href: "/safety", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#0c0c0e]/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="CampuStitch"
            className="w-9 h-9 rounded-xl object-cover shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[18px] tracking-tight text-zinc-950 dark:text-white leading-none">
                CampuStitch
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Pakistan
              </span>
            </div>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              University Student SuperApp
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-zinc-700" />
            )}
          </button>

          {/* Direct Download App */}
          <a
            href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Smartphone size={13} />
            <span>Download App</span>
          </a>

          {/* Sign In */}
          <Link
            href="/sign-in"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>

          {/* Create Account CTA */}
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xs"
          >
            <span>Join Campus</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile Menu & Theme button */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={14} className="text-amber-400" />
            ) : (
              <Moon size={14} className="text-zinc-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800"
                  )}
                >
                  {Icon && <Icon size={14} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <a
              href="https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5"
            >
              <Smartphone size={14} />
              <span>Download Android APK (50.2 MB)</span>
            </a>
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
            >
              Create Student Account
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              Sign In to Your Campus
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
