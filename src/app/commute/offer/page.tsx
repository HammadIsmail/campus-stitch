"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Bike, Sparkles, Check } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataService } from "@/lib/data-service";

export default function OfferRidePage() {
  const router = useRouter();
  const [vehicle, setVehicle] = React.useState<"rickshaw" | "bike" | "car">(
    "rickshaw",
  );
  const [from, setFrom] = React.useState("Khurrialwala");
  const [to, setTo] = React.useState("University");
  const [date, setDate] = React.useState("Tomorrow");
  const [time, setTime] = React.useState("8:00 AM");
  const [seats, setSeats] = React.useState(3);
  const [price, setPrice] = React.useState("50");
  const [pickup, setPickup] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Recalculate price recommendation when vehicle or seats change
  React.useEffect(() => {
    const baseCost =
      vehicle === "rickshaw" ? 200 : vehicle === "bike" ? 150 : 300;
    const recommendedPerSeat = Math.round(baseCost / (seats + 1));
    setPrice(recommendedPerSeat.toString());
  }, [vehicle, seats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    setIsSubmitting(true);

    const baseCost =
      vehicle === "rickshaw" ? 200 : vehicle === "bike" ? 150 : 300;

    await DataService.createRide({
      organizer_name: "Muhammad Hammad",
      organizer_verified: true,
      from_location: from,
      to_location: to,
      departure_time: time,
      vehicle_type: vehicle,
      total_cost: baseCost,
      price_per_seat: Number(price) || 50,
      total_seats: seats + 1,
      available_seats: seats,
      pickup_point: pickup || "Main road stop",
      notes: notes || `Shared ${vehicle} to campus`,
      status: "active",
    });

    setIsSubmitting(false);
    router.push("/commute");
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-white text-[#101828] select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-2.5 flex-none border-b border-[#E4E7EC] min-h-[56px]">
          <Link
            href="/commute"
            aria-label="Back"
            className="w-10 h-10 -ml-1.5 flex items-center justify-center text-[#101828] hover:bg-[#F2F4F7] rounded-full transition-colors"
          >
            <ArrowLeft size={22} className="stroke-[1.8px]" />
          </Link>
          <div className="flex-1 font-bold text-[17px] tracking-tight">
            Offer a ride
          </div>
        </header>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 flex flex-col justify-between"
        >
          <main className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5">
            {/* Vehicle Selector */}
            <div className="flex p-1 bg-[#E4E7EC] rounded-xl">
              <button
                type="button"
                onClick={() => setVehicle("rickshaw")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "rickshaw"
                    ? "bg-white text-[#101828] shadow-xs"
                    : "text-[#5B6472] hover:text-[#101828]"
                }`}
              >
                Rickshaw
              </button>
              <button
                type="button"
                onClick={() => setVehicle("bike")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "bike"
                    ? "bg-white text-[#101828] shadow-xs"
                    : "text-[#5B6472] hover:text-[#101828]"
                }`}
              >
                Bike
              </button>
              <button
                type="button"
                onClick={() => setVehicle("car")}
                className={`flex-1 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  vehicle === "car"
                    ? "bg-white text-[#101828] shadow-xs"
                    : "text-[#5B6472] hover:text-[#101828]"
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
                  className="text-xs font-bold text-[#344054] tracking-wide"
                >
                  From
                </label>
                <Input
                  id="from-input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Pickup locality"
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="to-input"
                  className="text-xs font-bold text-[#344054] tracking-wide"
                >
                  To
                </label>
                <Input
                  id="to-input"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Destination"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="date-input"
                    className="text-xs font-bold text-[#344054] tracking-wide"
                  >
                    Date
                  </label>
                  <Input
                    id="date-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="time-input"
                    className="text-xs font-bold text-[#344054] tracking-wide"
                  >
                    Time
                  </label>
                  <Input
                    id="time-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#344054] tracking-wide">
                    Available Seats
                  </span>
                  <div className="flex items-center justify-between h-12 border border-[#D0D5DD] rounded-xl px-2 bg-white">
                    <button
                      type="button"
                      aria-label="Fewer seats"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#101828] hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-base font-bold text-[#101828]">
                      {seats}
                    </span>
                    <button
                      type="button"
                      aria-label="More seats"
                      onClick={() => setSeats(Math.min(6, seats + 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#101828] hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="price-input"
                    className="text-xs font-bold text-[#344054] tracking-wide"
                  >
                    Price per person (Rs.)
                  </label>
                  <Input
                    id="price-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              {/* Dynamic split explanation */}
              <div className="p-3 rounded-xl bg-[#E3F2EF] text-[#0B4F49] text-xs font-semibold leading-relaxed">
                Rs.{" "}
                {vehicle === "rickshaw" ? 200 : vehicle === "bike" ? 150 : 300}{" "}
                {vehicle} ÷ {seats + 1} riders = Rs. {price} each
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="pickup-input"
                  className="text-xs font-bold text-[#344054] tracking-wide"
                >
                  Pickup point{" "}
                  <span className="font-normal text-[#5B6472]">(optional)</span>
                </label>
                <Input
                  id="pickup-input"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Main road stop"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="notes-input"
                  className="text-xs font-bold text-[#344054] tracking-wide"
                >
                  Notes{" "}
                  <span className="font-normal text-[#5B6472]">(optional)</span>
                </label>
                <Input
                  id="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything riders should know"
                />
              </div>
            </div>
          </main>

          {/* Submit Action */}
          <div className="p-4 border-t border-[#E4E7EC] bg-white flex-none">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-base font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white"
            >
              {isSubmitting ? "Publishing..." : "Publish ride"}
            </Button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
