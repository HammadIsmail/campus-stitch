"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SUPPORTED_UNIVERSITIES } from "@/lib/universities";
import { DEPARTMENTS } from "@/app/sign-up/page";

// -------------------------------------------------------------
// Queries (Data fetching)
// -------------------------------------------------------------

export function useUniversitiesQuery() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      try {
        const data = await apiClient<{ success: boolean; universities: any[] }>(
          "/api/universities"
        );
        if (data.success && Array.isArray(data.universities) && data.universities.length > 0) {
          return data.universities;
        }
        return SUPPORTED_UNIVERSITIES;
      } catch {
        return SUPPORTED_UNIVERSITIES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const data = await apiClient<{ success: boolean; departments: string[] }>(
          "/api/departments"
        );
        if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
          return data.departments;
        }
        return DEPARTMENTS;
      } catch {
        return DEPARTMENTS;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

// -------------------------------------------------------------
// Mutations (API actions)
// -------------------------------------------------------------

export function useCheckEmailMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      return apiClient<{ exists: boolean; message?: string }>("/api/auth/check-email", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export interface SignUpPayload {
  name: string;
  studentId?: string;
  email: string;
  password?: string;
  code?: string;
  university?: string;
  universityId?: string;
  campusId?: string;
  campusName?: string;
  city?: string;
  department?: string;
  program?: string;
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      return apiClient<{ success: boolean; message?: string; user?: any; token?: string }>(
        "/api/auth/sign-up",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
  });
}

export interface SignInPayload {
  email: string;
  password?: string;
  name?: string;
  studentId?: string;
  isDemo?: boolean;
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      return apiClient<{ success: boolean; message?: string; user?: any; token?: string }>(
        "/api/auth/sign-in",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
  });
}
