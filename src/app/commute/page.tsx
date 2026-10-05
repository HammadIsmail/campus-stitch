"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  Clock,
  Car,
  Bike,
  Plus,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Compass,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataService, Ride, BikeItem } from "@/lib/data-service";
import { VerificationBadge } from "@/components/ui/verification-badge";

export default function CommutePage() {
  const [activeTab, setActiveTab] = React.useState("rides");
  const [fromFilter, setFromFilter] = React.useState("");
  const [toFilter, setToFilter] = React.useState("");
  const [rides, setRides] = React.useState<Ride[]>([]);
  const [bikes, setBikes] = React.useState<BikeItem[]>([]);
  const [myBookings, setMyBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [ridesData, bikesData] = await Promise.all([
        DataService.getRides(),
        DataService.getBikes(),
      ]);
      setRides(ridesData);
      setBikes(bikesData);

      try {
        const stored = JSON.parse(
          localStorage.getItem("campus_stitch_my_bookings") || "[]"
        );
        setMyBookings(stored);
      } catch {}

      setLoading(false);
    }
    loadData();
  }, []);

  const filteredRides = rides.filter((r) => {
    const matchFrom =
      !fromFilter.trim() ||
      r.from_location.toLowerCase().includes(fromFilter.toLowerCase());
    const matchTo =
      !toFilter.trim() ||
      r.to_location.toLowerCase().includes(toFilter.toLowerCase());
    return matchFrom && matchTo;
  });

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                Student Commute & Carpooling
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Khurrialwala daily route, rickshaw cost splitting & campus bike
                rentals
              </p>
            </div>
            <Link
              href="/commute/offer"
              className="h-10 px-4 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5px]" />
              <span>Offer Ride</span>
            </Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
          <Tabs
            defaultValue="rides"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 p-1 rounded-lg">
              <TabsTrigger
                value="rides"
                className="font-semibold text-xs py-1.5 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-zinc-600 dark:text-zinc-300"
              >
                Rides ({rides.length})
              </TabsTrigger>
              <TabsTrigger
                value="bikes"
                className="font-semibold text-xs py-1.5 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-zinc-600 dark:text-zinc-300"
              >
                Bikes ({bikes.length})
              </TabsTrigger>
              <TabsTrigger
                value="my-rides"
                className="font-semibold text-xs py-1.5 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-zinc-600 dark:text-zinc-300"
              >
                My Rides
              </TabsTrigger>
            </TabsList>

            {/* TAB: RIDES */}
            <TabsContent value="rides" className="space-y-4 mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                <span>
                  <b className="text-black dark:text-white font-bold">
                    {rides.length} ride{rides.length === 1 ? "" : "s"}
                  </b>{" "}
                  available today
                </span>
                <Link
                  href="/commute/offer"
                  className="font-semibold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  Offer a ride
                </Link>
              </div>

              {/* Dynamic Rides List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRides.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2 col-span-full shadow-2xs">
                    <div className="text-sm font-bold text-black dark:text-white">No active rides found</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Be the first to offer a commute ride or carpool split!</p>
                    <Link
                      href="/commute/offer"
                      className="inline-flex h-9 px-4 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold items-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Offer a Ride</span>
                    </Link>
                  </div>
                ) : (
                  filteredRides.map((ride) => (
                    <Link
                      key={ride.id}
                      href={`/commute/ride?id=${ride.id}`}
                      className="flex flex-col gap-2.5 p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs block"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-extrabold text-black dark:text-white">
                          {ride.departure_time}
                        </span>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-black dark:text-white">
                            Rs. {ride.price_per_seat}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {" "}
                            / seat
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        {ride.from_location} → {ride.to_location} ·{" "}
                        <span className="capitalize font-semibold text-zinc-800 dark:text-zinc-200">
                          {ride.vehicle_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                          <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold flex items-center justify-center">
                            {ride.organizer_name.charAt(0)}
                          </span>
                          <span>{ride.organizer_name}</span>
                          <VerificationBadge isVerified={ride.organizer_verified} size="xs" />
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            ride.available_seats === 1
                              ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                              : "text-white dark:text-black bg-black dark:bg-white"
                          }`}
                        >
                          {ride.available_seats} seat
                          {ride.available_seats === 1 ? "" : "s"} left
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {bikes.length > 0 && (
                <Link
                  href={`/commute/bike?id=${bikes[0].id}`}
                  className="flex items-center justify-between min-h-[50px] px-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs"
                >
                  <span className="text-xs text-black dark:text-white flex items-center gap-2">
                    <Bike size={16} className="text-black dark:text-white" />
                    <span>
                      <b>{bikes[0].model}</b> · Rs. {bikes[0].daily_rate} · {bikes[0].available_date}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1">
                    Bike Details
                    <ChevronRight size={13} />
                  </span>
                </Link>
              )}
            </TabsContent>

            {/* TAB: BIKES */}
            <TabsContent
              value="bikes"
              className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4"
            >
              {bikes.length === 0 ? (
                <div className="col-span-full p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2.5 shadow-2xs">
                  <Bike size={32} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                  <div className="text-sm font-bold text-black dark:text-white">No bikes available for rent</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    No rental bikes or motorbikes are listed on campus yet. Students can list their bikes when idle between classes.
                  </p>
                </div>
              ) : (
                bikes.map((b) => (
                  <Link
                    key={b.id}
                    href={`/commute/bike?id=${b.id}`}
                    className="block p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-black dark:text-white">
                          {b.model}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {b.location} · {b.condition}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-black dark:text-white text-sm">
                          Rs. {b.daily_rate}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400"> / day</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                        {b.available_date} ({b.available_time})
                      </span>
                      <span className="font-bold text-black dark:text-white hover:underline">
                        Rent Bike →
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </TabsContent>

            {/* TAB: MY RIDES */}
            <TabsContent value="my-rides" className="space-y-3 mt-4">
              {myBookings.length === 0 ? (
                <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2.5 shadow-2xs">
                  <Compass size={32} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                  <div className="text-sm font-bold text-black dark:text-white">No active ride bookings</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    You haven’t booked any commute rides yet. Check the Available Rides tab to join an existing carpool or rickshaw split.
                  </p>
                </div>
              ) : (
                myBookings.map((booking: any, idx: number) => (
                  <div key={booking.id || idx} className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                        Confirmed Ride
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {booking.departure_time || "Scheduled"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-black dark:text-white">
                      {booking.route || `${booking.from_location || "Campus"} → ${booking.to_location || "City"}`}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Organizer: {booking.organizer_name || "Student"}
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm font-bold text-black dark:text-white">Rs. {booking.price_per_seat || booking.cost || 50}</span>
                      <Link
                        href={`/commute/ride?id=${booking.ride_id || ""}`}
                        className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
