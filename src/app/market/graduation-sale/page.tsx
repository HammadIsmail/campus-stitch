"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Package, ChevronRight, Plus, X } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";

interface BundleItem {
  id: string;
  title: string;
  price: number;
  status: "Available" | "Reserved" | "Sold";
}

export default function GraduationSalePage() {
  const [items, setItems] = React.useState<BundleItem[]>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newItemTitle, setNewItemTitle] = React.useState("");
  const [newItemPrice, setNewItemPrice] = React.useState("");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("campus_stitch_graduation_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemPrice) return;

    const newItem: BundleItem = {
      id: "grad_" + Date.now(),
      title: newItemTitle.trim(),
      price: Number(newItemPrice),
      status: "Available",
    };

    const updated = [...items, newItem];
    setItems(updated);
    try {
      localStorage.setItem("campus_stitch_graduation_items", JSON.stringify(updated));
    } catch {}

    setNewItemTitle("");
    setNewItemPrice("");
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const nextStatus: BundleItem["status"] =
          item.status === "Available"
            ? "Reserved"
            : item.status === "Reserved"
              ? "Sold"
              : "Available";
        return { ...item, status: nextStatus };
      }
      return item;
    });
    setItems(updated);
    try {
      localStorage.setItem("campus_stitch_graduation_items", JSON.stringify(updated));
    } catch {}
  };

  const soldCount = items.filter((i) => i.status === "Sold").length;
  const soldAmount = items
    .filter((i) => i.status === "Sold")
    .reduce((sum, i) => sum + i.price, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price, 0);
  const progressPercent = items.length > 0 ? Math.round((soldCount / items.length) * 100) : 0;

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
            Graduation Pass-out Sale
          </div>
          <Link
            href="/market"
            className="text-xs font-bold text-black hover:underline px-2"
          >
            Market
          </Link>
        </header>

        {/* Modal: Add Item */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                <h3 className="font-bold text-sm text-black">Add Bundle Item</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Item Title</label>
                  <input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="e.g. Study Table, Cooler, Mattress..."
                    required
                    className="w-full h-9 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="e.g. 2500"
                    required
                    className="w-full h-9 px-3 border border-zinc-300 rounded-lg text-xs outline-none focus:border-black"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black text-white hover:bg-zinc-800 text-xs font-bold"
                  >
                    Add Item
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scrollable Main */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5 max-w-xl mx-auto w-full">
          {/* Progress Header Card */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="text-base font-extrabold text-black tracking-tight flex items-center gap-1.5">
              <Sparkles size={16} className="text-black" />
              <span>Senior Pass-out Bundle</span>
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              {soldCount} of {items.length} items sold · Rs. {soldAmount.toLocaleString()} of Rs. {totalAmount.toLocaleString()}
            </div>
            <div className="h-2 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-zinc-500 flex justify-between">
              <span>{progressPercent}% cleared</span>
              <span className="text-black font-semibold">
                Tap items to toggle status
              </span>
            </div>
          </section>

          {/* Interactive Items In Sale List */}
          {items.length === 0 ? (
            <div className="p-8 bg-white border border-zinc-200 rounded-xl text-center space-y-3 shadow-2xs">
              <Package size={36} className="mx-auto text-zinc-400 stroke-[1.5px]" />
              <div className="text-sm font-bold text-black">No graduation sale items yet</div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Graduating soon? Group all your hostel belongings into a single pass-out bundle for juniors to take over.
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="h-9 px-4 bg-black text-white hover:bg-zinc-800 text-xs font-bold"
              >
                Add First Item
              </Button>
            </div>
          ) : (
            <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-zinc-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleStatus(item.id)}
                  className="flex items-center gap-3 p-3.5 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center text-xs text-zinc-500">
                    <Package size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-black truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Rs. {item.price.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    {item.status === "Available" && (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-black text-xs font-bold">
                        Available
                      </span>
                    )}
                    {item.status === "Sold" && (
                      <span className="px-2.5 py-1 rounded-full bg-black text-white text-xs font-bold">
                        Sold
                      </span>
                    )}
                    {item.status === "Reserved" && (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold">
                        Reserved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>

        {/* Footer Action */}
        <div className="p-4 border-t border-zinc-200 bg-white flex-none">
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full h-11 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white cursor-pointer shadow-xs"
          >
            Add item to bundle
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
