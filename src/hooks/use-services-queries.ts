"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CampusService {
  id: string;
  name: string;
  provider: string;
  location: string;
  schedule: string;
  rate: string;
  phone: string;
  notes?: string;
  verified: boolean;
  campusId?: string;
  userId?: string;
  created_at: string;
}

export function useServicesQuery() {
  return useQuery({
    queryKey: ["campus_services"],
    queryFn: async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("hostel_services")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            name: s.service_name || s.name || "Student Service",
            provider: s.provider_name || s.provider || "Student",
            location: s.location || "Campus Service Point",
            schedule: s.turnaround_time || s.schedule || "Daily",
            rate: s.rate || "Standard rate",
            phone: s.phone || "",
            notes: s.notes || "",
            verified: s.is_verified ?? true,
            campusId: s.campus_id,
            userId: s.user_id,
            created_at: s.created_at,
          })) as CampusService[];
        }
      } catch {}

      try {
        const local = localStorage.getItem("campus_stitch_services");
        if (local) return JSON.parse(local) as CampusService[];
      } catch {}

      return [] as CampusService[];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<CampusService, "id" | "created_at">) => {
      const newService: CampusService = {
        ...payload,
        id: "srv_" + Date.now(),
        created_at: new Date().toISOString(),
      };

      try {
        const local = JSON.parse(localStorage.getItem("campus_stitch_services") || "[]");
        local.unshift(newService);
        localStorage.setItem("campus_stitch_services", JSON.stringify(local));

        const supabase = createClient();
        await supabase.from("hostel_services").insert([
          {
            id: newService.id,
            service_name: newService.name,
            provider_name: newService.provider,
            location: newService.location,
            turnaround_time: newService.schedule,
            rate: newService.rate,
            phone: newService.phone,
            notes: newService.notes || "",
            is_verified: newService.verified,
            campus_id: newService.campusId || null,
            user_id: newService.userId || null,
          },
        ]);
      } catch (err) {
        console.warn("Supabase insert service error:", err);
      }

      return newService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus_services"] });
      queryClient.invalidateQueries({ queryKey: ["hostel_services"] });
    },
  });
}

// Backwards compatibility aliases
export type HostelService = CampusService;
export const useHostelServicesQuery = useServicesQuery;
export const useCreateHostelServiceMutation = useCreateServiceMutation;
