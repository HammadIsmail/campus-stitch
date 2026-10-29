"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  ChevronRight,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Shirt,
  Printer,
  Zap,
  Plus,
  X,
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
  Star,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StudentProfileModal } from "@/components/student-profile-modal";
import { ReviewModal } from "@/components/review-modal";
import { CampusService } from "@/hooks/use-services-queries";

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

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = React.useState<CampusService[]>([]);
  const [showOfferModal, setShowOfferModal] = React.useState(false);

  // Student Profile & Review Modals State
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

  // New Service Form State
  const [newServiceName, setNewServiceName] = React.useState("");
  const [newServiceRate, setNewServiceRate] = React.useState("");
  const [newServiceLocation, setNewServiceLocation] = React.useState("Campus Service Point");
  const [newServiceSchedule, setNewServiceSchedule] = React.useState("Daily 5 PM – 10 PM");
  const [newServicePhone, setNewServicePhone] = React.useState("");
  const [newServiceNotes, setNewServiceNotes] = React.useState("");
  const [isCreatingService, setIsCreatingService] = React.useState(false);

  // Service Edit Modal State
  const [editingService, setEditingService] = React.useState<CampusService | null>(null);
  const [editServiceName, setEditServiceName] = React.useState("");
  const [editServiceRate, setEditServiceRate] = React.useState("");
  const [editServiceLocation, setEditServiceLocation] = React.useState("");
  const [editServiceSchedule, setEditServiceSchedule] = React.useState("");
  const [editServicePhone, setEditServicePhone] = React.useState("");
  const [editServiceNotes, setEditServiceNotes] = React.useState("");
  const [isUpdatingService, setIsUpdatingService] = React.useState(false);

  const openEditService = (srv: CampusService, e: React.MouseEvent) => {
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
        localStorage.setItem("campus_stitch_services", JSON.stringify(updated));
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
        localStorage.setItem("campus_stitch_services", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.warn("Update service error:", err);
    } finally {
      setIsUpdatingService(false);
      setEditingService(null);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServiceRate.trim()) return;
    setIsCreatingService(true);

    const providerName = user?.name || "Student Provider";
    const newSrv: CampusService = {
      id: crypto.randomUUID(),
      name: newServiceName.trim(),
      rate: newServiceRate.trim(),
      location: newServiceLocation.trim() || "Campus Service Point",
      schedule: newServiceSchedule.trim() || "Daily",
      provider: providerName,
      phone: newServicePhone.trim() || "",
      notes: newServiceNotes.trim() || "",
      verified: user?.isVerified ?? false,
      userId: user?.userId,
      created_at: new Date().toISOString(),
    };

    const updated = [newSrv, ...services];
    setServices(updated);
    try {
      localStorage.setItem("campus_stitch_services", JSON.stringify(updated));
    } catch {}

    try {
      const supabase = createClient();
      await supabase.from("hostel_services").insert([
        {
          id: newSrv.id,
          provider_name: providerName,
          service_name: newServiceName.trim(),
          rate: newServiceRate.trim(),
          location: newServiceLocation.trim() || "Campus Service Point",
          turnaround_time: newServiceSchedule.trim() || "Daily",
          phone: newServicePhone.trim() || null,
          notes: newServiceNotes.trim() || null,
          is_verified: user?.isVerified ?? false,
          campus_id: user?.campusId || null,
          user_id: user?.userId || null,
        },
      ]);
    } catch (err) {
      console.warn("Create service error:", err);
    } finally {
      setIsCreatingService(false);
      setShowOfferModal(false);
      setNewServiceName("");
      setNewServiceRate("");
      setNewServicePhone("");
      setNewServiceNotes("");
    }
  };

  React.useEffect(() => {
    async function loadServicesData() {
      // 1. Instant render from local storage if available
      try {
        const storedServices = localStorage.getItem("campus_stitch_services");
        if (storedServices) {
          setServices(JSON.parse(storedServices));
        }
      } catch {}

      // 2. Fetch fresh data from Supabase
      try {
        const supabase = createClient();
        let serviceQuery = supabase.from("hostel_services").select("*").order("created_at", { ascending: false });

        if (user?.campusId) {
          serviceQuery = serviceQuery.eq("campus_id", user.campusId);
        }

        const servicesRes = await serviceQuery;

        if (!servicesRes.error && servicesRes.data !== null) {
          const mappedServices: CampusService[] = servicesRes.data.map((s: any) => ({
            id: s.id,
            name: s.service_name || s.name || "Student Service",
            location: s.location || "Campus Service Point",
            schedule: s.turnaround_time || s.schedule || "Flexible",
            provider: s.provider_name || s.provider || "Student",
            rate: s.rate || "Standard rate",
            phone: s.phone || "",
            notes: s.notes || "",
            verified: s.is_verified ?? true,
            userId: s.user_id,
            created_at: s.created_at,
          }));
          setServices(mappedServices);
          try {
            localStorage.setItem("campus_stitch_services", JSON.stringify(mappedServices));
          } catch {}
        }
      } catch (err) {
        console.warn("Campus services fetch notice:", err);
      }
    }

    loadServicesData();
  }, [user?.campusId]);

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-5 transition-colors">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                  <Wrench size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                  Campus Services Hub
                </h1>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Verified student-run door-to-door services across {user?.campusName || "campus"} hostels and halls
              </p>
            </div>

            <Button
              onClick={() => setShowOfferModal(true)}
              className="h-10 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Offer Campus Service</span>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-black dark:text-white tracking-tight">
                Available Student Services
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Laundry, ironing, printing, room setup, and technical repairs run by fellow verified students
              </p>
            </div>
            <span className="text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
              {services.length} active
            </span>
          </div>

          {services.length === 0 ? (
            <div className="p-12 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 shadow-2xs">
              <Wrench size={36} className="mx-auto text-zinc-400 stroke-[1.5px]" />
              <div className="text-sm font-bold text-black dark:text-white">No student services listed yet</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Offer laundry pickup, emergency printing, or appliance repair to help batchmates earn and save time.
              </p>
              <Button
                onClick={() => setShowOfferModal(true)}
                className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Offer First Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => {
                const ServiceIcon = getServiceIcon(srv.name);
                const initials = getProviderInitials(srv.provider);
                const isMine =
                  (user?.userId && srv.userId === user.userId) ||
                  (user?.name && srv.provider?.toLowerCase().trim() === user.name.toLowerCase().trim());

                return (
                  <div
                    key={srv.id}
                    className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between gap-3.5"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shrink-0 mt-0.5">
                            <ServiceIcon size={16} />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-black dark:text-white leading-snug">
                              {srv.name}
                            </h3>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                              Campus Service
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                          {srv.rate}
                        </span>
                      </div>

                      {/* Provider Card */}
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalTarget({
                              userId: srv.userId || srv.provider,
                              name: srv.provider,
                              isVerified: srv.verified,
                            });
                          }}
                          className="flex items-center gap-2 hover:underline text-left w-full cursor-pointer"
                        >
                          <span className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                              <span className="truncate">{srv.provider}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              Student Provider · View Profile
                            </div>
                          </div>
                        </button>

                        <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin size={12} className="text-zinc-400 shrink-0" />
                            <span className="truncate">{srv.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock size={12} className="text-zinc-400 shrink-0" />
                            <span className="truncate">{srv.schedule}</span>
                          </div>
                          {srv.phone ? (
                            <div className="flex items-center gap-1.5 min-w-0">
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
                    </div>

                    {/* Actions */}
                    {isMine ? (
                      <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={(e) => openEditService(srv, e)}
                          className="flex-1 h-8.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
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
                      <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <Link
                          href={`/messages?context=service&id=${encodeURIComponent(srv.id)}&name=${encodeURIComponent(srv.provider)}&title=${encodeURIComponent(srv.name)}`}
                          className="flex-1"
                        >
                          <Button className="w-full h-8.5 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                            <MessageSquare size={13} className="stroke-[2.2px]" />
                            <span>Chat</span>
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalTarget({
                              userId: srv.userId || srv.provider,
                              name: srv.provider,
                              category: "service",
                            });
                          }}
                          className="px-3 h-8.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>Rate</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* In-person payment notice */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed text-center">
            Campus Rule: All service fees are settled directly between students in cash upon delivery or completion. No in-app payment transactions occur on this platform.
          </div>
        </main>

        {/* ======================================================== */}
        {/* OFFER CAMPUS SERVICE MODAL                               */}
        {/* ======================================================== */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <Wrench size={16} />
                  <span>Offer Campus Service</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Service Name & Type *
                  </label>
                  <input
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Laundry & Ironing, Fast Printing Delivery"
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Rate / Price *
                    </label>
                    <input
                      required
                      value={newServiceRate}
                      onChange={(e) => setNewServiceRate(e.target.value)}
                      placeholder="e.g. Rs. 200/load"
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Location / Hostel Block
                    </label>
                    <input
                      value={newServiceLocation}
                      onChange={(e) => setNewServiceLocation(e.target.value)}
                      placeholder="e.g. Hostel Block A"
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Turnaround / Hours
                    </label>
                    <input
                      value={newServiceSchedule}
                      onChange={(e) => setNewServiceSchedule(e.target.value)}
                      placeholder="e.g. Daily 6 PM - 11 PM"
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Contact Phone (Optional)
                    </label>
                    <input
                      value={newServicePhone}
                      onChange={(e) => setNewServicePhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Notes & Specifications
                  </label>
                  <textarea
                    value={newServiceNotes}
                    onChange={(e) => setNewServiceNotes(e.target.value)}
                    placeholder="Specify delivery rules, WhatsApp availability, or turnaround details..."
                    rows={2}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 text-xs border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingService}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    {isCreatingService ? <Loader2 size={13} className="animate-spin" /> : "Publish Service"}
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
                  <span>Edit Campus Service</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditService} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Service Name *
                  </label>
                  <input
                    required
                    value={editServiceName}
                    onChange={(e) => setEditServiceName(e.target.value)}
                    className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Rate / Price *
                    </label>
                    <input
                      required
                      value={editServiceRate}
                      onChange={(e) => setEditServiceRate(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Location
                    </label>
                    <input
                      value={editServiceLocation}
                      onChange={(e) => setEditServiceLocation(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Schedule
                    </label>
                    <input
                      value={editServiceSchedule}
                      onChange={(e) => setEditServiceSchedule(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Phone
                    </label>
                    <input
                      value={editServicePhone}
                      onChange={(e) => setEditServicePhone(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editServiceNotes}
                    onChange={(e) => setEditServiceNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingService(null)}
                    className="flex-1 text-xs border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingService}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    {isUpdatingService ? <Loader2 size={13} className="animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SHARED REPUTATION & PROFILE MODALS                       */}
        {/* ======================================================== */}
        {profileModalTarget && (
          <StudentProfileModal
            isOpen={!!profileModalTarget}
            onClose={() => setProfileModalTarget(null)}
            userId={profileModalTarget.userId}
            fallbackName={profileModalTarget.name}
            fallbackVerified={profileModalTarget.isVerified}
          />
        )}

        {reviewModalTarget && (
          <ReviewModal
            isOpen={!!reviewModalTarget}
            onClose={() => setReviewModalTarget(null)}
            targetUserId={reviewModalTarget.userId}
            targetName={reviewModalTarget.name}
            defaultCategory={reviewModalTarget.category || "service"}
          />
        )}
      </div>
    </MobileShell>
  );
}
