"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateListingMutation, useUploadImageMutation } from "@/hooks/use-market-queries";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  "Electronics",
  "Hostel",
  "Books",
  "Furniture",
  "Other",
] as const;

const CONDITIONS = ["New", "Like new", "Good", "Fair"] as const;

const sellItemSchema = z.object({
  title: z.string().min(2, "Item title must be at least 2 characters."),
  category: z.enum(CATEGORIES),
  price: z.string().min(1, "Price is required.").refine((val) => Number(val) > 0, "Price must be greater than 0."),
  condition: z.enum(CONDITIONS),
  location: z.string().optional(),
  description: z.string().optional(),
});

type SellItemFormData = z.infer<typeof sellItemSchema>;

export default function SellSomethingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const createListingMutation = useCreateListingMutation();
  const uploadImageMutation = useUploadImageMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellItemFormData>({
    resolver: zodResolver(sellItemSchema),
    defaultValues: {
      title: "",
      category: "Electronics",
      price: "",
      condition: "Good",
      location: "",
      description: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedCondition = watch("condition");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImageMutation.mutate(file, {
      onSuccess: (uploadedUrl) => {
        setImageUrl(uploadedUrl);
      },
      onError: () => {
        alert("Failed to upload image. Please try again.");
      },
    });
  };

  const onSubmit = async (data: SellItemFormData) => {
    createListingMutation.mutate(
      {
        university_id: user?.universityId || "uni_uet_lahore",
        campus_id: user?.campusId || "camp_uet_main",
        seller_name: user?.name || "Student",
        seller_verified: user?.isVerified ?? true,
        title: data.title.trim(),
        description: data.description?.trim(),
        category: data.category,
        price: Number(data.price) || 1000,
        condition: data.condition,
        location: data.location?.trim() || "Campus Hostel Block",
        is_graduation_sale: false,
        status: "available",
        image_url: imageUrl || undefined,
      },
      {
        onSuccess: () => {
          router.push("/market");
        },
      }
    );
  };

  const isUploadingImage = uploadImageMutation.isPending;
  const isSubmitting = createListingMutation.isPending;

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215]">
          <Link
            href="/market"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black dark:text-white">
            Sell an item
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Marketplace
          </span>
        </header>

        {/* Scrollable Form with react-hook-form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 min-h-0 flex flex-col justify-between"
          noValidate
        >
          <main className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
            {/* Photos Upload with Cloudinary WebP */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide">
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
                  <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 group">
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
                    disabled={isUploadingImage || isSubmitting}
                    className="w-24 h-24 shrink-0 rounded-xl border border-dashed border-zinc-400 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center gap-1 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin text-black dark:text-white"
                        />
                        <span className="text-[10px]">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={20} className="text-zinc-500" />
                        <span>Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="title-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide"
                >
                  Item Title
                </label>
                <Input
                  id="title-input"
                  placeholder="e.g. TI-84 Plus Graphing Calculator"
                  disabled={isSubmitting}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Category Pill Selectors */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide">
                  Category
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setValue("category", cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="price-input"
                    className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide"
                  >
                    Price (Rs.)
                  </label>
                  <Input
                    id="price-input"
                    type="number"
                    placeholder="e.g. 1500"
                    disabled={isSubmitting}
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide">
                    Condition
                  </span>
                  <select
                    value={selectedCondition}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setValue("condition", e.target.value as (typeof CONDITIONS)[number])
                    }
                    className="w-full h-11 px-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label
                  htmlFor="location-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide"
                >
                  Pickup Location{" "}
                  <span className="font-normal text-zinc-500">(optional)</span>
                </label>
                <Input
                  id="location-input"
                  placeholder="e.g. Hostel Block B or CS Department"
                  disabled={isSubmitting}
                  {...register("location")}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label
                  htmlFor="desc-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-wide"
                >
                  Description{" "}
                  <span className="font-normal text-zinc-500">(optional)</span>
                </label>
                <textarea
                  id="desc-input"
                  rows={3}
                  placeholder="Describe your item, accessories included, and condition..."
                  disabled={isSubmitting}
                  {...register("description")}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>
            </div>
          </main>

          {/* Submit Action */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex-none">
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full h-12 rounded-xl text-base font-bold bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Publishing listing...</span>
                </>
              ) : (
                <span>Post Item for Sale</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
