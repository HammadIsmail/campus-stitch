"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Compass,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Bike,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

interface NotificationItem {
  id: string;
  type: "ride" | "market" | "bike" | "verification";
  title: string;
  message: string;
  time: string;
  deeplink: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const FILTER_TABS = ["All", "Rides", "Market", "Verification"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState("All");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("campus_stitch_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("campus_stitch_notifications", JSON.stringify(updated));
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Rides")
      return n.type === "ride" || n.type === "bike";
    if (selectedFilter === "Market") return n.type === "market";
    if (selectedFilter === "Verification") return n.type === "verification";
    return true;
  });

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-bold text-lg tracking-tight text-black">
              Notifications
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              Updates on rides, items, and verification
            </div>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-semibold text-black hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 px-4 py-3 bg-white border-b border-zinc-200 overflow-x-auto scrollbar-none flex-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === tab
                  ? "bg-black text-white shadow-2xs"
                  : "bg-zinc-100 hover:bg-zinc-200/70 text-zinc-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 max-w-xl mx-auto w-full">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={item.deeplink}
                className={`block p-4 rounded-xl transition-all shadow-2xs border ${
                  item.read
                    ? "bg-white border-zinc-200 hover:border-zinc-300"
                    : "bg-white border-black ring-1 ring-black/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-black">
                    {item.type === "ride" && <Compass size={18} />}
                    {item.type === "bike" && <Bike size={18} />}
                    {item.type === "market" && <Tag size={18} />}
                    {item.type === "verification" && <ShieldCheck size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-black truncate flex items-center gap-1.5">
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        )}
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="text-[11px] font-semibold text-black mt-2 flex items-center gap-1 hover:underline">
                      <span>View details</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </main>
      </div>
    </MobileShell>
  );
}
