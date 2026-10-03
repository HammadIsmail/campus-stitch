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
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div>
            <div className="font-bold text-lg tracking-tight text-black">
              Student Marketplace
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              UET Lahore · Direct student-to-student
            </div>
          </div>
          <Link
            href="/market/sell"
            className="h-9 px-3.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95"
          >
            <Plus size={14} className="stroke-[2.5px]" />
            Sell Item
          </Link>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2.5 h-10 px-3 bg-white border border-zinc-300 rounded-xl shadow-2xs focus-within:border-black">
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              aria-label="Search marketplace"
              placeholder="Search items at UET (coolers, desks, calculators...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 border-0 outline-none bg-transparent text-xs text-black placeholder:text-zinc-400"
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
                    ? "bg-black text-white shadow-2xs"
                    : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
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
              className="p-3 bg-white border border-zinc-200 rounded-xl hover:border-black transition-all shadow-2xs"
            >
              <div className="text-xs font-bold text-black flex items-center gap-1.5">
                <Sparkles size={14} className="text-black" />
                Graduation Sale
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Senior pass-out bundles
              </div>
            </Link>
            <Link
              href="/market/shared"
              className="p-3 bg-white border border-zinc-200 rounded-xl hover:border-black transition-all shadow-2xs"
            >
              <div className="text-xs font-bold text-black flex items-center gap-1.5">
                <Users size={14} className="text-black" />
                Shared Ownership
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Co-own items with roommates
              </div>
            </Link>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 && !loading ? (
            <div className="py-12 px-4 text-center bg-white border border-zinc-200 rounded-xl space-y-3 shadow-2xs">
              <Package size={36} className="mx-auto text-zinc-400 stroke-[1.5px]" />
              <div className="text-sm font-bold text-black">No listings found</div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {searchQuery
                  ? `No items match "${searchQuery}".`
                  : "No items have been listed in the student marketplace yet."}
              </p>
              <Link
                href="/market/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-2xs"
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
                  className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs flex flex-col hover:border-black transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setOfferAmount(String(Math.round(Number(item.price) * 0.9)));
                  }}
                >
                  <div className="h-32 bg-zinc-100 flex flex-col items-center justify-center text-xs text-zinc-500 relative overflow-hidden">
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
                          className="text-zinc-400 stroke-[1.5px]"
                        />
                        <span className="text-[10px] mt-1 text-zinc-400">
                          Campus Photo
                        </span>
                      </>
                    )}
                    {item.status !== "available" && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black text-white uppercase tracking-wider">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-sm font-extrabold text-black">
                      Rs. {Number(item.price).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-black mt-0.5 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1 truncate">
                      {item.location} · {item.condition}
                    </div>
                    <div className="text-[10px] text-black font-semibold mt-2 pt-1.5 border-t border-zinc-100 flex items-center gap-1">
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <div className="font-bold text-base text-black truncate pr-2">
                  {selectedItem.title}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="h-48 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={40} className="text-zinc-400" />
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-black">
                    Rs. {Number(selectedItem.price).toLocaleString()}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 font-bold text-black">
                    {selectedItem.condition}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-1">
                  <div>
                    <b>Location:</b> {selectedItem.location}
                  </div>
                  <div>
                    <b>Category:</b> {selectedItem.category}
                  </div>
                  <div>
                    <b>Seller:</b> {selectedItem.seller_name}{" "}
                    <span className="inline-flex items-center gap-0.5 text-black font-semibold ml-1">
                      <ShieldCheck size={11} className="stroke-[2.5px]" />{" "}
                      Verified
                    </span>
                  </div>
                </div>

                {offerSuccess ? (
                  <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Offer sent to {selectedItem.seller_name}!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendOffer} className="space-y-2.5 pt-1">
                    <div className="text-xs font-bold text-black">
                      Make an Offer (PKR)
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="e.g. 1600"
                        className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-xs text-black focus:outline-none focus:border-black font-semibold"
                      />
                      <Button
                        type="submit"
                        className="h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Send Offer
                      </Button>
                    </div>
                  </form>
                )}

                <div className="flex gap-2 pt-2 border-t border-zinc-100">
                  <Link
                    href={`/messages?context=listing&id=${selectedItem.id}`}
                    className="flex-1 h-10 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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
