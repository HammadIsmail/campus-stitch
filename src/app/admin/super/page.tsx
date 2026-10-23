"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  GraduationCap,
  Users,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Crown,
  LogOut,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface CampusItem {
  id: string;
  universityId: string;
  name: string;
  city: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
}

interface UniversityItem {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  province: string;
  logoUrl?: string;
  campuses: CampusItem[];
}

interface CampusAdminItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  campusId: string;
  campusName: string;
  universityId: string;
  universityName: string;
  assignedBy: string;
  assignedAt: string;
}

interface CandidateUser {
  id: string;
  full_name: string;
  email: string;
  university?: string;
  campus_name?: string;
  role?: string;
}

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"universities" | "admins">("universities");
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Universities & Campuses Data
  const [universities, setUniversities] = React.useState<UniversityItem[]>([]);
  const [searchUni, setSearchUni] = React.useState("");

  // Campus Admins Data
  const [campusAdmins, setCampusAdmins] = React.useState<CampusAdminItem[]>([]);
  const [candidates, setCandidates] = React.useState<CandidateUser[]>([]);

  // Modals / Forms
  const [showAddUniModal, setShowAddUniModal] = React.useState(false);
  const [showAddCampusModal, setShowAddCampusModal] = React.useState(false);
  const [selectedUniForCampus, setSelectedUniForCampus] = React.useState<UniversityItem | null>(null);
  const [showAssignAdminModal, setShowAssignAdminModal] = React.useState(false);

  // New University Form Fields
  const [newUniName, setNewUniName] = React.useState("");
  const [newUniShort, setNewUniShort] = React.useState("");
  const [newUniCity, setNewUniCity] = React.useState("");
  const [newUniProvince, setNewUniProvince] = React.useState("Punjab");
  const [newUniMainCampus, setNewUniMainCampus] = React.useState("Main Campus");
  const [isSubmittingUni, setIsSubmittingUni] = React.useState(false);

  // New Campus Form Fields
  const [newCampusName, setNewCampusName] = React.useState("");
  const [newCampusCity, setNewCampusCity] = React.useState("");
  const [isSubmittingCampus, setIsSubmittingCampus] = React.useState(false);

  // Assign Admin Form Fields
  const [targetCampusId, setTargetCampusId] = React.useState("");
  const [targetUserEmail, setTargetUserEmail] = React.useState("");
  const [targetUserName, setTargetUserName] = React.useState("");
  const [isSubmittingAdmin, setIsSubmittingAdmin] = React.useState(false);

  // Load Data
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [uniRes, adminRes] = await Promise.all([
        fetch("/api/universities"),
        fetch("/api/admin/campus-admins"),
      ]);

      const uniData = await uniRes.json();
      if (uniData.success && Array.isArray(uniData.universities)) {
        setUniversities(uniData.universities);
        if (uniData.universities[0]?.campuses?.[0]) {
          setTargetCampusId(uniData.universities[0].campuses[0].id);
        }
      }

      const adminData = await adminRes.json();
      if (adminData.success) {
        setCampusAdmins(adminData.admins || []);
        setCandidates(adminData.candidates || []);
      }
    } catch (err) {
      console.error("Failed to load super admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add University
  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim() || !newUniShort.trim() || !newUniCity.trim()) return;

    setIsSubmittingUni(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUniName.trim(),
          shortName: newUniShort.trim(),
          city: newUniCity.trim(),
          province: newUniProvince,
          initialCampuses: [
            {
              name: newUniMainCampus.trim() || "Main Campus",
              city: newUniCity.trim(),
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `University "${newUniShort}" and initial campus created!` });
        setShowAddUniModal(false);
        setNewUniName("");
        setNewUniShort("");
        setNewUniCity("");
        loadData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to create university" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmittingUni(false);
    }
  };

  // Handle Add Campus
  const handleAddCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniForCampus || !newCampusName.trim() || !newCampusCity.trim()) return;

    setIsSubmittingCampus(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/campuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: selectedUniForCampus.id,
          name: newCampusName.trim(),
          city: newCampusCity.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Campus "${newCampusName}" added to ${selectedUniForCampus.shortName}!`,
        });
        setShowAddCampusModal(false);
        setNewCampusName("");
        setNewCampusCity("");
        loadData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to add campus" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmittingCampus(false);
    }
  };

  // Handle Assign Campus Admin
  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCampusId || !targetUserEmail.trim()) return;

    setIsSubmittingAdmin(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/campus-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: targetUserEmail.trim(),
          userName: targetUserName.trim() || targetUserEmail.split("@")[0],
          campusId: targetCampusId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: data.message || "Campus Admin assigned successfully!",
        });
        setShowAssignAdminModal(false);
        setTargetUserEmail("");
        setTargetUserName("");
        loadData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to assign campus admin" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Handle Revoke Campus Admin
  const handleRevokeAdmin = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to revoke Campus Admin privileges for ${userEmail}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/campus-admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdOrEmail: userEmail }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Campus Admin revoked for ${userEmail}` });
        loadData();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to revoke admin" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to revoke admin" });
    }
  };

  const filteredUnis = universities.filter((u) => {
    const q = searchUni.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.shortName.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.campuses.some((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
    );
  });

  const totalCampuses = universities.reduce((acc, u) => acc + (u.campuses?.length || 0), 0);

  return (
    <MobileShell hideNav={true}>
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors pb-16">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121215]/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Back to Verification Queue"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-black dark:bg-white text-white dark:text-black">
                  <Crown size={14} />
                </span>
                <h1 className="text-sm font-extrabold text-black dark:text-white tracking-tight">
                  Super Admin Management Console
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
                  Platform Root
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Manage multi-tenant universities, campuses, and delegate Campus Admin roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all flex items-center gap-1.5"
            >
              <ShieldCheck size={13} />
              <span>KYC Queue</span>
            </Link>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Exit to public website"
            >
              Exit to App
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                window.location.href = "/sign-in";
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Log out of Super Admin session"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert */}
        {feedback && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-4">
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-zinc-800 dark:border-zinc-200"
                  : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 border-red-200 dark:border-red-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.text}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-[11px] font-bold underline opacity-80 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Key Metric Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Universities</span>
                <Building2 size={16} />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {universities.length}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Major Pakistani institutions
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Campuses</span>
                <MapPin size={16} />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {totalCampuses}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Isolated tenant databases
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Campus Admins</span>
                <Shield size={16} />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {campusAdmins.length}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Assigned campus moderators
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">System Mode</span>
                <Layers size={16} />
              </div>
              <div className="text-sm font-black text-black dark:text-white mt-1">
                Multi-Tenant Isolated
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Campus-level data isolation
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("universities")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "universities"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Building2 size={14} />
                <span>Universities & Campuses ({universities.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("admins")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "admins"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <UserCheck size={14} />
                <span>Campus Admins Delegation ({campusAdmins.length})</span>
              </button>
            </div>

            <div>
              {activeTab === "universities" ? (
                <Button
                  onClick={() => setShowAddUniModal(true)}
                  className="h-9 px-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add University</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAssignAdminModal(true)}
                  className="h-9 px-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  <span>Assign Campus Admin</span>
                </Button>
              )}
            </div>
          </div>

          {/* TAB 1: UNIVERSITIES & CAMPUSES */}
          {activeTab === "universities" && (
            <div className="space-y-4">
              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter universities by name, short code, or campus city..."
                  value={searchUni}
                  onChange={(e) => setSearchUni(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Universities List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUnis.map((uni) => (
                  <div
                    key={uni.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs hover:border-black dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-sm font-extrabold text-black dark:text-white">
                            {uni.shortName}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                            {uni.name}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          {uni.province}
                        </span>
                      </div>

                      {/* Campuses Pill List */}
                      <div className="mt-3">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Campuses ({uni.campuses?.length || 0})</span>
                          <button
                            onClick={() => {
                              setSelectedUniForCampus(uni);
                              setShowAddCampusModal(true);
                            }}
                            className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
                          >
                            <Plus size={11} />
                            <span>Add Campus</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {uni.campuses && uni.campuses.length > 0 ? (
                            uni.campuses.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-black dark:text-white border border-zinc-200 dark:border-zinc-700"
                              >
                                <MapPin size={11} className="text-zinc-500" />
                                <span>{c.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-400 italic">No campuses registered yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Primary City: <strong className="text-black dark:text-white">{uni.city}</strong></span>
                      <span className="text-[11px] font-mono opacity-70">{uni.slug}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CAMPUS ADMINS DELEGATION */}
          {activeTab === "admins" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-black dark:text-white">
                      Active Campus Administrators
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Campus admins have authority to review student KYC verification requests and moderate activities for their campus.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAssignAdminModal(true)}
                    className="h-8 px-3 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <UserPlus size={13} />
                    <span>Assign Admin</span>
                  </Button>
                </div>

                {campusAdmins.length === 0 ? (
                  <div className="p-8 text-center space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <Shield className="w-8 h-8 text-zinc-400 mx-auto stroke-[1.5]" />
                    <div className="text-sm font-bold text-black dark:text-white">
                      No Campus Admins Assigned Yet
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Click &quot;Assign Admin&quot; to designate any registered student as the moderator and verifier for a campus.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                          <th className="py-2.5 px-3">Administrator</th>
                          <th className="py-2.5 px-3">Assigned Campus</th>
                          <th className="py-2.5 px-3">University</th>
                          <th className="py-2.5 px-3">Assigned On</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {campusAdmins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-black dark:text-white">{admin.userName}</div>
                              <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">{admin.userEmail}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 font-semibold text-black dark:text-white">
                                <MapPin size={12} className="text-zinc-400" />
                                {admin.campusName}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 font-medium">
                              {admin.universityName}
                            </td>
                            <td className="py-3 px-3 text-zinc-500 text-[11px]">
                              {new Date(admin.assignedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleRevokeAdmin(admin.userEmail)}
                                className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/60 transition-colors inline-flex items-center gap-1"
                              >
                                <Trash2 size={11} />
                                <span>Revoke</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* MODAL 1: ADD UNIVERSITY */}
        {showAddUniModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
                    <Building2 size={16} />
                  </span>
                  <h3 className="text-sm font-extrabold text-black dark:text-white">
                    Add New University
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddUniModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUniversity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Full University Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ghulam Ishaq Khan Institute (GIKI)"
                    value={newUniName}
                    onChange={(e) => setNewUniName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-black dark:text-white mb-1">
                      Short Name / Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GIKI"
                      value={newUniShort}
                      onChange={(e) => setNewUniShort(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-black dark:text-white mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Topi"
                      value={newUniCity}
                      onChange={(e) => setNewUniCity(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-black dark:text-white mb-1">
                      Province *
                    </label>
                    <select
                      value={newUniProvince}
                      onChange={(e) => setNewUniProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                      <option value="Azad Jammu & Kashmir">AJK</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-black dark:text-white mb-1">
                      Initial Campus Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Campus"
                      value={newUniMainCampus}
                      onChange={(e) => setNewUniMainCampus(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddUniModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmittingUni}
                    className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    {isSubmittingUni ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>Create University</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD CAMPUS TO UNIVERSITY */}
        {showAddCampusModal && selectedUniForCampus && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-black dark:text-white">
                      Add Campus
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Under {selectedUniForCampus.shortName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCampusModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCampus} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Campus Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kala Shah Kaku (KSK) Campus"
                    value={newCampusName}
                    onChange={(e) => setNewCampusName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Campus City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kala Shah Kaku"
                    value={newCampusCity}
                    onChange={(e) => setNewCampusCity(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddCampusModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmittingCampus}
                    className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    {isSubmittingCampus ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>Add Campus</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ASSIGN CAMPUS ADMIN */}
        {showAssignAdminModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
                    <UserPlus size={16} />
                  </span>
                  <h3 className="text-sm font-extrabold text-black dark:text-white">
                    Delegate Campus Administrator
                  </h3>
                </div>
                <button
                  onClick={() => setShowAssignAdminModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssignAdmin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Select Target Campus *
                  </label>
                  <select
                    value={targetCampusId}
                    onChange={(e) => setTargetCampusId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  >
                    {universities.map((u) => (
                      <optgroup key={u.id} label={u.shortName}>
                        {u.campuses?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {u.shortName} · {c.name} ({c.city})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    User Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. moderator@uet.edu.pk or student@gmail.com"
                    value={targetUserEmail}
                    onChange={(e) => setTargetUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  {candidates.length > 0 && (
                    <div className="mt-1.5">
                      <span className="text-[10px] text-zinc-400">Quick select recent user:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {candidates.slice(0, 4).map((cand) => (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => {
                              setTargetUserEmail(cand.email);
                              setTargetUserName(cand.full_name);
                            }}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                          >
                            {cand.full_name || cand.email.split("@")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Moderator"
                    value={targetUserName}
                    onChange={(e) => setTargetUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAssignAdminModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmittingAdmin}
                    className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    {isSubmittingAdmin ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                    <span>Assign Admin Rights</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
