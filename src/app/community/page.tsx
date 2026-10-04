"use client";

import * as React from "react";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  X,
  Image as ImageIcon,
  Link2,
  Globe,
  Tag,
  BookOpen,
  GraduationCap,
  Building2,
  Car,
  Briefcase,
  Trophy,
  Smile,
  AlertCircle,
  Clock,
  ExternalLink,
  Menu,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  member_count: number;
  rules: string[];
}

interface Post {
  id: string;
  community_id: string;
  community_name: string;
  author_id: string;
  author_name: string;
  author_student_id: string;
  author_verified: boolean;
  title: string;
  content: string;
  flair: string;
  image_url?: string | null;
  link_url?: string | null;
  upvotes: number;
  downvotes: number;
  score: number;
  comments_count: number;
  created_at: string;
  userVote?: number; // 1, -1, 0
}

interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_id: string;
  author_name: string;
  author_student_id: string;
  author_verified: boolean;
  content: string;
  upvotes: number;
  score: number;
  created_at: string;
  userVote?: number;
}

const FLAIR_COLORS: Record<string, string> = {
  Resource: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Question: "bg-blue-50 text-blue-800 border-blue-200",
  Discussion: "bg-purple-50 text-purple-800 border-purple-200",
  Notice: "bg-amber-50 text-amber-800 border-amber-200",
  Carpool: "bg-teal-50 text-teal-800 border-teal-200",
  Meme: "bg-pink-50 text-pink-800 border-pink-200",
  Event: "bg-indigo-50 text-indigo-800 border-indigo-200",
};

