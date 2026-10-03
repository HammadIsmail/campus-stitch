"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Package,
  Plus,
  Info,
  Check,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataService, SharedItem } from "@/lib/data-service";

export default function SharedOwnershipPage() {
  const [item, setItem] = React.useState<SharedItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [resalePrice, setResalePrice] = React.useState(2000);
  const [isAddingOwner, setIsAddingOwner] = React.useState(false);
  const [newOwnerName, setNewOwnerName] = React.useState("");
  const [newOwnerAmount, setNewOwnerAmount] = React.useState("1000");
  const [soldMessage, setSoldMessage] = React.useState(false);

  // Form states to create first shared item if empty
  const [isCreatingItem, setIsCreatingItem] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");
  const [createTotalCost, setCreateTotalCost] = React.useState("");
  const [firstOwnerName, setFirstOwnerName] = React.useState("");
  const [firstOwnerAmount, setFirstOwnerAmount] = React.useState("");

  React.useEffect(() => {
    async function loadItem() {
      setLoading(true);
      const items = await DataService.getSharedItems();
      if (items.length > 0) {
        setItem(items[0]);
        setResalePrice(items[0].current_valuation || items[0].total_cost);
      }
      setLoading(false);
    }
    loadItem();
  }, []);

  const handleCreateSharedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createTotalCost || !firstOwnerName.trim()) return;

    const total = Number(createTotalCost);
    const contrib = Number(firstOwnerAmount) || total;
    const newItem: SharedItem = {
      id: "sh_" + Date.now(),
      title: createTitle.trim(),
      total_cost: total,
      current_valuation: total,
      status: "active",
      owners: [
        {
          id: "o_1",
          name: firstOwnerName.trim(),
          initial: firstOwnerName.trim().charAt(0).toUpperCase() || "S",
          contribution_amount: contrib,
          share_percentage: Math.round((contrib / total) * 100),
        },
      ],
    };

    try {
      const stored = JSON.parse(localStorage.getItem("campus_stitch_shared_items") || "[]");
      stored.unshift(newItem);
      localStorage.setItem("campus_stitch_shared_items", JSON.stringify(stored));
    } catch {}

    setItem(newItem);
    setResalePrice(total);
    setIsCreatingItem(false);
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newOwnerName.trim()) return;

    const updated = await DataService.addSharedOwner(
      item.id,
      newOwnerName.trim(),
      Number(newOwnerAmount) || 500,
    );
    if (updated) {
      setItem({ ...updated });
      setIsAddingOwner(false);
      setNewOwnerName("");
    }
  };

  const handleSellItem = () => {
    setSoldMessage(true);
    setTimeout(() => setSoldMessage(false), 5000);
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center p-6 text-xs text-zinc-500">
          Loading shared item...
        </div>
      </MobileShell>
    );
  }

  if (!item) {
    return (
      <MobileShell>
        <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
          <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
            <Link
              href="/market"
              aria-label="Back"
              className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="stroke-[2px]" />
            </Link>
            <div className="flex-1 font-bold text-base tracking-tight text-black">
              Shared Ownership
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm mx-auto">
            <Users size={40} className="text-zinc-400 stroke-[1.5px]" />
            <div className="text-base font-bold text-black">No Shared Items Yet</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Co-own expensive hostel items (desert coolers, refrigerators, water dispensers) with your roommates. When you graduate, the platform automatically calculates fair payout splits.
            </p>

            {isCreatingItem ? (
              <form onSubmit={handleCreateSharedItem} className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-left space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-black border-b border-zinc-100 pb-2">
                  Create Shared Co-Owned Item
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Item Title</label>
                  <Input
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Super Asia Room Cooler"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Total Cost (Rs.)</label>
                  <Input
                    type="number"
                    value={createTotalCost}
                    onChange={(e) => setCreateTotalCost(e.target.value)}
                    placeholder="e.g. 12000"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">First Contributor Name</label>
                  <Input
                    value={firstOwnerName}
                    onChange={(e) => setFirstOwnerName(e.target.value)}
                    placeholder="e.g. Muhammad Hammad"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Your Contribution (Rs.)</label>
                  <Input
                    type="number"
                    value={firstOwnerAmount}
                    onChange={(e) => setFirstOwnerAmount(e.target.value)}
                    placeholder="e.g. 6000"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingItem(false)}
                    className="flex-1 text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black text-white hover:bg-zinc-800 text-xs font-bold h-9"
                  >
                    Save Item
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setIsCreatingItem(true)}
                className="h-10 px-5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Create First Shared Item
              </Button>
            )}
          </main>
        </div>
      </MobileShell>
    );
  }

  const perOwnerShare = Math.round(resalePrice / (item.owners.length || 1));

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/market"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Shared Item Co-Ownership
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5 max-w-xl mx-auto w-full">
          {/* Item Overview */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-14 h-14 shrink-0 rounded-lg bg-zinc-100 flex flex-col items-center justify-center text-xs text-zinc-500">
              <Package size={22} className="text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold text-black truncate">
                {item.title}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Bought for Rs. {item.total_cost.toLocaleString()} · {item.owners.length} owners
              </div>
            </div>
          </section>

          {/* Dynamic Owners List */}
          <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 text-xs font-bold text-black border-b border-zinc-100 flex justify-between items-center">
              <span>Co-Owners</span>
              <span className="text-[11px] font-semibold text-black bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                {item.owners.length} students
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {item.owners.map((owner) => (
                <div
                  key={owner.id}
                  className="flex items-center gap-3 min-h-[50px] px-4"
                >
                  <span className="w-8 h-8 rounded-full bg-zinc-100 text-black border border-zinc-300 text-xs font-bold flex items-center justify-center">
                    {owner.initial}
                  </span>
                  <span className="flex-1 text-xs font-bold text-black">
                    {owner.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Rs. {owner.contribution_amount.toLocaleString()}
                  </span>
                  <span className="w-12 text-right text-xs font-extrabold text-black">
                    {owner.share_percentage}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Add Owner Drawer / Form */}
          {isAddingOwner && (
            <div className="p-4 bg-white border-2 border-black rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">
                  Add Co-Owner
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingOwner(false)}
                  className="text-zinc-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2">
                <Input
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="Student name"
                  className="h-9 text-xs"
                />
                <Input
                  type="number"
                  value={newOwnerAmount}
                  onChange={(e) => setNewOwnerAmount(e.target.value)}
                  placeholder="Contribution (Rs.)"
                  className="h-9 text-xs"
                />
                <Button
                  onClick={handleAddOwner}
                  className="w-full h-9 text-xs font-bold bg-black hover:bg-zinc-800 text-white"
                >
                  Save Owner & Split Shares
                </Button>
              </div>
            </div>
          )}

          {/* Interactive Resale Split Calculator */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 text-black space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-black">
                Estimated Resale: Rs. {resalePrice.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                Live Calculation
              </span>
            </div>
            <input
              type="range"
              min="500"
              max={Math.max(5000, item.total_cost)}
              step="100"
              value={resalePrice}
              onChange={(e) => setResalePrice(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="text-xs leading-relaxed text-zinc-600">
              Each owner’s recorded return:{" "}
              <b className="text-black font-extrabold">
                Rs. {perOwnerShare.toLocaleString()}
              </b>{" "}
              each ({item.owners.length} owners).
            </div>
          </section>

          {soldMessage && (
            <div className="p-3 bg-zinc-100 text-black text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-300">
              <Check size={16} />
              All {item.owners.length} co-owners notified of sale. Payouts recorded!
            </div>
          )}

          {/* Security Note */}
          <div className="text-xs leading-relaxed text-zinc-600 flex items-start gap-2 bg-white p-3.5 rounded-xl border border-zinc-200">
            <Info size={16} className="text-black shrink-0 mt-0.5" />
            <span>
              All co-owners are notified before a sale is finalized, so roommates graduate without disputes.
            </span>
          </div>
        </main>

        {/* Action Bar */}
        <div className="flex gap-2.5 p-4 border-t border-zinc-200 bg-white flex-none">
          <Button
            onClick={handleSellItem}
            className="flex-1 h-11 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white cursor-pointer shadow-xs"
          >
            Sell this item
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddingOwner(!isAddingOwner)}
            className="h-11 px-4 rounded-lg text-xs font-bold text-black border-zinc-300 hover:bg-zinc-100 cursor-pointer"
          >
            Add co-owner
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
