"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Users,
  Wrench,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Bed,
  Shirt,
  Printer,
  Zap,
  Plus,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { VerificationBadge } from "@/components/ui/verification-badge";

interface RoommateListing {
  id: string;
  title: string;
  rent: string;
  details: string;
  roomType: string;
  owner: string;
  program: string;
  verified: boolean;
  amenities: string[];
}

interface HostelService {
  id: string;
  name: string;
  location: string;
  schedule: string;
  provider: string;
  rate: string;
  verified: boolean;
}

export default function HostelPage() {
  const { user } = useAuth();
  const [roommates, setRoommates] = React.useState<RoommateListing[]>([]);
  const [services, setServices] = React.useState<HostelService[]>([]);
  const [requestedId, setRequestedId] = React.useState<string | null>(null);
  const [contactedService, setContactedService] = React.useState<string | null>(null);
  const [showPostModal, setShowPostModal] = React.useState(false);

  // Form states for adding roommate listing
  const [newTitle, setNewTitle] = React.useState("");
  const [newRent, setNewRent] = React.useState("");
  const [newDetails, setNewDetails] = React.useState("");
  const [newRoomType, setNewRoomType] = React.useState("Shared Room");

  React.useEffect(() => {
    async function loadHostelData() {
      // 1. Instant render from local storage if available
      try {
        const storedRooms = localStorage.getItem("campus_stitch_hostel_roommates");
        if (storedRooms) {
          setRoommates(JSON.parse(storedRooms));
        }
        const storedServices = localStorage.getItem("campus_stitch_hostel_services");
        if (storedServices) {
          setServices(JSON.parse(storedServices));
        }
      } catch {}

      // 2. Fetch fresh data from Supabase
      try {
        const supabase = createClient();
        const [roomsRes, servicesRes] = await Promise.all([
          supabase.from("hostel_roommates").select("*").order("created_at", { ascending: false }),
          supabase.from("hostel_services").select("*").order("created_at", { ascending: false }),
        ]);

        if (roomsRes.data && roomsRes.data.length > 0) {
          const mappedRooms: RoommateListing[] = roomsRes.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            rent: `Rs. ${r.monthly_rent}`,
            details: `${r.room_type} in ${r.hostel_block}. Available from ${r.available_from}.`,
            roomType: r.room_type,
            owner: r.user_name,
            program: "UET Lahore",
            verified: r.is_verified ?? true,
            amenities: ["WiFi", "Attached Bath"],
          }));
          setRoommates(mappedRooms);
          try {
            localStorage.setItem("campus_stitch_hostel_roommates", JSON.stringify(mappedRooms));
          } catch {}
        }

        if (servicesRes.data && servicesRes.data.length > 0) {
          const mappedServices: HostelService[] = servicesRes.data.map((s: any) => ({
            id: s.id,
            name: s.service_name,
            location: s.location,
            schedule: s.turnaround_time,
            provider: s.provider_name,
            rate: "Standard rate",
            verified: s.is_verified ?? true,
          }));
          setServices(mappedServices);
          try {
            localStorage.setItem("campus_stitch_hostel_services", JSON.stringify(mappedServices));
          } catch {}
        }
      } catch (err) {
        console.warn("Hostel Supabase fetch notice:", err);
      }
    }

    loadHostelData();
  }, []);

  const handlePostRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRent.trim()) return;

    const authorName = user?.name || "Student";
    const authorProgram = user?.program || "BS (UET Lahore)";

    const newListing: RoommateListing = {
      id: "rm_" + Date.now(),
      title: newTitle.trim(),
      rent: `Rs. ${newRent.trim()}`,
      details: newDetails.trim() || "Hostel room available for sharing",
      roomType: newRoomType,
      owner: authorName,
      program: authorProgram,
      verified: user?.isVerified ?? false,
      amenities: ["WiFi", "Attached Bath"],
    };

    const updated = [newListing, ...roommates];
    setRoommates(updated);
    try {
      localStorage.setItem("campus_stitch_hostel_roommates", JSON.stringify(updated));
    } catch {}

    try {
      const supabase = createClient();
      await supabase.from("hostel_roommates").insert([
        {
          user_name: authorName,
          is_verified: user?.isVerified ?? false,
          title: newTitle.trim(),
          room_type: newRoomType,
          monthly_rent: Number(newRent.trim()),
          available_from: "Immediate",
          hostel_block: "Hostel Block A",
          status: "available",
        },
      ]);
    } catch (err) {
      console.warn("Supabase post roommate notice:", err);
    }

    setNewTitle("");
    setNewRent("");
    setNewDetails("");
    setShowPostModal(false);
  };

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-5 transition-colors">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                  <Building2 size={20} className="stroke-[2.2px]" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                    Hostel Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Verified Roommates, Student Services & Hostel Living at UET Lahore
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/hostel/offer"
                className="h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Wrench size={13} className="text-zinc-600 dark:text-zinc-400" />
                <span>Offer Service</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="h-9 px-3.5 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Post Room</span>
              </button>
            </div>
          </div>
        </header>

        {/* Modal: Post Room */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-black dark:text-white">Post Roommate Vacancy</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handlePostRoom} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Title</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 1 seat in Block A (3rd Floor)"
                    required
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Monthly Rent (Rs.)</label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    placeholder="e.g. 8000"
                    required
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Details & Amenities</label>
                  <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    placeholder="WiFi, Geyser, quiet study environment..."
                    rows={2}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 text-xs border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    Publish Listing
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Roommates Listings */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-black dark:text-white tracking-tight">
                    Roommates Near You
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Verified UET Lahore hostel residents looking for sharing partners
                  </p>
                </div>
                <span className="text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                  {roommates.length} available
                </span>
              </div>

              {roommates.length === 0 ? (
                <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-3 shadow-2xs">
                  <Bed size={32} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                  <div className="text-sm font-bold text-black dark:text-white">No roommate listings posted yet</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Looking for a roommate or have a vacancy in your hostel room? Tap &quot;Post Room&quot; to connect with fellow verified students.
                  </p>
                  <Button
                    onClick={() => setShowPostModal(true)}
                    className="h-8 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
                  >
                    Post Room Vacancy
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {roommates.map((item) => {
                    const isConnected = requestedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between gap-3.5"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-sm font-bold text-black dark:text-white">
                              {item.title}
                            </span>
                            <span className="text-sm font-black text-black dark:text-white shrink-0">
                              {item.rent}
                              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                                {" "}
                                /mo
                              </span>
                            </span>
                          </div>

                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {item.details}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.amenities.map((amenity) => (
                              <span
                                key={amenity}
                                className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 px-2 py-0.5 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center">
                              {item.owner[0]}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                                <span>{item.owner}</span>
                                <VerificationBadge isVerified={item.verified} size="xs" />
                              </div>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                {item.program}
                              </div>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isConnected ? "secondary" : "outline"}
                            onClick={() => setRequestedId(item.id)}
                            disabled={isConnected}
                            className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-200 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            {isConnected ? (
                              <span className="text-black dark:text-white font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Requested
                              </span>
                            ) : (
                              "Connect"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Student Services & Maintenance */}
            <div className="space-y-3.5">
              <div>
                <h2 className="text-base font-bold text-black dark:text-white tracking-tight">
                  Student Services
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reliable door-to-door services run by fellow students
                </p>
              </div>

              {services.length === 0 ? (
                <div className="p-6 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-2.5 shadow-2xs">
                  <Wrench size={28} className="mx-auto text-zinc-400 stroke-[1.5px]" />
                  <div className="text-xs font-bold text-black dark:text-white">No student services registered</div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Student-run services (laundry pickup, repairs, print deliveries) can be listed through campus moderation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((srv) => {
                    const isContacted = contactedService === srv.id;
                    return (
                      <div
                        key={srv.id}
                        className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-black dark:hover:border-white transition-all space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shrink-0">
                            <Zap size={16} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-black dark:text-white">
                              {srv.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {srv.schedule}
                            </div>
                            <div className="text-[11px] font-semibold text-black dark:text-white mt-1 flex items-center gap-1">
                              <ShieldCheck size={11} className="stroke-[2.2px]" />
                              {srv.provider} · {srv.rate}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setContactedService(srv.id);
                            alert(`Connecting to ${srv.provider} for ${srv.name}.`);
                          }}
                          className="w-full h-8 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold cursor-pointer"
                        >
                          {isContacted ? "Contacted ✓" : "Contact Provider"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
