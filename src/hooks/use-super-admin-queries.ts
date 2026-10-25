"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CampusItem {
  id: string;
  universityId: string;
  name: string;
  city: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UniversityItem {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  province: string;
  logoUrl?: string;
  campuses: CampusItem[];
}

export interface CampusAdminItem {
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

export interface CandidateUser {
  id: string;
  full_name: string;
  email: string;
  university?: string;
  campus_name?: string;
  role?: string;
}

export interface AppVersionData {
  latestVersion: string;
  buildNumber: number;
  minSupportedVersion: string;
  minSupportedBuild: number;
  forceUpdate: boolean;
  title: string;
  releaseNotes: string;
  apkDownloadUrl: string;
  fileSize: string;
  releasedAt: string;
  updatedBy: string;
}

// -------------------------------------------------------------
// Queries
// -------------------------------------------------------------

export function useSuperAdminUniversitiesQuery() {
  return useQuery<UniversityItem[]>({
    queryKey: ["super-admin", "universities"],
    queryFn: async () => {
      const res = await apiClient<{ success: boolean; universities: UniversityItem[] }>("/api/universities");
      return res.universities || [];
    },
  });
}

export function useSuperAdminAdminsQuery() {
  return useQuery<{ admins: CampusAdminItem[]; candidates: CandidateUser[] }>({
    queryKey: ["super-admin", "admins"],
    queryFn: async () => {
      const res = await apiClient<{
        success: boolean;
        admins: CampusAdminItem[];
        candidates: CandidateUser[];
      }>("/api/admin/campus-admins");
      return { admins: res.admins || [], candidates: res.candidates || [] };
    },
  });
}

export function useSuperAdminVersionQuery() {
  return useQuery<AppVersionData | null>({
    queryKey: ["super-admin", "version"],
    queryFn: async () => {
      const res = await apiClient<{ success: boolean; version: AppVersionData }>("/api/app/version");
      return res.version || null;
    },
  });
}

// -------------------------------------------------------------
// Mutations
// -------------------------------------------------------------

export function useCreateUniversityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      shortName: string;
      city: string;
      province: string;
      initialCampuses?: { name: string; city: string }[];
    }) => {
      return apiClient<{ success: boolean; message: string; university: UniversityItem }>("/api/universities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
    },
  });
}

export function useUpdateUniversityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      shortName: string;
      city: string;
      province: string;
    }) => {
      return apiClient<{ success: boolean; message: string; university: UniversityItem }>("/api/universities", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function useDeleteUniversityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ success: boolean; message: string }>(`/api/universities?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function useCreateCampusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { universityId: string; name: string; city: string }) => {
      return apiClient<{ success: boolean; message: string; campus: CampusItem }>("/api/campuses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
    },
  });
}

export function useUpdateCampusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { campusId: string; name: string; city: string }) => {
      return apiClient<{ success: boolean; message: string; campus?: CampusItem }>("/api/campuses", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function useDeleteCampusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campusId: string) => {
      return apiClient<{ success: boolean; message: string }>(`/api/campuses?campusId=${encodeURIComponent(campusId)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "universities"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function useAssignCampusAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userEmail: string; userName: string; campusId: string }) => {
      return apiClient<{ success: boolean; message: string }>("/api/admin/campus-admins", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function useRevokeCampusAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userEmail: string) => {
      return apiClient<{ success: boolean; message: string }>("/api/admin/campus-admins", {
        method: "DELETE",
        body: JSON.stringify({ userIdOrEmail: userEmail }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
    },
  });
}

export function usePublishVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      latestVersion: string;
      buildNumber: number;
      minSupportedVersion: string;
      minSupportedBuild: number;
      forceUpdate: boolean;
      title: string;
      releaseNotes: string;
      apkDownloadUrl: string;
      fileSize: string;
      broadcastPush: boolean;
    }) => {
      return apiClient<{ success: boolean; version: AppVersionData; pushResult?: { sentCount: number } }>(
        "/api/admin/super/app-version",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "version"] });
    },
  });
}
