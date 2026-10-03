"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Camera, Check, Loader2, X } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataService } from "@/lib/data-service";

const CATEGORIES = [
  "Electronics",
  "Hostel",
  "Books",
  "Furniture",
  "Other",
] as const;
const CONDITIONS = ["New", "Like new", "Good", "Fair"] as const;

export default function SellSomethingPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("Phone cooler");
  const [category, setCategory] =
    React.useState<(typeof CATEGORIES)[number]>("Electronics");
  const [price, setPrice] = React.useState("1800");
  const [condition, setCondition] =
    React.useState<(typeof CONDITIONS)[number]>("Like new");
  const [location, setLocation] = React.useState("Hostel Block B");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "campus_stitch/marketplace");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await DataService.createListing({
        seller_name: "Muhammad Hammad",
        seller_verified: true,
        title: title.trim(),
        category: category,
        price: Number(price) || 1000,
        condition: condition,
        location: location.trim() || "Hostel Block B",
        is_graduation_sale: false,
        status: "available",
        image_url: imageUrl || undefined,
      });

      router.push("/market");
    } catch (err) {
      console.error("Failed to save listing:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-white text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none border-b border-zinc-200">
          <Link
            href="/market"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black">
            Sell an item
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Marketplace
          </span>
        </header>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 flex flex-col justify-between"
        >
          <main className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
            {/* Photos Upload with Cloudinary WebP */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 tracking-wide">
                Item Photos
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {imageUrl ? (
                  <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-zinc-300 group">
                    <img
                      src={imageUrl}
                      alt="Uploaded item"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-24 h-24 shrink-0 rounded-xl border border-dashed border-zinc-400 bg-zinc-50 text-zinc-800 flex flex-col items-center justify-center gap-1 text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin text-black"
                        />
                        <span className="text-[10px]">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="text-black" />
                        <span>Add photo</span>
                      </>
                    )}
                  </button>
                )}

                <div className="w-24 h-24 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center text-xs text-zinc-400">
                  <Camera size={18} />
                  <span className="text-[10px] mt-1">Photo 2</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label
                htmlFor="sell-title"
                className="text-xs font-bold text-zinc-900 tracking-wide"
              >
                Title
              </label>
              <Input
                id="sell-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Phone cooler, Study table, Books"
                className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 tracking-wide">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      category === cat
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label
                htmlFor="sell-price"
                className="text-xs font-bold text-zinc-900 tracking-wide"
              >
                Price (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-500">
                  Rs.
                </span>
                <Input
                  id="sell-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  className="pl-9 h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
                  required
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 tracking-wide">
                Condition
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`h-9 px-3 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer ${
                      condition === cond
                        ? "border-black bg-zinc-100 text-black font-bold"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <span>{cond}</span>
                    {condition === cond && (
                      <Check size={14} className="text-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label
                htmlFor="sell-location"
                className="text-xs font-bold text-zinc-900 tracking-wide"
              >
                Pickup Location
              </label>
              <Input
                id="sell-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hostel Block B, Main Gate"
                className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
              />
            </div>
          </main>

          {/* Fixed Bottom Action */}
          <div className="p-4 border-t border-zinc-200 bg-white flex-none">
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !title || !price}
              className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Publishing listing...
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
