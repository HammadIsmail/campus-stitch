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
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
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
  userId?: string;
}

interface HostelService {
  id: string;
  name: string;
  location: string;
  schedule: string;
  provider: string;
  rate: string;
  phone?: string;
  notes?: string;
  verified: boolean;
  userId?: string;
}

const getServiceIcon = (name: string) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("laundry") || lower.includes("wash") || lower.includes("iron")) return Shirt;
  if (lower.includes("cooler") || lower.includes("electric") || lower.includes("fan")) return Zap;
  if (lower.includes("print") || lower.includes("paper") || lower.includes("scan")) return Printer;
  if (lower.includes("laptop") || lower.includes("format") || lower.includes("repair") || lower.includes("setup")) return Wrench;
  return Sparkles;
};

const getProviderInitials = (name: string) => {
  const parts = (name || "Student").trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (name?.[0] || "S").toUpperCase();
};

const HOSTEL_COMMODITY_PRESETS = [
  "WiFi",
  "Attached Bath",
  "Generator / UPS",
  "AC",
  "Geyser",
  "Mess / Food",
  "Laundry",
  "Study Table",
  "Filtered Water",
  "Cleaning Staff",
];

export default function HostelPage() {
  const { user } = useAuth();
  const [roommates, setRoommates] = React.useState<RoommateListing[]>([]);
  const [services, setServices] = React.useState<HostelService[]>([]);
  const [requestedId, setRequestedId] = React.useState<string | null>(null);
  const [showPostModal, setShowPostModal] = React.useState(false);

  // Form states for adding roommate listing
  const [newTitle, setNewTitle] = React.useState("");
  const [newRent, setNewRent] = React.useState("");
  const [newDetails, setNewDetails] = React.useState("");
  const [newRoomType, setNewRoomType] = React.useState("Shared Room");
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = React.useState("");

  // Roommate Edit Modal State
  const [editingRoommate, setEditingRoommate] = React.useState<RoommateListing | null>(null);
  const [editRoomTitle, setEditRoomTitle] = React.useState("");
  const [editRoomRent, setEditRoomRent] = React.useState("");
  const [editRoomDetails, setEditRoomDetails] = React.useState("");
  const [editRoomType, setEditRoomType] = React.useState("Shared Room");
  const [editRoomAmenities, setEditRoomAmenities] = React.useState<string[]>([]);
  const [isUpdatingRoom, setIsUpdatingRoom] = React.useState(false);

  // Service Edit Modal State
  const [editingService, setEditingService] = React.useState<HostelService | null>(null);
  const [editServiceName, setEditServiceName] = React.useState("");
  const [editServiceRate, setEditServiceRate] = React.useState("");
  const [editServiceLocation, setEditServiceLocation] = React.useState("");
  const [editServiceSchedule, setEditServiceSchedule] = React.useState("");
  const [editServicePhone, setEditServicePhone] = React.useState("");
  const [editServiceNotes, setEditServiceNotes] = React.useState("");
  const [isUpdatingService, setIsUpdatingService] = React.useState(false);

  const handleAddCustomCommodity = () => {
    const val = customAmenityInput.trim();
    if (!val) return;
    if (!selectedAmenities.includes(val)) {
      setSelectedAmenities([...selectedAmenities, val]);
    }
    setCustomAmenityInput("");
  };

  const openEditRoommate = (room: RoommateListing, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoommate(room);
    setEditRoomTitle(room.title);
    setEditRoomRent(room.rent.replace(/[^\d]/g, ""));
    setEditRoomDetails(room.details);
    setEditRoomType(room.roomType || "Shared Room");
    setEditRoomAmenities(room.amenities || []);
  };

  const handleDeleteRoommate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this roommate vacancy?")) return;
    try {
      const supabase = createClient();
      await supabase.from("hostel_roommates").delete().eq("id", id);
      const updated = roommates.filter((r) => r.id !== id);
      setRoommates(updated);
      try {
        localStorage.setItem("campus_stitch_hostel_roommates", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.warn("Delete roommate error:", err);
    }
  };

  const handleSaveEditRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoommate || !editRoomTitle.trim() || !editRoomRent.trim()) return;
    setIsUpdatingRoom(true);
    try {
      const supabase = createClient();
      await supabase
        .from("hostel_roommates")
        .update({
          title: editRoomTitle.trim(),
          monthly_rent: Number(editRoomRent.trim()),
          room_type: editRoomType,
          details: editRoomDetails.trim(),
          amenities: editRoomAmenities,
        })
        .eq("id", editingRoommate.id);

      const updated = roommates.map((r) => {
        if (r.id === editingRoommate.id) {
          return {
            ...r,
            title: editRoomTitle.trim(),
            rent: `Rs. ${editRoomRent.trim()}`,
            details: editRoomDetails.trim(),
            roomType: editRoomType,
            amenities: editRoomAmenities,
          };
        }
        return r;
      });
      setRoommates(updated);
      try {
        localStorage.setItem("campus_stitch_hostel_roommates", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.warn("Update roommate error:", err);
    } finally {
      setIsUpdatingRoom(false);
      setEditingRoommate(null);
    }
  };

  const openEditService = (srv: HostelService, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingService(srv);
    setEditServiceName(srv.name);
    setEditServiceRate(srv.rate);
    setEditServiceLocation(srv.location);
    setEditServiceSchedule(srv.schedule);
    setEditServicePhone(srv.phone || "");
    setEditServiceNotes(srv.notes || "");
  };

  const handleDeleteService = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this service listing?")) return;
    try {
      const supabase = createClient();
      await supabase.from("hostel_services").delete().eq("id", id);
      const updated = services.filter((s) => s.id !== id);
      setServices(updated);
      try {
        localStorage.setItem("campus_stitch_hostel_services", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.warn("Delete service error:", err);
    }
  };

  const handleSaveEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editServiceName.trim() || !editServiceRate.trim()) return;
    setIsUpdatingService(true);
    try {
      const supabase = createClient();
      await supabase
        .from("hostel_services")
        .update({
          service_name: editServiceName.trim(),
          rate: editServiceRate.trim(),
          location: editServiceLocation.trim(),
          turnaround_time: editServiceSchedule.trim(),
          phone: editServicePhone.trim() || null,
          notes: editServiceNotes.trim() || null,
        })
        .eq("id", editingService.id);

      const updated = services.map((s) => {
        if (s.id === editingService.id) {
          return {
            ...s,
            name: editServiceName.trim(),
            rate: editServiceRate.trim(),
            location: editServiceLocation.trim(),
            schedule: editServiceSchedule.trim(),
            phone: editServicePhone.trim(),
            notes: editServiceNotes.trim(),
          };
        }
        return s;
      });
      setServices(updated);
      try {
        localStorage.setItem("campus_stitch_hostel_services", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.warn("Update service error:", err);
    } finally {
      setIsUpdatingService(false);
      setEditingService(null);
    }
  };

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
        let roomQuery = supabase.from("hostel_roommates").select("*").order("created_at", { ascending: false });
        let serviceQuery = supabase.from("hostel_services").select("*").order("created_at", { ascending: false });

        if (user?.campusId) {
          roomQuery = roomQuery.eq("campus_id", user.campusId);
          serviceQuery = serviceQuery.eq("campus_id", user.campusId);
        }

        const [roomsRes, servicesRes] = await Promise.all([roomQuery, serviceQuery]);

        if (!roomsRes.error && roomsRes.data !== null) {
          const mappedRooms: RoommateListing[] = roomsRes.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            rent: `Rs. ${r.monthly_rent}`,
            details: r.details || `${r.room_type || "Room"} in ${r.hostel_block || "Hostel"}. Available from ${r.available_from || "Immediate"}.`,
            roomType: r.room_type || "Shared Room",
            owner: r.user_name || "Student",
            program: user?.universityName || "University",
            verified: r.is_verified ?? true,
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            userId: r.user_id,
          }));
          setRoommates(mappedRooms);
          try {
            localStorage.setItem("campus_stitch_hostel_roommates", JSON.stringify(mappedRooms));
          } catch {}
        }

        if (!servicesRes.error && servicesRes.data !== null) {
          const mappedServices: HostelService[] = servicesRes.data.map((s: any) => ({
            id: s.id,
            name: s.service_name || s.name || "Student Service",
            location: s.location || "Hostel Block",
            schedule: s.turnaround_time || s.schedule || "Flexible",
            provider: s.provider_name || s.provider || "Student",
            rate: s.rate || "Standard rate",
            phone: s.phone || "",
            notes: s.notes || "",
            verified: s.is_verified ?? true,
            userId: s.user_id,
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
  }, [user?.campusId, user?.universityName]);

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
      amenities: selectedAmenities,
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
          amenities: selectedAmenities,
          details: newDetails.trim() || "Hostel room available for sharing",
          campus_id: user?.campusId || null,
          user_id: user?.userId || null,
        },
      ]);
    } catch (err) {
      console.warn("Supabase post roommate notice:", err);
    }

    setNewTitle("");
    setNewRent("");
    setNewDetails("");
    setSelectedAmenities([]);
    setCustomAmenityInput("");
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
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                      <MapPin size={11} className="text-zinc-500" />
                      <span>{user?.campusName || "Main Campus"} &bull; {user?.universityName || "UET Lahore"}</span>
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                    Hostel Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Verified Roommates & Campus Services for {user?.campusName || "Main Campus"}
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
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Details & Description</label>
                  <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    placeholder="Describe room condition, roommate preferences, quiet hours..."
                    rows={2}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                      Commodities & Amenities <span className="font-normal text-zinc-400">(Tap to select)</span>
                    </label>
                    {selectedAmenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAmenities([])}
                        className="text-[10px] text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Preset Quick-Select Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {HOSTEL_COMMODITY_PRESETS.map((item) => {
                      const isSelected = selectedAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
                            } else {
                              setSelectedAmenities([...selectedAmenities, item]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-2xs"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                          }`}
                        >
                          {isSelected ? `✓ ${item}` : `+ ${item}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Commodity */}
                  <div className="flex gap-1.5">
                    <input
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomCommodity();
                        }
                      }}
                      placeholder="Add custom commodity (e.g. Fridge, Balcony)..."
                      className="flex-1 h-8 px-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomCommodity}
                      className="h-8 px-3 text-xs font-semibold cursor-pointer border border-zinc-300 dark:border-zinc-700"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-750 cursor-pointer font-semibold"
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
                    const isMine =
                      (user?.userId && item.userId === user.userId) ||
                      (user?.name && item.owner?.toLowerCase().trim() === user.name.toLowerCase().trim());

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

                          {item.amenities && item.amenities.length > 0 && (
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
                          )}
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

                          {isMine ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => openEditRoommate(item, e)}
                                title="Edit Roommate Vacancy"
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteRoommate(item.id, e)}
                                title="Delete Vacancy"
                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
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
                          )}
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
                    const ServiceIcon = getServiceIcon(srv.name);
                    const initials = getProviderInitials(srv.provider);
                    const isMine =
                      (user?.userId && srv.userId === user.userId) ||
                      (user?.name && srv.provider?.toLowerCase().trim() === user.name.toLowerCase().trim());

                    return (
                      <div
                        key={srv.id}
                        className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-black dark:hover:border-white transition-all space-y-3.5"
                      >
                        {/* Header: Service Name, Category Icon & Rate */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shrink-0 mt-0.5">
                              <ServiceIcon size={16} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-black dark:text-white leading-snug">
                                {srv.name}
                              </h3>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                Student Campus Service
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 px-2.5 py-1 rounded-md text-xs font-extrabold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                            {srv.rate}
                          </span>
                        </div>

                        {/* Complete Provider Info Card */}
                        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                                <span className="truncate">{srv.provider}</span>
                                <VerificationBadge isVerified={srv.verified} size="xs" />
                              </div>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                Verified Service Provider
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin size={12} className="text-zinc-400 shrink-0" />
                              <span className="truncate">{srv.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Clock size={12} className="text-zinc-400 shrink-0" />
                              <span className="truncate">{srv.schedule}</span>
                            </div>
                            {srv.phone ? (
                              <div className="flex items-center gap-1.5 min-w-0 sm:col-span-2">
                                <Phone size={12} className="text-zinc-400 shrink-0" />
                                <span className="font-mono text-zinc-700 dark:text-zinc-300">{srv.phone}</span>
                              </div>
                            ) : null}
                          </div>

                          {srv.notes ? (
                            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                              &ldquo;{srv.notes}&rdquo;
                            </div>
                          ) : null}
                        </div>

                        {/* Actions */}
                        {isMine ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => openEditService(srv, e)}
                              className="flex-1 h-8.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            >
                              <Pencil size={13} />
                              <span>Edit Service</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteService(srv.id, e)}
                              className="h-8.5 px-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={`/messages?context=service&id=${encodeURIComponent(srv.id)}&name=${encodeURIComponent(srv.provider)}&title=${encodeURIComponent(srv.name)}`}
                            className="block w-full"
                          >
                            <Button
                              className="w-full h-8.5 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            >
                              <MessageSquare size={13} className="stroke-[2.2px]" />
                              <span>Chat with Provider</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ======================================================== */}
        {/* EDIT ROOMMATE MODAL                                      */}
        {/* ======================================================== */}
        {editingRoommate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <Pencil size={15} />
                  <span>Edit Roommate Vacancy</span>
                </div>
                <button
                  onClick={() => setEditingRoommate(null)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditRoommate} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Title
                  </label>
                  <input
                    value={editRoomTitle}
                    onChange={(e) => setEditRoomTitle(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Monthly Rent (Rs.)
                  </label>
                  <input
                    type="number"
                    value={editRoomRent}
                    onChange={(e) => setEditRoomRent(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Details & Description
                  </label>
                  <textarea
                    value={editRoomDetails}
                    onChange={(e) => setEditRoomDetails(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                    Amenities & Commodities
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {HOSTEL_COMMODITY_PRESETS.map((item) => {
                      const isSel = editRoomAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setEditRoomAmenities(editRoomAmenities.filter((a) => a !== item));
                            } else {
                              setEditRoomAmenities([...editRoomAmenities, item]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                            isSel
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {isSel ? `✓ ${item}` : `+ ${item}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingRoommate(null)}
                    className="flex-1 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingRoom}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    {isUpdatingRoom ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EDIT SERVICE MODAL                                       */}
        {/* ======================================================== */}
        {editingService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <Pencil size={15} />
                  <span>Edit Service Listing</span>
                </div>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditService} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Service Name
                  </label>
                  <input
                    value={editServiceName}
                    onChange={(e) => setEditServiceName(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Rate / Pricing
                    </label>
                    <input
                      value={editServiceRate}
                      onChange={(e) => setEditServiceRate(e.target.value)}
                      placeholder="e.g. Rs. 200/load"
                      required
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Hostel Location
                    </label>
                    <input
                      value={editServiceLocation}
                      onChange={(e) => setEditServiceLocation(e.target.value)}
                      placeholder="e.g. Block B, Room 22"
                      required
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Availability / Schedule
                    </label>
                    <input
                      value={editServiceSchedule}
                      onChange={(e) => setEditServiceSchedule(e.target.value)}
                      placeholder="e.g. 5:00 PM - 10:00 PM"
                      required
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      value={editServicePhone}
                      onChange={(e) => setEditServicePhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Notes / Description
                  </label>
                  <textarea
                    value={editServiceNotes}
                    onChange={(e) => setEditServiceNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingService(null)}
                    className="flex-1 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingService}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    {isUpdatingService ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
