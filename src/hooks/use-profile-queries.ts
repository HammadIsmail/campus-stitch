"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId || "me"],
    queryFn: async () => {
      const url = userId ? `/api/profile?userId=${encodeURIComponent(userId)}` : "/api/auth/me";
      return apiClient<{ success: boolean; user?: any; profile?: any }>(url);
    },
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      phone?: string;
      bio?: string;
      department?: string;
      program?: string;
      avatarUrl?: string;
    }) => {
      return apiClient<{ success: boolean; user?: any }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; password?: string; reason?: string }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/profile", {
        method: "DELETE",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useRequestResetCodeMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/auth/password/request", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useConfirmResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; code: string; newPassword: string }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/auth/password/reset", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useContactMutation() {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}