export default function RedditCommunitiesPage() {
  const { user } = useAuth();

  // Navigation & Filtering
  const [selectedCommunity, setSelectedCommunity] = React.useState<string>("all");
  const [feedFilter, setFeedFilter] = React.useState<"all" | "joined">("all");
  const [activeSort, setActiveSort] = React.useState<"hot" | "new" | "top">("hot");
  const [selectedFlair, setSelectedFlair] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [communitySearch, setCommunitySearch] = React.useState<string>("");

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Data states
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [joinedCommunities, setJoinedCommunities] = React.useState<Record<string, boolean>>({
    "r/cs-uet": true,
    "r/commute-splits": true,
    "r/exam-pastpapers": true,
  });
  const [savedPosts, setSavedPosts] = React.useState<Record<string, boolean>>({});

  const [isLoading, setIsLoading] = React.useState(true);
  const [copyFeedback, setCopyFeedback] = React.useState<string | null>(null);

  // Modals & Panels
  const [showCreatePost, setShowCreatePost] = React.useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = React.useState(false);
  const [activePostForComments, setActivePostForComments] = React.useState<Post | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [replyingToCommentId, setReplyingToCommentId] = React.useState<string | null>(null);

  // Create Post Form State
  const [postTab, setPostTab] = React.useState<"text" | "image" | "link">("text");
  const [postFormCommunity, setPostFormCommunity] = React.useState("r/cs-uet");
  const [postFormTitle, setPostFormTitle] = React.useState("");
  const [postFormContent, setPostFormContent] = React.useState("");
  const [postFormFlair, setPostFormFlair] = React.useState("Discussion");
  const [postFormImageUrl, setPostFormImageUrl] = React.useState("");
  const [postFormLinkUrl, setPostFormLinkUrl] = React.useState("");
  const [isSubmittingPost, setIsSubmittingPost] = React.useState(false);

  // Create Community Form State
  const [commFormName, setCommFormName] = React.useState("");
  const [commFormTitle, setCommFormTitle] = React.useState("");
  const [commFormDesc, setCommFormDesc] = React.useState("");
  const [commFormCategory, setCommFormCategory] = React.useState("Academic");
  const [isSubmittingComm, setIsSubmittingComm] = React.useState(false);

  // Rules Accordion
  const [expandedRule, setExpandedRule] = React.useState<number | null>(null);

  // Load joined communities from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("campus_stitch_joined_communities");
      if (stored) {
        setJoinedCommunities(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch Communities List
  const fetchCommunities = React.useCallback(async () => {
    try {
      const res = await fetch("/api/community/list");
      const data = await res.json();
      if (data.success && data.communities) {
        setCommunities(data.communities);
      }
    } catch (err) {
      console.warn("Failed to load communities:", err);
    }
  }, []);

  // Fetch Posts
  const fetchPosts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCommunity && selectedCommunity !== "all") {
        params.set("community", selectedCommunity);
      }
      params.set("sort", activeSort);
      if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
      }

      const res = await fetch(`/api/community/posts?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.warn("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCommunity, activeSort, searchQuery]);

  React.useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Voting on Posts (Reddit Upvote / Downvote logic)
  const handleVote = async (postId: string, direction: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const currentVote = post.userVote || 0;
        let newVote: number = direction;
        let delta = 0;

        if (currentVote === direction) {
          // Toggle off vote
          newVote = 0;
          delta = -direction;
        } else if (currentVote === 0) {
          // New vote
          newVote = direction;
          delta = direction;
        } else {
          // Switch vote from +1 to -1 or vice-versa (delta is 2 or -2)
          newVote = direction;
          delta = direction * 2;
        }

        return {
          ...post,
          userVote: newVote,
          score: post.score + delta,
          upvotes: direction === 1 && newVote === 1 ? post.upvotes + 1 : post.upvotes,
          downvotes: direction === -1 && newVote === -1 ? post.downvotes + 1 : post.downvotes,
        };
      })
    );

    try {
      await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          voteType: direction === 1 ? "upvote" : "downvote",
          userId: user?.userId || "u_student",
        }),
      });
    } catch (err) {
      console.warn("Vote sync notice:", err);
    }
  };

  // Handle Join / Leave Community
  const handleToggleJoin = async (comm: Community, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlyJoined = joinedCommunities[comm.name];
    const newStatus = !isCurrentlyJoined;

    const nextState = {
      ...joinedCommunities,
      [comm.name]: newStatus,
    };
    setJoinedCommunities(nextState);

    try {
      localStorage.setItem("campus_stitch_joined_communities", JSON.stringify(nextState));
    } catch {}

    setCommunities((prev) =>
      prev.map((c) =>
        c.name === comm.name
          ? {
              ...c,
              member_count: Math.max(1, c.member_count + (newStatus ? 1 : -1)),
            }
          : c
      )
    );

    try {
      await fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: comm.id,
          userId: user?.userId || "u_student",
        }),
      });
    } catch (err) {
      console.warn("Join sync error:", err);
    }
  };

  // Toggle Save Post
  const handleToggleSave = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Copy Post Link
  const handleSharePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(`${window.location.origin}/community?post=${postId}`);
      setCopyFeedback("Link copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Open Post & Load Comments
  const handleOpenComments = async (post: Post) => {
    setActivePostForComments(post);
    setIsLoadingComments(true);
    setReplyingToCommentId(null);
    setNewCommentText("");

    try {
      const res = await fetch(`/api/community/comments?postId=${post.id}`);
      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.warn("Failed to load comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Submit Comment or Nested Reply
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activePostForComments) return;

    const parentId = replyingToCommentId;
    const authorName = user?.name || "Muhammad Hammad Ismail";
    const authorStudentId = user?.studentId || "2023-CS-807";

    const optimisticComment: Comment = {
      id: "cm_" + Date.now(),
      post_id: activePostForComments.id,
      parent_comment_id: parentId,
      author_id: user?.userId || "u_student",
      author_name: authorName,
      author_student_id: authorStudentId,
      author_verified: true,
      content: newCommentText.trim(),
      upvotes: 1,
      score: 1,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, optimisticComment]);
    setNewCommentText("");
    setReplyingToCommentId(null);

    // Update comment count on post
    setPosts((prev) =>
      prev.map((p) =>
        p.id === activePostForComments.id
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      )
    );

    try {
      await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: activePostForComments.id,
          parentCommentId: parentId,
          content: optimisticComment.content,
          authorName,
          authorStudentId,
        }),
      });
    } catch (err) {
      console.warn("Comment submit notice:", err);
    }
  };

  // Submit Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postFormTitle.trim()) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityName: postFormCommunity,
          title: postFormTitle.trim(),
          content: postFormContent.trim(),
          flair: postFormFlair,
          imageUrl: postTab === "image" ? postFormImageUrl.trim() : null,
          linkUrl: postTab === "link" ? postFormLinkUrl.trim() : null,
          authorName: user?.name || "Muhammad Hammad Ismail",
          authorStudentId: user?.studentId || "2023-CS-807",
          authorId: user?.userId || "u_student",
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setShowCreatePost(false);
        setPostFormTitle("");
        setPostFormContent("");
        setPostFormImageUrl("");
        setPostFormLinkUrl("");
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit Create Sub-Community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commFormName.trim() || !commFormTitle.trim()) return;

    let cleanName = commFormName.trim().toLowerCase();
    if (!cleanName.startsWith("r/")) {
      cleanName = "r/" + cleanName;
    }

    setIsSubmittingComm(true);
    try {
      const res = await fetch("/api/community/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          title: commFormTitle.trim(),
          description: commFormDesc.trim(),
          category: commFormCategory,
        }),
      });

      const data = await res.json();
      if (data.success && data.community) {
        setCommunities((prev) => [data.community, ...prev]);
        setJoinedCommunities((prev) => ({ ...prev, [cleanName]: true }));
        setSelectedCommunity(cleanName);
        setShowCreateCommunity(false);
        setCommFormName("");
        setCommFormTitle("");
        setCommFormDesc("");
      }
    } catch (err) {
      console.error("Create community error:", err);
    } finally {
      setIsSubmittingComm(false);
    }
  };

  const currentCommunityData = communities.find(
    (c) => c.name === selectedCommunity
  );

  // Filter posts by feedFilter (joined only vs all) and flair
  const filteredPosts = posts.filter((post) => {
    if (feedFilter === "joined" && !joinedCommunities[post.community_name]) {
      return false;
    }
    if (selectedFlair !== "all" && post.flair !== selectedFlair) {
      return false;
    }
    return true;
  });

  // Filter communities for sidebar search
  const visibleCommunities = communities.filter((c) => {
    if (!communitySearch.trim()) return true;
    const q = communitySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
  });

  const categories = Array.from(new Set(communities.map((c) => c.category || "General")));

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F8F9FA] text-zinc-900 select-none">
        {/* Copy link feedback banner */}
        {copyFeedback && (
          <div className="fixed top-20 right-6 z-50 bg-black text-white text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={14} className="text-emerald-400" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* REDDIT 3-COLUMN MAIN LAYOUT                              */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* ======================================================== */}
          {/* COLUMN 1: LEFT COMMUNITIES SIDEBAR                       */}
          {/* ======================================================== */}
          <aside
            className={cn(
              "w-64 lg:w-72 border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-transform z-30",
              mobileSidebarOpen
                ? "fixed inset-y-0 left-0 shadow-2xl z-50 w-72 flex"
                : "hidden md:flex"
            )}
          >
            {/* Sidebar Top Header */}
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-sm text-black">
                <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-black">
                  r/
                </span>
                <span>Communities</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1 text-zinc-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {/* Feeds Section */}
            <div className="p-2 border-b border-zinc-100 space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Feeds
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCommunity("all");
                  setFeedFilter("all");
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left",
                  selectedCommunity === "all" && feedFilter === "all"
                    ? "bg-black text-white shadow-2xs"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Globe size={15} />
                  <span>All Campus Feeds</span>
                </span>
                <span className="text-[10px] opacity-70 font-mono">r/all</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCommunity("all");
                  setFeedFilter("joined");
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left",
                  selectedCommunity === "all" && feedFilter === "joined"
                    ? "bg-black text-white shadow-2xs"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Users size={15} />
                  <span>My Subscriptions</span>
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                    selectedCommunity === "all" && feedFilter === "joined"
                      ? "bg-zinc-800 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  {Object.values(joinedCommunities).filter(Boolean).length}
                </span>
              </button>
            </div>

            {/* Community Search Filter */}
            <div className="p-2.5 border-b border-zinc-100">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Filter communities..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="w-full h-8 pl-7 pr-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>
            </div>

            {/* Subreddits List Grouped by Category */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {categories.map((category) => {
                const catCommunities = visibleCommunities.filter(
                  (c) => (c.category || "General") === category
                );
                if (catCommunities.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <div className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {category}
                    </div>

                    <div className="space-y-0.5">
                      {catCommunities.map((comm) => {
                        const isSelected = selectedCommunity === comm.name;
                        const isJoined = Boolean(joinedCommunities[comm.name]);

                        return (
                          <div
                            key={comm.id || comm.name}
                            onClick={() => {
                              setSelectedCommunity(comm.name);
                              setFeedFilter("all");
                              setMobileSidebarOpen(false);
                            }}
                            className={cn(
                              "w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between group transition-all cursor-pointer text-left",
                              isSelected
                                ? "bg-black text-white font-bold shadow-2xs"
                                : "text-zinc-800 hover:bg-zinc-100 hover:text-black"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0",
                                  isSelected
                                    ? "bg-white text-black"
                                    : "bg-zinc-100 border border-zinc-200 text-zinc-800"
                                )}
                              >
                                {comm.name.replace("r/", "").substring(0, 2).toUpperCase()}
                              </span>
                              <div className="truncate">
                                <div className="truncate font-semibold leading-tight">
                                  {comm.name}
                                </div>
                                <div
                                  className={cn(
                                    "text-[10px] truncate",
                                    isSelected ? "text-zinc-300" : "text-zinc-500"
                                  )}
                                >
                                  {(comm.member_count || 100).toLocaleString()} members
                                </div>
                              </div>
                            </div>

                            {/* Direct Join / Leave Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleJoin(comm, e)}
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md transition-all shrink-0 ml-1.5 cursor-pointer",
                                isJoined
                                  ? isSelected
                                    ? "bg-zinc-800 hover:bg-red-900 text-zinc-300 hover:text-white"
                                    : "bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200"
                                  : isSelected
                                    ? "bg-white hover:bg-zinc-200 text-black font-extrabold"
                                    : "bg-black hover:bg-zinc-800 text-white"
                              )}
                              title={isJoined ? "Click to leave" : "Click to join"}
                            >
                              {isJoined ? "Joined ✓" : "+ Join"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Create Community Button */}
            <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setShowCreateCommunity(true)}
                className="w-full h-9 px-3 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Community</span>
              </button>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* COLUMN 2: CENTER FEED                                    */}
          {/* ======================================================== */}
          <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 space-y-4">
            {/* Top Bar for Mobile to open drawer & Subreddit Info */}
            <div className="flex items-center justify-between gap-3 md:hidden bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-black"
              >
                <Menu size={16} />
                <span>Browse Communities</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreatePost(true)}
                className="h-8 px-3 bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Post</span>
              </button>
            </div>

            {/* Community Banner (when inside a subreddit) */}
            {selectedCommunity !== "all" && currentCommunityData && (
              <div className="bg-gradient-to-r from-zinc-900 to-black text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white text-black font-black text-lg flex items-center justify-center shrink-0">
                      {currentCommunityData.name.replace("r/", "").substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-base sm:text-lg font-black tracking-tight">
                          {currentCommunityData.name}
                        </h1>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                          {currentCommunityData.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                        {currentCommunityData.description}
                      </p>
                      <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-2.5 font-medium">
                        <span>{(currentCommunityData.member_count || 100).toLocaleString()} Members</span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Online right now
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Banner Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleJoin(currentCommunityData)}
                      className={cn(
                        "h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        joinedCommunities[currentCommunityData.name]
                          ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                          : "bg-white hover:bg-zinc-100 text-black shadow-xs font-black"
                      )}
                    >
                      {joinedCommunities[currentCommunityData.name] ? "Joined ✓" : "+ Join Community"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPostFormCommunity(currentCommunityData.name);
                        setShowCreatePost(true);
                      }}
                      className="h-9 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-zinc-700"
                    >
                      <Plus size={14} />
                      <span>Create Post</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reddit Top Quick Composer Box */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-3 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>

              <div
                onClick={() => {
                  if (selectedCommunity !== "all") {
                    setPostFormCommunity(selectedCommunity);
                  }
                  setShowCreatePost(true);
                }}
                className="flex-1 h-9 px-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 flex items-center cursor-pointer transition-colors"
              >
                <span>
                  Create a post in {selectedCommunity === "all" ? "any community" : selectedCommunity}...
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCommunity !== "all") setPostFormCommunity(selectedCommunity);
                    setPostTab("image");
                    setShowCreatePost(true);
                  }}
                  className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                  title="Upload Image post"
                >
                  <ImageIcon size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCommunity !== "all") setPostFormCommunity(selectedCommunity);
                    setPostTab("link");
                    setShowCreatePost(true);
                  }}
                  className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                  title="Share link"
                >
                  <Link2 size={17} />
                </button>
              </div>
            </div>

            {/* Reddit Sort & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-2xs">
              {/* Reddit Sort Buttons */}
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSort("hot")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    activeSort === "hot"
                      ? "bg-black text-white shadow-2xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <Flame size={13} className={activeSort === "hot" ? "text-orange-400" : ""} />
                  <span>Hot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSort("new")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    activeSort === "new"
                      ? "bg-black text-white shadow-2xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <Sparkles size={13} className={activeSort === "new" ? "text-amber-400" : ""} />
                  <span>New</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSort("top")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    activeSort === "top"
                      ? "bg-black text-white shadow-2xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <TrendingUp size={13} className={activeSort === "top" ? "text-emerald-400" : ""} />
                  <span>Top</span>
                </button>
              </div>

              {/* Flair Tag Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedFlair("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer",
                    selectedFlair === "all"
                      ? "bg-zinc-800 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                  )}
                >
                  All Flairs
                </button>
                {["Resource", "Question", "Discussion", "Notice", "Carpool", "Meme"].map((flair) => (
                  <button
                    key={flair}
                    type="button"
                    onClick={() => setSelectedFlair(selectedFlair === flair ? "all" : flair)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer border",
                      selectedFlair === flair
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                    )}
                  >
                    {flair}
                  </button>
                ))}
              </div>

              {/* In-feed search */}
              <div className="relative shrink-0 sm:w-48">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Search in feed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>
            </div>

            {/* Reddit Posts Feed */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-zinc-200">
                  <Loader2 size={24} className="animate-spin text-black" />
                  <span className="text-xs font-semibold">Loading Reddit posts...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-8 bg-white border border-zinc-200 rounded-2xl text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black">No posts found</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                      {feedFilter === "joined"
                        ? "You haven't joined any communities with posts yet. Browse the left sidebar to discover campus communities!"
                        : `No posts found in ${selectedCommunity}. Be the first student to start the conversation!`}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-black text-white hover:bg-zinc-800 text-xs font-bold h-9 px-4 rounded-xl cursor-pointer"
                  >
                    + Create the First Post
                  </Button>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isUpvoted = post.userVote === 1;
                  const isDownvoted = post.userVote === -1;
                  const isSaved = Boolean(savedPosts[post.id]);
                  const flairStyle =
                    FLAIR_COLORS[post.flair] || "bg-zinc-100 text-zinc-800 border-zinc-200";

                  return (
                    <article
                      key={post.id}
                      onClick={() => handleOpenComments(post)}
                      className="bg-white border border-zinc-200 hover:border-zinc-400 rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all cursor-pointer flex gap-3 sm:gap-3.5 group"
                    >
                      {/* Reddit Left Vote Pillar */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center justify-start bg-zinc-50/80 rounded-xl p-1 border border-zinc-200/80 shrink-0 w-9 sm:w-10"
                      >
                        <button
                          type="button"
                          aria-label="Upvote"
                          onClick={(e) => handleVote(post.id, 1, e)}
                          className={cn(
                            "p-1 rounded-lg transition-colors cursor-pointer",
                            isUpvoted
                              ? "bg-orange-600 text-white font-bold"
                              : "text-zinc-500 hover:text-orange-600 hover:bg-orange-50"
                          )}
                          title="Upvote"
                        >
                          <ArrowUp size={16} className="stroke-[2.5px]" />
                        </button>

                        <span
                          className={cn(
                            "text-xs font-extrabold my-1 font-mono tracking-tight",
                            isUpvoted
                              ? "text-orange-600"
                              : isDownvoted
                                ? "text-blue-600"
                                : "text-zinc-800"
                          )}
                        >
                          {post.score}
                        </span>

                        <button
                          type="button"
                          aria-label="Downvote"
                          onClick={(e) => handleVote(post.id, -1, e)}
                          className={cn(
                            "p-1 rounded-lg transition-colors cursor-pointer",
                            isDownvoted
                              ? "bg-blue-600 text-white font-bold"
                              : "text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                          )}
                          title="Downvote"
                        >
                          <ArrowDown size={16} className="stroke-[2.5px]" />
                        </button>
                      </div>

                      {/* Post Content Area */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Metadata Header */}
                        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-zinc-500">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCommunity(post.community_name);
                            }}
                            className="font-bold text-black hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{post.community_name}</span>
                          </button>
                          <span>&bull;</span>
                          <span>Posted by</span>
                          <span className="font-semibold text-zinc-800 flex items-center gap-1">
                            {post.author_name}
                            {post.author_verified && (
                              <ShieldCheck size={12} className="text-black" />
                            )}
                          </span>
                          {post.author_student_id && (
                            <span className="font-mono text-zinc-400 text-[10px]">
                              ({post.author_student_id})
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5 text-zinc-400">
                            <Clock size={11} />
                            <span>
                              {new Date(post.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Post Title with Flair */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.flair && (
                              <span
                                className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                  flairStyle
                                )}
                              >
                                {post.flair}
                              </span>
                            )}
                            <h2 className="text-[14.5px] font-extrabold text-black leading-snug group-hover:text-zinc-700 transition-colors">
                              {post.title}
                            </h2>
                          </div>

                          {/* Body Content */}
                          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                            {post.content}
                          </p>

                          {/* Link Preview if exists */}
                          {post.link_url && (
                            <a
                              href={post.link_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium mt-1 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100"
                            >
                              <ExternalLink size={12} />
                              <span className="truncate max-w-sm">{post.link_url}</span>
                            </a>
                          )}

                          {/* Image Preview if exists */}
                          {post.image_url && (
                            <div className="mt-2 rounded-xl overflow-hidden max-h-72 border border-zinc-200 bg-zinc-100">
                              <img
                                src={post.image_url}
                                alt="Post media attachment"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-zinc-500">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenComments(post);
                            }}
                            className="flex items-center gap-1.5 hover:text-black hover:bg-zinc-100 px-2 py-1 -ml-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare size={14} />
                            <span>{post.comments_count || 0} Comments</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSharePost(post.id, e)}
                            className="flex items-center gap-1.5 hover:text-black hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(post.id, e)}
                            className={cn(
                              "flex items-center gap-1.5 hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors cursor-pointer",
                              isSaved ? "text-black font-bold" : "hover:text-black"
                            )}
                          >
                            <Bookmark
                              size={13}
                              className={isSaved ? "fill-black text-black" : ""}
                            />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </main>

          {/* ======================================================== */}
          {/* COLUMN 3: RIGHT SIDEBAR ("ABOUT COMMUNITY" WIDGET)       */}
          {/* ======================================================== */}
          <aside className="w-72 xl:w-80 border-l border-zinc-200 bg-white p-4 space-y-4 overflow-y-auto hidden lg:block shrink-0">
            {selectedCommunity !== "all" && currentCommunityData ? (
              /* Specific Subreddit About Card */
              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-zinc-400">
                    About Community
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                      {currentCommunityData.name.replace("r/", "").substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-black">
                        {currentCommunityData.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-medium">
                        {currentCommunityData.title}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {currentCommunityData.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-200/80 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-zinc-200">
                      <div className="font-black text-sm text-black">
                        {(currentCommunityData.member_count || 100).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                        Members
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-zinc-200">
                      <div className="font-black text-sm text-emerald-600 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                        Campus Active
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleJoin(currentCommunityData)}
                    className={cn(
                      "w-full h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      joinedCommunities[currentCommunityData.name]
                        ? "bg-zinc-200 hover:bg-zinc-300 text-zinc-800"
                        : "bg-black hover:bg-zinc-800 text-white"
                    )}
                  >
                    {joinedCommunities[currentCommunityData.name] ? "Joined ✓" : "+ Join Community"}
                  </button>
                </div>

                {/* Subreddit Rules */}
                {currentCommunityData.rules?.length > 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                    <div className="font-extrabold text-xs text-black flex items-center gap-1.5">
                      <BookOpen size={14} />
                      <span>{currentCommunityData.name} Rules</span>
                    </div>

                    <div className="divide-y divide-zinc-100 text-xs">
                      {currentCommunityData.rules.map((rule, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0">
                          <button
                            type="button"
                            onClick={() => setExpandedRule(expandedRule === idx ? null : idx)}
                            className="w-full text-left font-bold text-zinc-800 flex items-center justify-between gap-2"
                          >
                            <span>
                              {idx + 1}. {rule}
                            </span>
                            {expandedRule === idx ? (
                              <ChevronUp size={13} className="shrink-0" />
                            ) : (
                              <ChevronDown size={13} className="shrink-0 text-zinc-400" />
                            )}
                          </button>
                          {expandedRule === idx && (
                            <p className="text-[11px] text-zinc-500 mt-1 pl-4 leading-relaxed">
                              Posts violating this rule will be flagged and reviewed by student moderators to maintain quality campus discourse.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Moderators Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2 shadow-2xs text-xs">
                  <div className="font-extrabold text-black flex items-center gap-1.5 mb-2">
                    <ShieldCheck size={14} />
                    <span>Community Moderators</span>
                  </div>
                  <div className="space-y-1.5 text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-black">u/hammad_cs</span>
                      <ShieldCheck size={12} className="text-black" />
                      <span className="text-[10px] text-zinc-400 font-mono">(Lead Rep)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-black">u/campus_admin</span>
                      <ShieldCheck size={12} className="text-black" />
                      <span className="text-[10px] text-zinc-400 font-mono">(Staff)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* All Communities Overview Sidebar */
              <div className="space-y-4">
                <div className="bg-zinc-900 text-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs">
                      CS
                    </span>
                    <div>
                      <div className="font-extrabold text-sm">CampuStitch Reddit</div>
                      <div className="text-[10px] text-zinc-400">UET Lahore Student Voice</div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    The verified online quad of UET Lahore. Join department subreddits, share past papers, organize carpools, and participate in campus discussions.
                  </p>
                  <Button
                    onClick={() => setShowCreateCommunity(true)}
                    className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-bold h-9 rounded-xl cursor-pointer"
                  >
                    + Create a Community
                  </Button>
                </div>

                {/* Top Campus Communities Leaderboard */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="font-extrabold text-xs text-black flex items-center gap-1.5">
                    <Trophy size={14} />
                    <span>Top Subreddits</span>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {communities.slice(0, 5).map((c, i) => {
                      const isJoined = Boolean(joinedCommunities[c.name]);
                      return (
                        <div
                          key={c.name}
                          onClick={() => setSelectedCommunity(c.name)}
                          className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 -mx-2 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-zinc-400 font-mono w-4">
                              {i + 1}
                            </span>
                            <div className="truncate">
                              <div className="text-xs font-bold text-black truncate">{c.name}</div>
                              <div className="text-[10px] text-zinc-400">
                                {(c.member_count || 100).toLocaleString()} members
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleToggleJoin(c, e)}
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors shrink-0",
                              isJoined
                                ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                : "bg-black text-white hover:bg-zinc-800"
                            )}
                          >
                            {isJoined ? "Joined" : "+ Join"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Campus Honor Code */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs space-y-2 text-zinc-600">
                  <div className="font-bold text-black flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>Verified Campus Rules</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Respect fellow students and professors.<br />
                    2. No academic dishonesty or live exam dumps.<br />
                    3. Genuine carpools & verified marketplace deals only.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: THREADED COMMENTS & DISCUSSION DRAWER           */}
        {/* ======================================================== */}
        {activePostForComments && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50 flex-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs bg-black text-white px-2.5 py-1 rounded-lg">
                    {activePostForComments.community_name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Discussion &bull; {comments.length} comments
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePostForComments(null)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Full Original Post */}
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-bold text-black">{activePostForComments.author_name}</span>
                    {activePostForComments.author_verified && (
                      <ShieldCheck size={13} className="text-black" />
                    )}
                    <span>({activePostForComments.author_student_id})</span>
                    <span>&bull;</span>
                    <span>
                      {new Date(activePostForComments.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-black">
                    {activePostForComments.title}
                  </h2>
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                    {activePostForComments.content}
                  </p>

                  {activePostForComments.image_url && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200">
                      <img
                        src={activePostForComments.image_url}
                        alt="Attached media"
                        className="w-full object-cover max-h-72"
                      />
                    </div>
                  )}
                </div>

                {/* Comment Composer */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <div className="text-xs font-bold text-black flex items-center justify-between">
                    <span>
                      Comment as{" "}
                      <span className="text-zinc-600 font-medium">
                        {user?.name || "Muhammad Hammad Ismail"} ({user?.studentId || "2023-CS-807"})
                      </span>
                    </span>
                    {replyingToCommentId && (
                      <button
                        type="button"
                        onClick={() => setReplyingToCommentId(null)}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Cancel Reply
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={
                        replyingToCommentId
                          ? "Write your reply to this student..."
                          : "What are your thoughts on this?"
                      }
                      className="w-full p-3 border border-zinc-300 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black leading-relaxed"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="absolute right-3 bottom-3 px-3 py-1.5 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Comment</span>
                      <Send size={12} />
                    </button>
                  </div>
                </form>

                {/* Threaded Comments List */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Comments ({comments.length})
                  </div>

                  {isLoadingComments ? (
                    <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-black" />
                      <span>Loading discussion thread...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl">
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    comments.map((comm) => (
                      <div
                        key={comm.id}
                        className={cn(
                          "p-3 rounded-2xl border text-xs space-y-1.5 transition-colors",
                          comm.parent_comment_id
                            ? "ml-6 bg-zinc-50/70 border-l-4 border-l-black border-zinc-200"
                            : "bg-white border-zinc-200"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1.5 font-bold text-black">
                            <span>{comm.author_name}</span>
                            {comm.author_verified && (
                              <ShieldCheck size={12} className="text-black" />
                            )}
                            <span className="font-mono text-zinc-400 font-normal">
                              ({comm.author_student_id})
                            </span>
                          </div>
                          <span>
                            {new Date(comm.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-800 leading-relaxed">{comm.content}</p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-zinc-500">
                          <span className="font-mono">{comm.score || 1} upvotes</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToCommentId(comm.id);
                              setNewCommentText(`@${comm.author_name} `);
                            }}
                            className="hover:text-black cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: CREATE POST MODAL (REDDIT STYLE)                */}
        {/* ======================================================== */}
        {showCreatePost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="font-extrabold text-base text-black flex items-center gap-2">
                  <MessageSquare size={18} />
                  <span>Create a Post</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Subreddit Selector */}
              <div>
                <label className="text-xs font-bold text-black block mb-1">
                  Choose Community
                </label>
                <select
                  value={postFormCommunity}
                  onChange={(e) => setPostFormCommunity(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black"
                >
                  {communities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} &mdash; {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Type Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPostTab("text")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    postTab === "text"
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <MessageSquare size={13} />
                  <span>Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostTab("image")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    postTab === "image"
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <ImageIcon size={13} />
                  <span>Images</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostTab("link")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    postTab === "link"
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-600 hover:text-black"
                  )}
                >
                  <Link2 size={13} />
                  <span>Link</span>
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3.5">
                {/* Flair Picker */}
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Select Flair
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["Discussion", "Question", "Resource", "Notice", "Carpool", "Meme", "Event"].map(
                      (flair) => (
                        <button
                          key={flair}
                          type="button"
                          onClick={() => setPostFormFlair(flair)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                            postFormFlair === flair
                              ? "bg-black text-white border-black"
                              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                          )}
                        >
                          {flair}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-black">Title</label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {postFormTitle.length}/300
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    placeholder="An interesting, descriptive title..."
                    value={postFormTitle}
                    onChange={(e) => setPostFormTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs font-semibold text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Tab Specific Content */}
                {postTab === "image" && (
                  <div>
                    <label className="text-xs font-bold text-black block mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={postFormImageUrl}
                      onChange={(e) => setPostFormImageUrl(e.target.value)}
                      className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                {postTab === "link" && (
                  <div>
                    <label className="text-xs font-bold text-black block mb-1">
                      Web / Drive Link URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or https://..."
                      value={postFormLinkUrl}
                      onChange={(e) => setPostFormLinkUrl(e.target.value)}
                      className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                {/* Content / Text */}
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Content (Text / Markdown)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts, lab tips, event details, or questions..."
                    value={postFormContent}
                    onChange={(e) => setPostFormContent(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingPost || !postFormTitle.trim()}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
                  >
                    {isSubmittingPost ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Posting...
                      </>
                    ) : (
                      "Post to Reddit"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: CREATE NEW REDDIT SUB-COMMUNITY                 */}
        {/* ======================================================== */}
        {showCreateCommunity && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="font-extrabold text-base text-black flex items-center gap-2">
                  <Users size={16} />
                  <span>Create Sub-Community</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCommunity(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Community Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                      r/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. uet-ai or mech-lab"
                      value={commFormName}
                      onChange={(e) =>
                        setCommFormName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      className="w-full h-10 pl-7 pr-3 border border-zinc-300 rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Display Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UET Artificial Intelligence & Robotics"
                    value={commFormTitle}
                    onChange={(e) => setCommFormTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Category
                  </label>
                  <select
                    value={commFormCategory}
                    onChange={(e) => setCommFormCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black bg-white focus:outline-none focus:border-black"
                  >
                    <option value="Academic">Academic / Department</option>
                    <option value="Campus Life">Campus Life & Hostels</option>
                    <option value="Careers">Careers & Internships</option>
                    <option value="Societies">Societies & Chapters</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Description & Topic
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What is this community about? Who is it for?"
                    value={commFormDesc}
                    onChange={(e) => setCommFormDesc(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCommunity(false)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingComm || !commFormName.trim() || !commFormTitle.trim()}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
                  >
                    {isSubmittingComm ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Creating...
                      </>
                    ) : (
                      "Create Community"
                    )}
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
