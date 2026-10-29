"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Shield,
  Crown,
  LogOut,
  Layers,
  Car,
  Tag,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function CampusAdminPage() {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <MobileShell hideNav>
      <div className="w-full min-h-screen flex flex-col bg-background text-foreground select-none max-w-4xl mx-auto px-4 py-6">
        {/* Super Admin Top Banner */}
        {isSuperAdmin && (
          <div className="mb-4 p-3 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Crown size={15} />
              <span>Platform Super Administrator Mode</span>
            </div>
            <Link
              href="/admin/super"
              className="text-xs font-bold underline hover:opacity-80"
            >
              Go to Super Admin Console &rarr;
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground font-black text-base border border-border">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-foreground">
                  Campus Administration
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {user?.role === "super_admin" ? "Super Admin" : "Campus Admin"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={12} />
                <span>{user?.campusName || "Campus Tenant"} &bull; {user?.universityName || "University"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/services"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Enter App
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/services"
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-border hover:border-emerald-500/50 transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Wrench size={20} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Campus Services</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Oversee student services, laundry pickup, and repairs on campus.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-3 group-hover:translate-x-0.5 transition-transform">
                <span>View Services</span>
                <ArrowRight size={13} />
              </div>
            </Link>

            <Link
              href="/commute"
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-border hover:border-emerald-500/50 transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Car size={20} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Campus Commute</h2>
              <p className="text-xs text-muted-foreground mt-1">
                View active carpools, rickshaw splits, and daily campus routes.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-3 group-hover:translate-x-0.5 transition-transform">
                <span>View Rides</span>
                <ArrowRight size={13} />
              </div>
            </Link>

            <Link
              href="/market"
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-border hover:border-emerald-500/50 transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Tag size={20} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Marketplace</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Check active textbook listings, room coolers, and hostel items.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-3 group-hover:translate-x-0.5 transition-transform">
                <span>View Market</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
