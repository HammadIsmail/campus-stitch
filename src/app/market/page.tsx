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
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, Listing } from "@/lib/data-service";
import { useAuth } from "@/lib/auth-context";
import { MapPin, Star } from "lucide-react";
import { useMarketListingsQuery } from "@/hooks/use-market-queries";
import { useQueryClient } from "@tanstack/react-query";
import { StudentProfileModal } from "@/components/student-profile-modal";
import { ReviewModal } from "@/components/review-modal";

const CATEGORIES = ["All", "Electronics", "Hostel", "Books", "Furniture"];

export default function MarketPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Student Profile & Review Modals State
  const [profileModalTarget, setProfileModalTarget] = React.useState<{
    userId?: string;
    name: string;
    isVerified?: boolean;
  } | null>(null);

  const [reviewModalTarget, setReviewModalTarget] = React.useState<{
    userId: string;
    name: string;
  } | null>(null);

  // Modern React 19 useDeferredValue for responsive keystroke handling
  // Official doc: https://react.dev/reference/react/useDeferredValue
  const deferredSearch = React.useDeferredValue(searchQuery);
  const isSearchPending = searchQuery !== deferredSearch;

  const [selectedItem, setSelectedItem] = React.useState<Listing | null>(null);
  const [offerAmount, setOfferAmount] = React.useState("");
  const [offerSuccess, setOfferSuccess] = React.useState(false);

  // Edit Listing Modal State
  const [editingItem, setEditingItem] = React.useState<Listing | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editPrice, setEditPrice] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("Electronics");
  const [editCondition, setEditCondition] = React.useState("Good");
  const [editLocation, setEditLocation] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [isUpdatingListing, setIsUpdatingListing] = React.useState(false);

  const openEditModal = (item: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title);
    setEditPrice(String(item.price));
    setEditCategory(item.category || "Electronics");
    setEditCondition(item.condition || "Good");
    setEditLocation(item.location || "");
    setEditDescription(item.description || "");
  };

  const handleDeleteListing = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await fetch(`/api/market?id=${itemId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["market_listings"] });
      if (selectedItem?.id === itemId) setSelectedItem(null);
    } catch (err) {
      console.warn("Delete listing error:", err);
    }
  };

  const handleSaveEditListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    setIsUpdatingListing(true);
    try {
      await fetch("/api/market", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle.trim(),
          price: Number(editPrice),
          category: editCategory,
          condition: editCondition,
          location: editLocation.trim(),
          description: editDescription.trim(),
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["market_listings"] });
      if (selectedItem?.id === editingItem.id) {
        setSelectedItem({
          ...selectedItem,
          title: editTitle.trim(),
          price: Number(editPrice),
          category: editCategory as Listing["category"],
          condition: editCondition as Listing["condition"],
          location: editLocation.trim(),
          description: editDescription.trim(),
        });
      }
    } catch (err) {
      console.warn("Update listing error:", err);
    } finally {
      setIsUpdatingListing(false);
      setEditingItem(null);
    }
  };

  const { data: listings = [], isLoading: loading } = useMarketListingsQuery(
    user?.campusId,
    selectedCategory
  );

  const filteredItems = React.useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [listings, selectedCategory, deferredSearch]);

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
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <MapPin size={11} className="text-zinc-400" />
              <span>{user?.campusName || "Main Campus"} &bull; {user?.universityName || "UET Lahore"}</span>
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
            {isSearchPending ? (
              <Loader2 size={16} className="text-zinc-400 dark:text-zinc-500 animate-spin shrink-0" />
            ) : (
              <Search size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            )}
            <input
              aria-label="Search marketplace"
              placeholder="Search items at UET (coolers, desks, calculators...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 border-0 outline-none bg-transparent text-xs text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
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
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-4 transition-opacity duration-150 ${isSearchPending ? "opacity-60" : "opacity-100"}`}>
              {filteredItems.map((item) => {
                const isMine =
                  (user?.userId && item.seller_id === user.userId) ||
                  (user?.name && item.seller_name?.toLowerCase().trim() === user.name.toLowerCase().trim());

                return (
                  <div
                    key={item.id}
                    className="group relative bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs flex flex-col hover:border-black dark:hover:border-white transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setOfferAmount(String(Math.round(Number(item.price) * 0.9)));
                    }}
                  >
                    {isMine && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-xs p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={(e) => openEditModal(item, e)}
                          title="Edit Listing"
                          className="p-1 rounded text-white hover:bg-white/20 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteListing(item.id, e)}
                          title="Delete Listing"
                          className="p-1 rounded text-red-400 hover:bg-white/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
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
                      <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileModalTarget({
                              userId: item.seller_id,
                              name: item.seller_name || "Student",
                              isVerified: item.seller_verified,
                            });
                          }}
                          className="text-zinc-600 dark:text-zinc-300 font-semibold truncate max-w-[110px] hover:text-black dark:hover:text-white hover:underline text-left cursor-pointer"
                        >
                          {item.seller_name || "Student"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* ITEM DETAIL & MAKE OFFER MODAL / DRAWER                  */}
        {/* ======================================================== */}
        {selectedItem && (() => {
          const isDrawerMine =
            (user?.userId && selectedItem.seller_id === user.userId) ||
            (user?.name && selectedItem.seller_name?.toLowerCase().trim() === user.name.toLowerCase().trim());

          return (
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

                  <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div>
                      <b>Location:</b> {selectedItem.location}
                    </div>
                    <div>
                      <b>Category:</b> {selectedItem.category}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <b>Seller:</b>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalTarget({
                              userId: selectedItem.seller_id,
                              name: selectedItem.seller_name || "Student",
                              isVerified: selectedItem.seller_verified,
                            });
                          }}
                          className="hover:underline font-bold text-black dark:text-white cursor-pointer"
                        >
                          {selectedItem.seller_name}
                        </button>
                      </div>

                      {!isDrawerMine && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalTarget({
                              userId: selectedItem.seller_id || selectedItem.seller_name,
                              name: selectedItem.seller_name,
                            });
                          }}
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>Rate Seller</span>
                        </button>
                      )}
                    </div>
                    {selectedItem.description && (
                      <div className="pt-1 text-zinc-500 dark:text-zinc-400">
                        {selectedItem.description}
                      </div>
                    )}
                  </div>

                  {/* Policy Rule Notice */}
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Campus Rule: All payments and exchanges are conducted directly between students in cash. No in-app payment processing or online checkout exists on this platform.
                  </div>

                  {isDrawerMine ? (
                    <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={(e) => openEditModal(selectedItem, e)}
                        className="flex-1 h-10 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                        <span>Edit Listing</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteListing(selectedItem.id, e)}
                        className="h-10 px-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <>
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
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalTarget({
                              userId: selectedItem.seller_id,
                              name: selectedItem.seller_name || "Student",
                              isVerified: selectedItem.seller_verified,
                            });
                          }}
                          className="px-4 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Profile</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* EDIT LISTING MODAL                                       */}
        {/* ======================================================== */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <Pencil size={16} />
                  <span>Edit Listing</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditListing} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Condition
                    </label>
                    <select
                      value={editCondition}
                      onChange={(e) => setEditCondition(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="e.g. Hostel 3, Room 12"
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isUpdatingListing}
                    className="flex-1 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    {isUpdatingListing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        {profileModalTarget && (
          <StudentProfileModal
            isOpen={!!profileModalTarget}
            onClose={() => setProfileModalTarget(null)}
            userId={profileModalTarget.userId}
            fallbackName={profileModalTarget.name}
            fallbackVerified={profileModalTarget.isVerified}
          />
        )}

        {/* Review Modal */}
        {reviewModalTarget && (
          <ReviewModal
            isOpen={!!reviewModalTarget}
            onClose={() => setReviewModalTarget(null)}
            targetUserId={reviewModalTarget.userId}
            targetName={reviewModalTarget.name}
            defaultCategory="marketplace"
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
