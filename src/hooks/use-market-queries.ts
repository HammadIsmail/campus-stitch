"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataService, Listing } from "@/lib/data-service";
import { apiClient } from "@/lib/api-client";

export function useMarketListingsQuery(campusId?: string, category?: string) {
  return useQuery({
    queryKey: ["listings", campusId || "all", category || "all"],
    queryFn: async () => {
      let listings = await DataService.getListings(campusId);
      if (category && category !== "All") {
        listings = listings.filter((l) => l.category === category);
      }
      return listings;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateListingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Omit<Listing, "id">) => {
      return DataService.createListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDeleteListingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ success: boolean }>(`/api/market?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useSendOfferMutation() {
  return useMutation({
    mutationFn: async (payload: {
      listingId: string;
      offerPrice: number;
      buyerName: string;
      message?: string;
    }) => {
      return apiClient<{ success: boolean; message?: string }>("/api/market/offer", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "campus_stitch/marketplace");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      return data.url as string;
    },
  });
}
