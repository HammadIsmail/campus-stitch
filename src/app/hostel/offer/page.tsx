"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Wrench,
  Shirt,
  Printer,
  Zap,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useCreateHostelServiceMutation } from "@/hooks/use-hostel-queries";
import { useAuth } from "@/lib/auth-context";

const SERVICE_PRESETS = [
  { name: "Laundry Pickup & Wash", icon: Shirt, defaultRate: "Rs. 40 / pair" },
  { name: "Cooler & Electrician Repairs", icon: Zap, defaultRate: "Rs. 200 visit" },
  { name: "Past Papers & Printout Delivery", icon: Printer, defaultRate: "Rs. 5 / page" },
  { name: "Laptop Setup & OS Formatting", icon: Wrench, defaultRate: "Rs. 500" },
];

const offerServiceSchema = z.object({
  serviceName: z.string().min(2, "Service title must be at least 2 characters."),
  location: z.string().min(2, "Service location is required."),
  schedule: z.string().min(2, "Service schedule is required."),
  rate: z.string().min(1, "Service charge / rate is required."),
  phone: z.string().min(10, "Valid phone number is required."),
  notes: z.string().optional(),
});

type OfferServiceFormData = z.infer<typeof offerServiceSchema>;

export default function OfferServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const createServiceMutation = useCreateHostelServiceMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferServiceFormData>({
    resolver: zodResolver(offerServiceSchema),
    defaultValues: {
      serviceName: "",
      location: "Hostel Block A",
      schedule: "Daily 5 PM – 10 PM",
      rate: "",
      phone: "+923001234567",
      notes: "",
    },
  });

  const currentServiceName = watch("serviceName");
  const currentRate = watch("rate");

  const handleSelectPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setValue("serviceName", preset.name);
    if (!currentRate) setValue("rate", preset.defaultRate);
  };

  const onSubmit = (data: OfferServiceFormData) => {
    createServiceMutation.mutate(
      {
        name: data.serviceName.trim(),
        provider: user?.name || "Student",
        location: data.location.trim(),
        schedule: data.schedule.trim(),
        rate: data.rate.trim(),
        phone: data.phone.trim(),
        notes: data.notes?.trim(),
        verified: user?.isVerified ?? true,
        campusId: user?.campusId,
        userId: user?.userId,
      },
      {
        onSuccess: () => {
          router.push("/hostel");
        },
      }
    );
  };

  const isSubmitting = createServiceMutation.isPending;

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
          <Link
            href="/hostel"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black dark:text-white">
            Offer Campus Service
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Hostel Hub</span>
        </header>

        {/* Scrollable Form with react-hook-form */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 max-w-xl mx-auto w-full">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
              Quick Service Templates
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = currentServiceName === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-2xs"
                        : "bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <Icon size={16} className={isSelected ? "text-white dark:text-black" : "text-black dark:text-white"} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-snug truncate">{p.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {p.defaultRate}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form with react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3.5 transition-colors" noValidate>
            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Desert Cooler Cleaning & Pump Setup"
                disabled={isSubmitting}
                {...register("serviceName")}
                className={`w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border ${
                  errors.serviceName ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors`}
              />
              {errors.serviceName && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.serviceName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-black dark:text-white block mb-1">
                  Location / Hostel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="Hostel Block"
                    {...register("location")}
                    className={`w-full h-10 pl-8 pr-2.5 bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.location ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-black dark:text-white block mb-1">
                  Rate / Charges <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Rs. 200 visit"
                  {...register("rate")}
                  className={`w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border ${
                    errors.rate ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-black dark:text-white block mb-1">
                  Available Hours
                </label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. 5 PM – 10 PM"
                    {...register("schedule")}
                    className="w-full h-10 pl-8 pr-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-black dark:text-white block mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="0300-1234567"
                    {...register("phone")}
                    className={`w-full h-10 pl-8 pr-2.5 bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.phone ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                disabled={isSubmitting}
                placeholder="Bring own soap, urgent delivery available, warranty details..."
                {...register("notes")}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl shadow-2xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Publishing Service...</span>
                </>
              ) : (
                <span>Publish Service Listing</span>
              )}
            </Button>
          </form>
        </main>
      </div>
    </MobileShell>
  );
}
