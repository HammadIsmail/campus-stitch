"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateRideMutation } from "@/hooks/use-commute-queries";
import { useAuth } from "@/lib/auth-context";

const offerRideSchema = z.object({
  vehicle: z.enum(["rickshaw", "bike", "car"]),
  from: z.string().min(2, "Pickup location is required."),
  to: z.string().min(2, "Destination is required."),
  date: z.string().min(1, "Date is required."),
  time: z.string().min(1, "Time is required."),
  seats: z.number().min(1, "At least 1 seat must be offered.").max(6),
  totalFare: z.string().min(1, "Total vehicle price is required."),
  price: z.string().min(1, "Price per person is required."),
  pickup: z.string().optional(),
  notes: z.string().optional(),
});

type OfferRideFormData = z.infer<typeof offerRideSchema>;

export default function OfferRidePage() {
  const router = useRouter();
  const { user } = useAuth();
  const createRideMutation = useCreateRideMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferRideFormData>({
    resolver: zodResolver(offerRideSchema),
    defaultValues: {
      vehicle: "rickshaw",
      from: "Khurrianwala",
      to: "University",
      date: "Tomorrow",
      time: "8:00 AM",
      seats: 3,
      totalFare: "200",
      price: "50",
      pickup: "",
      notes: "",
    },
  });

  const vehicle = watch("vehicle");
  const seats = watch("seats");
  const totalFare = watch("totalFare");
  const price = watch("price");

  // Update default totalFare when vehicle type changes
  const prevVehicleRef = React.useRef(vehicle);
  React.useEffect(() => {
    if (prevVehicleRef.current !== vehicle) {
      prevVehicleRef.current = vehicle;
      const defaultFare = vehicle === "rickshaw" ? 200 : vehicle === "bike" ? 150 : 300;
      const newSeats = vehicle === "bike" ? 1 : 3;
      setValue("seats", newSeats);
      setValue("totalFare", defaultFare.toString());
      const perSeat = Math.round(defaultFare / (newSeats + 1));
      setValue("price", perSeat.toString());
    }
  }, [vehicle, setValue]);

  // Recalculate price recommendation when totalFare or seats change
  React.useEffect(() => {
    const total = parseFloat(totalFare) || 0;
    const s = seats > 0 ? seats : 1;
    if (total > 0) {
      const recommendedPerSeat = Math.round(total / (s + 1));
      setValue("price", recommendedPerSeat.toString());
    }
  }, [totalFare, seats, setValue]);

  const onSubmit = async (data: OfferRideFormData) => {
    const totalCost = Number(data.totalFare) || (Number(data.price) * (data.seats + 1));

    createRideMutation.mutate(
      {
        university_id: user?.universityId || "uni_uet_lahore",
        campus_id: user?.campusId || "camp_uet_main",
        organizer_name: user?.name || "Student",
        organizer_verified: user?.isVerified ?? true,
        from_location: data.from.trim(),
        to_location: data.to.trim(),
        departure_time: data.time.trim(),
        departure_date: data.date.trim(),
        vehicle_type: data.vehicle,
        total_cost: totalCost,
        price_per_seat: Number(data.price) || Math.round(totalCost / (data.seats + 1)),
        total_seats: data.seats + 1,
        available_seats: data.seats,
        pickup_point: data.pickup?.trim() || "Main road stop",
        notes: data.notes?.trim() || `Shared ${data.vehicle} to campus`,
        status: "active",
      },
      {
        onSuccess: () => {
          router.push("/commute");
        },
      }
    );
  };

  const isSubmitting = createRideMutation.isPending;

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-white dark:bg-[#121215] text-[#101828] dark:text-zinc-100 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-2.5 flex-none border-b border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#121215] min-h-[56px]">
          <Link
            href="/commute"
            aria-label="Back"
            className="w-10 h-10 -ml-1.5 flex items-center justify-center text-[#101828] dark:text-zinc-100 hover:bg-[#F2F4F7] dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={22} className="stroke-[1.8px]" />
          </Link>
          <div className="flex-1 font-bold text-[17px] tracking-tight text-black dark:text-white">
            Offer a ride
          </div>
        </header>

        {/* Scrollable Form with react-hook-form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 min-h-0 flex flex-col justify-between"
          noValidate
        >
          <main className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5">
            {/* Vehicle Selector */}
            <div className="flex p-1 bg-[#E4E7EC] dark:bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setValue("vehicle", "rickshaw")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "rickshaw"
                    ? "bg-white dark:bg-zinc-900 text-[#101828] dark:text-white shadow-xs"
                    : "text-[#5B6472] dark:text-zinc-400 hover:text-[#101828] dark:hover:text-white"
                }`}
              >
                Rickshaw
              </button>
              <button
                type="button"
                onClick={() => setValue("vehicle", "bike")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "bike"
                    ? "bg-white dark:bg-zinc-900 text-[#101828] dark:text-white shadow-xs"
                    : "text-[#5B6472] dark:text-zinc-400 hover:text-[#101828] dark:hover:text-white"
                }`}
              >
                Bike
              </button>
              <button
                type="button"
                onClick={() => setValue("vehicle", "car")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "car"
                    ? "bg-white dark:bg-zinc-900 text-[#101828] dark:text-white shadow-xs"
                    : "text-[#5B6472] dark:text-zinc-400 hover:text-[#101828] dark:hover:text-white"
                }`}
              >
                Car
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="from-input"
                  className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                >
                  From
                </label>
                <Input
                  id="from-input"
                  placeholder="Pickup locality"
                  disabled={isSubmitting}
                  {...register("from")}
                />
                {errors.from && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.from.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="to-input"
                  className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                >
                  To
                </label>
                <Input
                  id="to-input"
                  placeholder="Destination"
                  disabled={isSubmitting}
                  {...register("to")}
                />
                {errors.to && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.to.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="date-input"
                    className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                  >
                    Date
                  </label>
                  <Input
                    id="date-input"
                    disabled={isSubmitting}
                    {...register("date")}
                  />
                  {errors.date && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="time-input"
                    className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                  >
                    Time
                  </label>
                  <Input
                    id="time-input"
                    disabled={isSubmitting}
                    {...register("time")}
                  />
                  {errors.time && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.time.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide">
                    Available Seats
                  </span>
                  <div className="flex items-center justify-between h-12 border border-[#D0D5DD] dark:border-zinc-800 rounded-xl px-2 bg-white dark:bg-zinc-900">
                    <button
                      type="button"
                      aria-label="Fewer seats"
                      disabled={isSubmitting}
                      onClick={() => setValue("seats", Math.max(1, seats - 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#101828] dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="text-base font-bold text-[#101828] dark:text-white">
                      {seats}
                    </span>
                    <button
                      type="button"
                      aria-label="More seats"
                      disabled={isSubmitting}
                      onClick={() => setValue("seats", Math.min(6, seats + 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#101828] dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="price-input"
                    className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                  >
                    Price per person (Rs.)
                  </label>
                  <Input
                    id="price-input"
                    type="number"
                    disabled={isSubmitting}
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.price.message}</p>
                  )}
                </div>
              </div>

              {/* Dynamic split explanation with interactive Total Rickshaw Price input */}
              <div className="p-3.5 rounded-xl bg-[#E3F2EF] dark:bg-teal-950/40 text-[#0B4F49] dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label
                      htmlFor="total-fare-input"
                      className="text-xs font-bold text-[#0B4F49] dark:text-teal-300 block"
                    >
                      Total {vehicle === "rickshaw" ? "Rickshaw" : vehicle === "bike" ? "Bike" : "Car"} Price (Rs.)
                    </label>
                    <span className="text-[10px] text-teal-800/80 dark:text-teal-400">
                      Decide your total vehicle fare
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">Rs.</span>
                    <input
                      id="total-fare-input"
                      type="number"
                      min="10"
                      placeholder="200"
                      disabled={isSubmitting}
                      {...register("totalFare")}
                      className="w-24 px-2.5 py-1.5 text-right text-xs font-bold bg-white dark:bg-zinc-900 border border-teal-300 dark:border-teal-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-medium text-teal-800 dark:text-teal-300/90 pt-1.5 border-t border-teal-200/70 dark:border-teal-800/60 flex items-center justify-between">
                  <span>Split Formula:</span>
                  <span>
                    Rs. {totalFare || 0} ÷ {seats + 1} riders ({seats} passengers + 1 organizer) = <strong className="font-bold">Rs. {price} each</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="pickup-input"
                  className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                >
                  Pickup point{" "}
                  <span className="font-normal text-[#5B6472] dark:text-zinc-400">(optional)</span>
                </label>
                <Input
                  id="pickup-input"
                  placeholder="e.g. Main road stop"
                  disabled={isSubmitting}
                  {...register("pickup")}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="notes-input"
                  className="text-xs font-bold text-[#344054] dark:text-zinc-300 tracking-wide"
                >
                  Notes{" "}
                  <span className="font-normal text-[#5B6472] dark:text-zinc-400">(optional)</span>
                </label>
                <Input
                  id="notes-input"
                  placeholder="Anything riders should know"
                  disabled={isSubmitting}
                  {...register("notes")}
                />
              </div>
            </div>
          </main>

          {/* Submit Action */}
          <div className="p-4 border-t border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#121215] flex-none">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-base font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Publishing ride...</span>
                </>
              ) : (
                <span>Publish ride</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
