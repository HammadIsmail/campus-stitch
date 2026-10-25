"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useCreateCommunityMutation } from "@/hooks/use-community-queries";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  "Academic & Tech",
  "Official Society",
  "Hostel Community",
  "Sports & Fitness",
  "Batch Network",
  "Hobbies & Arts",
] as const;

const communitySchema = z.object({
  name: z.string().min(2, "Community name must be at least 2 characters."),
  category: z.enum(CATEGORIES),
  description: z.string().min(5, "Please provide a short description (min. 5 chars)."),
  venue: z.string().optional(),
  batchRestriction: z.string().optional(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createCommunityMutation = useCreateCommunityMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      category: "Academic & Tech",
      description: "",
      venue: "Main Campus",
      batchRestriction: "All Campus Students",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = (data: CommunityFormData) => {
    createCommunityMutation.mutate(
      {
        name: data.name.trim(),
        description: data.description.trim(),
        category: data.category,
        campus_id: user?.campusId || "camp_uet_main",
      },
      {
        onSuccess: () => {
          router.push("/community");
        },
      }
    );
  };

  const isSubmitting = createCommunityMutation.isPending;

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/community"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black dark:text-white">
            Create Campus Community
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Campus Groups</span>
        </header>

        {/* Scrollable Form with react-hook-form */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 max-w-xl mx-auto w-full">
          <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1.5">
            <div className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
              <Sparkles size={16} />
              <span>Start a Verified Student Group</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Create a study circle, batch community, hostel floor group, or official society hub for verified students.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3.5" noValidate>
            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Community / Society Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. Competitive Programmers, Block B Night Owls"
                {...register("name")}
                className={`w-full h-10 px-3 border ${
                  errors.name ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-950 dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setValue("category", cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-2xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Eligibility / Audience
              </label>
              <select
                disabled={isSubmitting}
                {...register("batchRestriction")}
                className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-950 dark:text-white outline-none focus:border-black dark:focus:border-white cursor-pointer"
              >
                <option value="All Campus Students">All Campus Students</option>
                <option value="Hostel Residents Only">Hostel Residents Only</option>
                <option value="Final Year / Graduating Students">Final Year / Graduating Students</option>
                <option value="Engineering & CS Majors">Engineering &amp; CS Majors</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Regular Meetup Spot / Campus Hub
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. CS Lab 2, Library Lawn, or Digital Discord"
                {...register("venue")}
                className="w-full h-10 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-950 dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                About This Community <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                disabled={isSubmitting}
                placeholder="Share the goals of the community, expected activities, and who should join..."
                {...register("description")}
                className={`w-full p-3 border ${
                  errors.description ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-950 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl shadow-2xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating Community...</span>
                </>
              ) : (
                <span>Launch Student Community</span>
              )}
            </Button>
          </form>
        </main>
      </div>
    </MobileShell>
  );
}
