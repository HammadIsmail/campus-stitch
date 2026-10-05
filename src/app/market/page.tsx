"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Tag,
  Sparkles,
  Users,
  ShieldCheck,
  Package,
  X,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Listing } from "@/lib/data-service";

const CATEGORIES = ["All", "Electronics", "Hostel", "Books", "Furniture"];

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<Listing | null>(null);
  const [offerAmount, setOfferAmount] = React.useState("");
  const [offerSuccess, setOfferSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadListings() {
      setLoading(true);
      const data = await DataService.getListings();
      setListings(data);
      setLoading(false);
    }
    loadListings();
  }, []);

  const filteredItems = listings.filter((item) => {
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || !selectedItem) return;
    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setOfferAmount("");
      setSelectedItem(null);
    }, 1500);
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
          <div>
            <div className="font-bold text-lg tracking-tight text-black dark:text-white">
              Student Marketplace
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              UET Lahore · Direct student-to-student
            </div>
          </div>
          <Link
            href="/market/sell"
            className="h-9 px-3.5 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95 cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5px]" />
            Sell Item
          </Link>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2.5 h-10 px-3 bg-white dark:bg-[#121215] border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-2xs focus-within:border-black dark:focus-within:border-white">
            <Search size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              aria-label="Search marketplace"
              placeholder="Search items at UET (coolers, desks, calculators...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 border-0 outline-none bg-transparent text-xs text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Category Chips Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-2xs"
                    : "bg-white dark:bg-[#121215] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Hub Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/market/graduation-sale"
              className="p-3 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs"
            >
              <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-black dark:text-white" />
                Graduation Sale
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Senior pass-out bundles
              </div>
            </Link>
            <Link
              href="/market/shared"
              className="p-3 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs"
            >
              <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                <Users size={14} className="text-black dark:text-white" />
                Shared Ownership
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Co-own items with roommates
              </div>
            </Link>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 && !loading ? (
            <div className="py-12 px-4 text-center bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-2xs">
              <Package size={36} className="mx-auto text-zinc-400 dark:text-zinc-500 stroke-[1.5px]" />
              <div className="text-sm font-bold text-black dark:text-white">No listings found</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                {searchQuery
                  ? `No items match "${searchQuery}".`
                  : "No items have been listed in the student marketplace yet."}
              </p>
              <Link
                href="/market/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Post First Item</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs flex flex-col hover:border-black dark:hover:border-white transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setOfferAmount(String(Math.round(Number(item.price) * 0.9)));
                  }}
                >
                  <div className="h-32 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Package
                          size={26}
                          className="text-zinc-400 dark:text-zinc-500 stroke-[1.5px]"
                        />
                        <span className="text-[10px] mt-1 text-zinc-400 dark:text-zinc-500">
                          Campus Photo
                        </span>
                      </>
                    )}
                    {item.status !== "available" && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black uppercase tracking-wider">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-sm font-extrabold text-black dark:text-white">
                      Rs. {Number(item.price).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-black dark:text-white mt-0.5 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                      {item.location} · {item.condition}
                    </div>
                    <div className="text-[10px] text-black dark:text-white font-semibold mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1">
                      <ShieldCheck size={11} className="stroke-[2.5px]" />
                      Verified Student
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* ITEM DETAIL & MAKE OFFER MODAL / DRAWER                  */}
        {/* ======================================================== */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#121215] rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="font-bold text-base text-black dark:text-white truncate pr-2">
                  {selectedItem.title}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={40} className="text-zinc-400 dark:text-zinc-500" />
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-black dark:text-white">
                    Rs. {Number(selectedItem.price).toLocaleString()}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-black dark:text-white">
                    {selectedItem.condition}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div>
                    <b>Location:</b> {selectedItem.location}
                  </div>
                  <div>
                    <b>Category:</b> {selectedItem.category}
                  </div>
                  <div>
                    <b>Seller:</b> {selectedItem.seller_name}{" "}
                    <span className="inline-flex items-center gap-0.5 text-black dark:text-white font-semibold ml-1">
                      <ShieldCheck size={11} className="stroke-[2.5px]" />{" "}
                      Verified
                    </span>
                  </div>
                </div>

                {offerSuccess ? (
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-black dark:text-white flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Offer sent to {selectedItem.seller_name}!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendOffer} className="space-y-2.5 pt-1">
                    <div className="text-xs font-bold text-black dark:text-white">
                      Make an Offer (PKR)
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="e.g. 1600"
                        className="flex-1 h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-semibold"
                      />
                      <Button
                        type="submit"
                        className="h-10 px-4 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Send Offer
                      </Button>
                    </div>
                  </form>
                )}

                <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/messages?context=listing&id=${selectedItem.id}`}
                    className="flex-1 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Chat with Seller</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
