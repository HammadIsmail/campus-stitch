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
  CornerDownRight,
  Send,
  Loader2,
  X,
  AlertCircle,
  Tag,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

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
}

export default function RedditCommunitiesPage() {
  const { user } = useAuth();

  // Navigation & Filtering
  const [selectedCommunity, setSelectedCommunity] = React.useState<string>("all");
  const [activeSort, setActiveSort] = React.useState<"hot" | "new" | "top">("hot");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Data states
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [joinedCommunities, setJoinedCommunities] = React.useState<Record<string, boolean>>({
    "r/cs-uet": true,
    "r/commute-splits": true,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Modals & Panels
  const [showCreatePost, setShowCreatePost] = React.useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = React.useState(false);
  const [activePostForComments, setActivePostForComments] = React.useState<Post | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [replyingToCommentId, setReplyingToCommentId] = React.useState<string | null>(null);

  // Create Post Form State
  const [postFormCommunity, setPostFormCommunity] = React.useState("r/cs-uet");
  const [postFormTitle, setPostFormTitle] = React.useState("");
  const [postFormContent, setPostFormContent] = React.useState("");
  const [postFormFlair, setPostFormFlair] = React.useState("Discussion");
  const [isSubmittingPost, setIsSubmittingPost] = React.useState(false);

  // Create Community Form State
  const [commFormName, setCommFormName] = React.useState("");
  const [commFormTitle, setCommFormTitle] = React.useState("");
  const [commFormDesc, setCommFormDesc] = React.useState("");
  const [commFormCategory, setCommFormCategory] = React.useState("Academic");
  const [isSubmittingComm, setIsSubmittingComm] = React.useState(false);

  // Rules Accordion
  const [showRules, setShowRules] = React.useState(false);

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

  // Handle Post Upvote/Downvote
  const handleVote = async (postId: string, voteType: 1 | -1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        const currentVote = p.userVote || 0;
        let newVote: 1 | -1 | 0 = voteType;
        let delta: number = voteType;

        if (currentVote === voteType) {
          // Toggle off
          newVote = 0;
          delta = -voteType;
        } else if (currentVote !== 0) {
          // Switch vote
          delta = voteType * 2;
        }

        return {
          ...p,
          score: p.score + delta,
          userVote: newVote,
        };
      })
    );

    try {
      await fetch("/api/community/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          voteType,
          userId: user?.userId || "u_2023_cs_807",
        }),
      });
    } catch (err) {
      console.warn("Vote sync notice:", err);
    }
  };

  // Handle Join / Leave Community
  const handleToggleJoin = async (comm: Community) => {
    const isCurrentlyJoined = joinedCommunities[comm.name];
    const newStatus = !isCurrentlyJoined;

    setJoinedCommunities((prev) => ({
      ...prev,
      [comm.name]: newStatus,
    }));

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
          userId: user?.userId || "u_2023_cs_807",
        }),
      });
    } catch (err) {
      console.warn("Join sync error:", err);
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
      author_id: user?.userId || "u_2023_cs_807",
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
    if (!postFormTitle.trim() || !postFormContent.trim()) return;

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
          authorName: user?.name || "Muhammad Hammad Ismail",
          authorStudentId: user?.studentId || "2023-CS-807",
          authorId: user?.userId || "u_2023_cs_807",
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setShowCreatePost(false);
        setPostFormTitle("");
        setPostFormContent("");
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit Create Community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commFormName.trim() || !commFormTitle.trim()) return;

    setIsSubmittingComm(true);
    try {
      const res = await fetch("/api/community/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: commFormName.trim(),
          title: commFormTitle.trim(),
          description: commFormDesc.trim(),
          category: commFormCategory,
        }),
      });

      const data = await res.json();
      if (data.success && data.community) {
        setCommunities((prev) => [data.community, ...prev]);
        setSelectedCommunity(data.community.name);
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

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Top Reddit-style Community Bar */}
        <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs">
              r/
            </span>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-black flex items-center gap-1.5">
                <span>
                  {selectedCommunity === "all" ? "Campus Feeds" : selectedCommunity}
                </span>
                {selectedCommunity !== "all" && (
                  <ShieldCheck size={14} className="text-black" />
                )}
              </h1>
              <div className="text-[11px] text-zinc-500 font-medium">
                {selectedCommunity === "all"
                  ? "UET Lahore Reddit Communities & Discussions"
                  : currentCommunityData?.title || "Verified Student Community"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="h-9 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create Post</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreateCommunity(true)}
              className="h-9 px-2.5 border border-zinc-300 hover:border-black text-black bg-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Users size={14} />
              <span className="hidden sm:inline">New Group</span>
            </button>
          </div>
        </header>

        {/* Subreddit Horizontal Filter Bar */}
        <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCommunity("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCommunity === "all"
                ? "bg-black text-white"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
            }`}
          >
            All Communities
          </button>
          {communities.map((c) => {
            const isSelected = selectedCommunity === c.name;
            return (
              <button
                key={c.id || c.name}
                type="button"
                onClick={() => setSelectedCommunity(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-zinc-700 text-white" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {c.member_count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Community Info Banner & Join Button */}
        {selectedCommunity !== "all" && currentCommunityData && (
          <div className="bg-zinc-900 text-white p-4 mx-4 mt-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight">
                    {currentCommunityData.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {currentCommunityData.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {currentCommunityData.description}
                </p>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                  <span>{currentCommunityData.member_count} Members</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online now
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleJoin(currentCommunityData)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  joinedCommunities[currentCommunityData.name]
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    : "bg-white hover:bg-zinc-100 text-black shadow-xs"
                }`}
              >
                {joinedCommunities[currentCommunityData.name] ? "Joined ✓" : "+ Join"}
              </button>
            </div>

            {/* Rules Accordion */}
            {currentCommunityData.rules?.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRules(!showRules)}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Community Rules ({currentCommunityData.rules.length})</span>
                  {showRules ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {showRules && (
                  <ul className="mt-2 space-y-1 text-[11px] text-zinc-300 pl-4 list-decimal">
                    {currentCommunityData.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sort & Search Bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Reddit Sort Buttons */}
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSort("hot")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSort === "hot"
                  ? "bg-black text-white shadow-2xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Flame size={13} />
              <span>Hot</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSort("new")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSort === "new"
                  ? "bg-black text-white shadow-2xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Sparkles size={13} />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSort("top")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSort === "top"
                  ? "bg-black text-white shadow-2xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <TrendingUp size={13} />
              <span>Top</span>
            </button>
          </div>

          {/* Search Posts */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-zinc-200 rounded-xl placeholder:text-zinc-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Reddit Posts Feed */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 pb-12 space-y-3">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-black" />
              <span className="text-xs font-semibold">Loading community posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 bg-white border border-zinc-200 rounded-2xl text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">No posts yet</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Be the first to share an announcement, ask for advice, or start a discussion in {selectedCommunity}.
                </p>
              </div>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-black text-white hover:bg-zinc-800 text-xs font-bold h-9 px-4 rounded-xl"
              >
                + Create the First Post
              </Button>
            </div>
          ) : (
            posts.map((post) => {
              const isUpvoted = post.userVote === 1;
              const isDownvoted = post.userVote === -1;

              return (
                <div
                  key={post.id}
                  onClick={() => handleOpenComments(post)}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 rounded-2xl p-4 shadow-2xs transition-all cursor-pointer flex gap-3.5"
                >
                  {/* Reddit Left Vote Pillar */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center justify-start bg-zinc-50 rounded-xl p-1.5 border border-zinc-200/80 shrink-0 w-10"
                  >
                    <button
                      type="button"
                      aria-label="Upvote"
                      onClick={(e) => handleVote(post.id, 1, e)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isUpvoted
                          ? "bg-black text-white font-bold"
                          : "text-zinc-500 hover:text-black hover:bg-zinc-200"
                      }`}
                    >
                      <ArrowUp size={15} className="stroke-[2.5px]" />
                    </button>

                    <span
                      className={`text-xs font-extrabold my-1 font-mono ${
                        isUpvoted
                          ? "text-black"
                          : isDownvoted
                          ? "text-zinc-600"
                          : "text-zinc-800"
                      }`}
                    >
                      {post.score}
                    </span>

                    <button
                      type="button"
                      aria-label="Downvote"
                      onClick={(e) => handleVote(post.id, -1, e)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isDownvoted
                          ? "bg-zinc-700 text-white font-bold"
                          : "text-zinc-500 hover:text-black hover:bg-zinc-200"
                      }`}
                    >
                      <ArrowDown size={15} className="stroke-[2.5px]" />
                    </button>
                  </div>

                  {/* Post Content Area */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Metadata Header */}
                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-zinc-500">
                      <span className="font-bold text-black hover:underline">
                        {post.community_name}
                      </span>
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
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Post Title with Flair */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.flair && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-black">
                            {post.flair}
                          </span>
                        )}
                        <h2 className="text-[14.5px] font-extrabold text-black leading-snug">
                          {post.title}
                        </h2>
                      </div>

                      {/* Body Content */}
                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-zinc-500">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenComments(post);
                        }}
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <MessageSquare size={14} />
                        <span>{post.comments_count || 0} Comments</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard?.writeText(window.location.href);
                          alert("Link copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Share2 size={13} />
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Saved post to your profile library!");
                        }}
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Bookmark size={13} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* ======================================================== */}
        {/* MODAL 1: THREADED COMMENTS & NESTED REPLIES              */}
        {/* ======================================================== */}
        {activePostForComments && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-black">
                    {activePostForComments.community_name}
                  </span>
                  <span className="text-zinc-400 text-xs">&bull;</span>
                  <span className="text-xs text-zinc-500 font-medium">
                    Discussion Thread
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePostForComments(null)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Thread Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                {/* Original Post Card */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
                    <span>Posted by {activePostForComments.author_name}</span>
                    <span className="font-mono">({activePostForComments.author_student_id})</span>
                  </div>
                  <h3 className="text-sm font-bold text-black">
                    {activePostForComments.title}
                  </h3>
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {activePostForComments.content}
                  </p>
                </div>

                {/* Comments Header */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 px-1">
                  <span>Comments ({comments.length})</span>
                  <span className="text-zinc-400 font-normal">Threaded Replies</span>
                </div>

                {/* Comments Tree */}
                {isLoadingComments ? (
                  <div className="py-8 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-black" />
                    <span className="text-xs">Loading replies...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    No comments yet. Start the conversation below!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Render Top-level comments and nested replies */}
                    {comments
                      .filter((c) => !c.parent_comment_id)
                      .map((topComment) => {
                        const replies = comments.filter(
                          (c) => c.parent_comment_id === topComment.id
                        );

                        return (
                          <div key={topComment.id} className="space-y-2.5">
                            {/* Top-Level Comment */}
                            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                <span className="font-bold text-black flex items-center gap-1">
                                  {topComment.author_name}
                                  <ShieldCheck size={11} className="text-black" />
                                </span>
                                <span className="font-mono text-[10px]">
                                  {topComment.author_student_id}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-800 leading-relaxed">
                                {topComment.content}
                              </p>
                              <div className="pt-1 flex items-center gap-3 text-[11px] font-semibold text-zinc-500">
                                <span>▲ {topComment.score}</span>
                                <button
                                  type="button"
                                  onClick={() => setReplyingToCommentId(topComment.id)}
                                  className="text-black hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <CornerDownRight size={11} />
                                  <span>Reply</span>
                                </button>
                              </div>
                            </div>

                            {/* Nested Replies (Reddit-style Indentation) */}
                            {replies.length > 0 && (
                              <div className="pl-5 ml-2 border-l-2 border-zinc-200 space-y-2">
                                {replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1"
                                  >
                                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                      <span className="font-bold text-black flex items-center gap-1">
                                        {reply.author_name}
                                        <ShieldCheck size={11} className="text-black" />
                                      </span>
                                      <span className="font-mono text-[10px]">
                                        {reply.author_student_id}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-800 leading-relaxed">
                                      {reply.content}
                                    </p>
                                    <div className="text-[10px] font-semibold text-zinc-500">
                                      ▲ {reply.score}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Bottom Comment Input */}
              <div className="p-3 border-t border-zinc-200 bg-white space-y-2">
                {replyingToCommentId && (
                  <div className="flex items-center justify-between text-[11px] bg-zinc-100 px-3 py-1 rounded-md text-zinc-600">
                    <span>Replying to comment...</span>
                    <button
                      type="button"
                      onClick={() => setReplyingToCommentId(null)}
                      className="text-black font-bold hover:underline"
                    >
                      Cancel reply
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={
                      replyingToCommentId
                        ? "Write a nested reply..."
                        : "Add a comment to the thread..."
                    }
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 h-10 px-3.5 text-xs border border-zinc-300 rounded-xl placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                  <Button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="h-10 px-4 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <Send size={14} className="mr-1" />
                    <span>Send</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: CREATE NEW REDDIT POST                          */}
        {/* ======================================================== */}
        {showCreatePost && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-base text-black flex items-center gap-1.5">
                  <Plus size={16} />
                  <span>Create Community Post</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Select Subreddit / Community
                  </label>
                  <select
                    value={postFormCommunity}
                    onChange={(e) => setPostFormCommunity(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black bg-white focus:outline-none focus:border-black"
                  >
                    {communities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Post Flair
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Discussion", "Question", "Notice", "Resource", "Carpool", "Hostel"].map(
                      (f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setPostFormFlair(f)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            postFormFlair === f
                              ? "bg-black text-white"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          {f}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="An interesting title..."
                    value={postFormTitle}
                    onChange={(e) => setPostFormTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Post Content (Text / Discussion)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your thoughts, lab tips, event details, or questions..."
                    value={postFormContent}
                    onChange={(e) => setPostFormContent(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                    className="text-xs h-10 px-4 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingPost || !postFormTitle.trim() || !postFormContent.trim()}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-10 px-5 rounded-xl cursor-pointer"
                  >
                    {isSubmittingPost ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Posting...
                      </>
                    ) : (
                      "Publish Post"
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-base text-black flex items-center gap-1.5">
                  <Users size={16} />
                  <span>Create Sub-Community</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCommunity(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Community Handle (Prefix: r/)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                      r/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. uet-gamers or civil-engineering"
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
                    Community Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UET Lahore Gaming & Esports Club"
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
                    <option value="Hostel">Hostel & Living</option>
                    <option value="Commute">Commute & Travel</option>
                    <option value="Gaming">Gaming & Sports</option>
                    <option value="General">General / Campus Life</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black block mb-1">
                    Description & Topic
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What is this community about? Who should join?"
                    value={commFormDesc}
                    onChange={(e) => setCommFormDesc(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCommunity(false)}
                    className="text-xs h-10 px-4 rounded-xl"
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
