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
  Pencil,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataService, Ride, BikeItem } from "@/lib/data-service";
import { useAuth } from "@/lib/auth-context";
import { MapPin } from "lucide-react";
import { useRidesQuery, useBikesQuery } from "@/hooks/use-commute-queries";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StudentProfileModal } from "@/components/student-profile-modal";
import { ReviewModal } from "@/components/review-modal";

export default function CommutePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("rides");
  const [fromFilter, setFromFilter] = React.useState("");
  const [toFilter, setToFilter] = React.useState("");
  const [myBookings, setMyBookings] = React.useState<any[]>([]);

  // Modals state
  const [profileModalTarget, setProfileModalTarget] = React.useState<{
    userId?: string;
    name: string;
    isVerified?: boolean;
  } | null>(null);

  const [reviewModalTarget, setReviewModalTarget] = React.useState<{
    userId: string;
    name: string;
    category?: "commute" | "marketplace" | "service" | "rental";
  } | null>(null);

  // List Bike Modal State
  const [showListBikeModal, setShowListBikeModal] = React.useState(false);
  const [bikeModel, setBikeModel] = React.useState("");
  const [bikeDailyRate, setBikeDailyRate] = React.useState("150");
  const [bikeDeposit, setBikeDeposit] = React.useState("500");
  const [bikeLocation, setBikeLocation] = React.useState("");
  const [bikeCondition, setBikeCondition] = React.useState("Good condition");
  const [bikeRules, setBikeRules] = React.useState("");
  const [isListingBike, setIsListingBike] = React.useState(false);
  const [bikeListError, setBikeListError] = React.useState<string | null>(null);

  // Edit Ride Modal State
  const [editingRide, setEditingRide] = React.useState<Ride | null>(null);
  const [editTime, setEditTime] = React.useState("");
  const [editPrice, setEditPrice] = React.useState("");
  const [editFrom, setEditFrom] = React.useState("");
  const [editTo, setEditTo] = React.useState("");
  const [editVehicle, setEditVehicle] = React.useState("rickshaw");
  const [editSeats, setEditSeats] = React.useState(3);
  const [isUpdatingRide, setIsUpdatingRide] = React.useState(false);

  const openEditRideModal = (ride: Ride, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRide(ride);
    setEditTime(ride.departure_time);
    setEditPrice(String(ride.price_per_seat));
    setEditFrom(ride.from_location);
    setEditTo(ride.to_location);
    setEditVehicle(ride.vehicle_type || "rickshaw");
    setEditSeats(ride.available_seats || 3);
  };

  const handleDeleteRide = async (rideId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this ride offer?")) return;
    try {
      await fetch(`/api/commute/rides?id=${rideId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    } catch (err) {
      console.warn("Delete ride error:", err);
    }
  };

  const handleSaveEditRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRide) return;
    setIsUpdatingRide(true);
    try {
      await fetch("/api/commute/rides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRide.id,
          departureTime: editTime.trim(),
          pricePerSeat: Number(editPrice),
          fromLocation: editFrom.trim(),
          toLocation: editTo.trim(),
          vehicleType: editVehicle,
          availableSeats: Number(editSeats),
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    } catch (err) {
      console.warn("Update ride error:", err);
    } finally {
      setIsUpdatingRide(false);
      setEditingRide(null);
    }
  };

  const handleListBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeModel.trim()) {
      setBikeListError("Please enter the bicycle or motorbike model.");
      return;
    }
    setBikeListError(null);
    setIsListingBike(true);

    try {
      const res = await DataService.listBike({
        model: bikeModel.trim(),
        condition: bikeCondition,
        location: bikeLocation.trim() || "Hostel Bike Stand",
        dailyRate: Number(bikeDailyRate) || 150,
        depositAmount: Number(bikeDeposit) || 500,
        rules: bikeRules.trim() || "Return by 9 PM in clean condition",
        ownerName: user?.name || "Student Peer",
        campusId: user?.campusId || "camp_uet_main",
        universityId: user?.universityId || "uni_uet_lahore",
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["bikes"] });
        setShowListBikeModal(false);
        setBikeModel("");
        setBikeRules("");
        setBikeLocation("");
      } else {
        setBikeListError(res.error || "Failed to list bike. Please try again.");
      }
    } catch (err: any) {
      setBikeListError(err.message || "Failed to list bike.");
    } finally {
      setIsListingBike(false);
    }
  };

  const handleDeleteBike = async (bikeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this bike listing?")) return;

    try {
      await DataService.deleteBike(bikeId);
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
    } catch (err) {
      console.warn("Delete bike error:", err);
    }
  };

  const { data: rides = [], isLoading: ridesLoading } = useRidesQuery(user?.campusId);
  const { data: bikes = [], isLoading: bikesLoading } = useBikesQuery(user?.campusId);
  const loading = ridesLoading || bikesLoading;

  React.useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("campus_stitch_my_bookings") || "[]"
      );
      setMyBookings(stored);
    } catch {}
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
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                  <MapPin size={11} className="text-zinc-500" />
                  <span>{user?.campusName || "Main Campus"} &bull; {user?.universityName || "UET Lahore"}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                Ride Sharing
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Daily ride sharing, rickshaw cost splitting & campus bike rentals
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
                  filteredRides.map((ride) => {
                    const isMine = Boolean(
                      (user?.userId && (ride as any).user_id === user.userId) ||
                      (user?.name && ride.organizer_name?.toLowerCase().trim() === user.name.toLowerCase().trim())
                    );

                    return (
                      <div
                        key={ride.id}
                        className="flex flex-col gap-2.5 p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-all shadow-2xs relative"
                      >
                        <div className="flex justify-between items-baseline">
                          <Link href={`/commute/ride?id=${ride.id}`} className="hover:underline">
                            <span className="text-base font-extrabold text-black dark:text-white">
                              {ride.departure_time}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className="text-base font-extrabold text-black dark:text-white">
                                Rs. {ride.price_per_seat}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                {" "}
                                / seat
                              </span>
                            </div>

                            {isMine && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => openEditRideModal(ride, e)}
                                  title="Edit ride"
                                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteRide(ride.id, e)}
                                  title="Delete ride"
                                  className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link href={`/commute/ride?id=${ride.id}`} className="block">
                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            {ride.from_location} → {ride.to_location} ·{" "}
                            <span className="capitalize font-semibold text-zinc-800 dark:text-zinc-200">
                              {ride.vehicle_type}
                            </span>
                          </div>
                        </Link>

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setProfileModalTarget({
                                userId: ride.organizer_name,
                                name: ride.organizer_name,
                                isVerified: ride.organizer_verified,
                              });
                            }}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                          >
                            <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold flex items-center justify-center">
                              {ride.organizer_name.charAt(0)}
                            </span>
                            <span>{ride.organizer_name}</span>
                          </button>
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
                      </div>
                    );
                  })
                )}
              </div>

              {/* In-person payment notice */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Notice: All fuel splits, rickshaw fares, and ride shares are handled directly between students in cash. No in-app payment transactions occur on this platform.
              </div>
            </TabsContent>

            {/* TAB: BIKES */}
            <TabsContent
              value="bikes"
              className="space-y-4 mt-4"
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                <span>
                  <b className="text-black dark:text-white font-bold">
                    {bikes.length} bike{bikes.length === 1 ? "" : "s"}
                  </b>{" "}
                  available on campus
                </span>
                <button
                  type="button"
                  onClick={() => setShowListBikeModal(true)}
                  className="font-semibold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  List your bike
                </button>
              </div>

              {bikes.length === 0 ? (
                <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-3 shadow-2xs">
                  <Bike size={32} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                  <div className="text-sm font-bold text-black dark:text-white">No bikes available for rent</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    No rental bikes or motorbikes are listed on campus yet. Students can list their bikes when idle between classes.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowListBikeModal(true)}
                    className="h-8.5 px-4 text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    <Plus size={13} className="mr-1" />
                    List Your Bike
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {bikes.map((b) => {
                    const isBikeMine =
                      (user?.name && b.owner_name?.toLowerCase().trim() === user.name.toLowerCase().trim());

                    return (
                      <div
                        key={b.id}
                        className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs flex flex-col justify-between space-y-3"
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
                            {b.deposit_amount ? (
                              <div className="text-[10px] text-zinc-400">
                                Deposit: Rs. {b.deposit_amount}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Owner & Safety Actions */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileModalTarget({
                                userId: b.owner_name,
                                name: b.owner_name || "Student Owner",
                                isVerified: b.owner_verified,
                              });
                            }}
                            className="flex items-center gap-1.5 font-semibold text-black dark:text-white hover:underline cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold flex items-center justify-center">
                              {(b.owner_name?.[0] || "S").toUpperCase()}
                            </span>
                            <span>{b.owner_name || "Student Owner"}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {isBikeMine ? (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteBike(b.id, e)}
                                title="Remove Bike Listing"
                                className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewModalTarget({
                                    userId: b.owner_name || "Owner",
                                    name: b.owner_name || "Owner",
                                    category: "rental",
                                  });
                                }}
                                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span>Rate</span>
                              </button>
                            )}

                            <Link
                              href={`/commute/bike?id=${b.id}`}
                              className="font-bold text-black dark:text-white hover:underline"
                            >
                              Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* In-person rental notice */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Rental Policy: Security deposit and rental rate are collected directly in person between students upon key handover. No in-app payment transactions occur on this platform.
              </div>
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
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Organizer: {booking.organizer_name || "Student"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalTarget({
                            userId: booking.organizer_name || "Driver",
                            name: booking.organizer_name || "Driver",
                            category: "commute",
                          });
                        }}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>Rate Driver</span>
                      </button>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm font-bold text-black dark:text-white">Rs. {booking.price_per_seat || booking.cost || 50}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/messages?context=commute&id=${booking.ride_id || ""}`}
                          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline cursor-pointer"
                        >
                          Chat
                        </Link>
                        <Link
                          href={`/commute/ride?id=${booking.ride_id || ""}`}
                          className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* ======================================================== */}
        {/* MODAL: EDIT RIDE MODAL                                   */}
        {/* ======================================================== */}
        {editingRide && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#121215] rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-extrabold text-base text-black dark:text-white flex items-center gap-2">
                  <Pencil size={18} />
                  <span>Edit Ride Offer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRide(null)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditRide} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Departure Time
                    </label>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      required
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Price per Seat (Rs.)
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="50"
                      required
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      From Location
                    </label>
                    <input
                      type="text"
                      value={editFrom}
                      onChange={(e) => setEditFrom(e.target.value)}
                      placeholder="Pickup"
                      required
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      To Location
                    </label>
                    <input
                      type="text"
                      value={editTo}
                      onChange={(e) => setEditTo(e.target.value)}
                      placeholder="Dropoff"
                      required
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={editVehicle}
                      onChange={(e) => setEditVehicle(e.target.value)}
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      <option value="rickshaw">Rickshaw</option>
                      <option value="car">Car / Carpool</option>
                      <option value="bike">Bike (Pillion)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Available Seats
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={editSeats}
                      onChange={(e) => setEditSeats(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRide(null)}
                    className="flex-1 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isUpdatingRide || !editTime.trim() || !editPrice.trim()}
                    className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    {isUpdatingRide ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: LIST BIKE FOR RENT                                */}
        {/* ======================================================== */}
        {showListBikeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#121215] rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-extrabold text-base text-black dark:text-white flex items-center gap-2">
                  <Bike size={18} />
                  <span>List Your Bike for Rent</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowListBikeModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {bikeListError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                  {bikeListError}
                </div>
              )}

              <form onSubmit={handleListBike} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Bicycle or Motorbike Model
                  </label>
                  <input
                    type="text"
                    required
                    value={bikeModel}
                    onChange={(e) => setBikeModel(e.target.value)}
                    placeholder="e.g. Sohrab 26-inch Commuter / Honda CD 70"
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Daily Rate (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={bikeDailyRate}
                      onChange={(e) => setBikeDailyRate(e.target.value)}
                      placeholder="150"
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white block mb-1">
                      Security Deposit (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={bikeDeposit}
                      onChange={(e) => setBikeDeposit(e.target.value)}
                      placeholder="500"
                      className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Campus Pickup Location
                  </label>
                  <input
                    type="text"
                    value={bikeLocation}
                    onChange={(e) => setBikeLocation(e.target.value)}
                    placeholder="e.g. Hostel 4 Bicycle Stand, Library Gate"
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Condition
                  </label>
                  <select
                    value={bikeCondition}
                    onChange={(e) => setBikeCondition(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good condition">Good condition</option>
                    <option value="Fair / Usable">Fair / Usable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black dark:text-white block mb-1">
                    Rental Terms / Rules
                  </label>
                  <input
                    type="text"
                    value={bikeRules}
                    onChange={(e) => setBikeRules(e.target.value)}
                    placeholder="e.g. Return with lock key by 9 PM"
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowListBikeModal(false)}
                    className="flex-1 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isListingBike || !bikeModel.trim()}
                    className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    {isListingBike ? "Listing..." : "Publish Bike"}
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
            defaultCategory={reviewModalTarget.category || "commute"}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
