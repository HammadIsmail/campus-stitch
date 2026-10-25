"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataService, Ride, BikeItem } from "@/lib/data-service";
import { apiClient } from "@/lib/api-client";

export function useRidesQuery(campusId?: string) {
  return useQuery({
    queryKey: ["rides", campusId || "all"],
    queryFn: async () => {
      return DataService.getRides(campusId);
    },
    staleTime: 30 * 1000,
  });
}

export function useBikesQuery(campusId?: string) {
  return useQuery({
    queryKey: ["bikes", campusId || "all"],
    queryFn: async () => {
      return DataService.getBikes(campusId);
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateRideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ride: Omit<Ride, "id">) => {
      return DataService.createRide(ride);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });
}

export function useCreateBikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bike: Omit<BikeItem, "id">) => {
      return apiClient<{ success: boolean; bike?: BikeItem }>("/api/commute/bikes", {
        method: "POST",
        body: JSON.stringify(bike),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
    },
  });
}

export function useBookRideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { rideId: string; seats: number; riderName: string }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/commute/rides", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });
}
