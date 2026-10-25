"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CommunityPost {
  id: string;
  university_id?: string;
  campus_id?: string;
  community_id?: string;
  community_name?: string;
  author_name: string;
  author_avatar?: string;
  author_verified: boolean;
  title: string;
  content: string;
  image_url?: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  comments_count: number;
  created_at: string;
}

export function useCommunityPostsQuery(campusId?: string, communityId?: string) {
  return useQuery({
    queryKey: ["community_posts", campusId || "all", communityId || "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (campusId) params.set("campusId", campusId);
      if (communityId) params.set("communityId", communityId);
      const url = `/api/community/posts${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await apiClient<{ success: boolean; posts: CommunityPost[] }>(url);
      return res.posts || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCommunityListQuery(campusId?: string) {
  return useQuery({
    queryKey: ["communities", campusId || "all"],
    queryFn: async () => {
      const url = `/api/community/list${campusId ? `?campusId=${encodeURIComponent(campusId)}` : ""}`;
      const res = await apiClient<{ success: boolean; communities: any[] }>(url);
      return res.communities || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      community_id?: string;
      community_name?: string;
      tags?: string[];
      image_url?: string;
      campus_id?: string;
    }) => {
      return apiClient<{ success: boolean; post?: CommunityPost }>("/api/community/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    },
  });
}

export function useVotePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { postId: string; voteType: "up" | "down" }) => {
      return apiClient<{ success: boolean; upvotes?: number; downvotes?: number }>(
        "/api/community/posts/vote",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    },
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { postId: string; content: string; authorName?: string }) => {
      return apiClient<{ success: boolean; comment?: any }>("/api/community/comments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    },
  });
}

export function useCreateCommunityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      category: string;
      campus_id?: string;
    }) => {
      return apiClient<{ success: boolean; community?: any }>("/api/community/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
}
