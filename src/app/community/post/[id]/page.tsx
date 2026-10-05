"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  ShieldCheck,
  Send,
  Loader2,
  Clock,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Globe,
  Users,
  Search,
  Check,
  Menu,
  X,
  MoreHorizontal,
  Repeat,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { BottomNav } from "@/components/bottom-nav";
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
}

const FLAIR_COLORS: Record<string, string> = {
  Resource: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Question: "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Discussion: "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Notice: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Carpool: "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  Meme: "bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  Event: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
};

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 mo ago";
    return `${diffMonths} mos ago`;
  } catch {
    return "recently";
  }
}

export default function DynamicPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = React.useState<Post | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = React.useState<Record<string, boolean>>({
    "r/cs-uet": true,
    "r/commute-splits": true,
    "r/exam-pastpapers": true,
  });
  const [isSaved, setIsSaved] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState<string | null>(null);
  const [activeMenuOpen, setActiveMenuOpen] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [replyingToCommentId, setReplyingToCommentId] = React.useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Sidebar search & rules accordion
  const [communitySearch, setCommunitySearch] = React.useState("");
  const [expandedRule, setExpandedRule] = React.useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Load joined communities
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("campus_stitch_joined_communities");
      if (stored) {
        setJoinedCommunities(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch communities list for left sidebar
  React.useEffect(() => {
    fetch("/api/community/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.communities) {
          setCommunities(data.communities);
        }
      })
      .catch(console.warn);
  }, []);

  // Fetch post and comments
  React.useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/community/posts?id=${postId}`).then((r) => r.json()),
      fetch(`/api/community/comments?postId=${postId}`).then((r) => r.json()),
    ])
      .then(([postData, commentsData]) => {
        if (postData.success && postData.post) {
          setPost(postData.post);
        }
        if (commentsData.success && commentsData.comments) {
          setComments(commentsData.comments);
        }
      })
      .catch((err) => console.warn("Failed to load post data:", err))
      .finally(() => setIsLoading(false));
  }, [postId]);

  // Voting on post with separate counters
  const handleVote = (direction: 1 | -1) => {
    if (!post) return;

    const currentVote = post.userVote || 0;
    let newVote: number = 0;
    let newUpvotes = post.upvotes ?? 0;
    let newDownvotes = post.downvotes ?? 0;

    if (direction === 1) {
      if (currentVote === 1) {
        newVote = 0;
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else if (currentVote === -1) {
        newVote = 1;
        newUpvotes += 1;
        newDownvotes = Math.max(0, newDownvotes - 1);
      } else {
        newVote = 1;
        newUpvotes += 1;
      }
    } else {
      if (currentVote === -1) {
        newVote = 0;
        newDownvotes = Math.max(0, newDownvotes - 1);
      } else if (currentVote === 1) {
        newVote = -1;
        newDownvotes += 1;
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else {
        newVote = -1;
        newDownvotes += 1;
      }
    }

    setPost({
      ...post,
      userVote: newVote,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newUpvotes - newDownvotes,
    });

    fetch("/api/community/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: post.id,
        voteType: direction === 1 ? "upvote" : "downvote",
        userId: user?.userId || "u_student",
      }),
    }).catch(console.warn);
  };

  // Toggle Join on community
  const handleToggleJoin = async (commName: string) => {
    const isCurrentlyJoined = joinedCommunities[commName];
    const newStatus = !isCurrentlyJoined;

    const nextState = {
      ...joinedCommunities,
      [commName]: newStatus,
    };
    setJoinedCommunities(nextState);

    try {
      localStorage.setItem("campus_stitch_joined_communities", JSON.stringify(nextState));
    } catch {}

    const comm = communities.find((c) => c.name === commName);
    if (comm) {
      fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: comm.id,
          userId: user?.userId || "u_student",
        }),
      }).catch(console.warn);
    }
  };

  // Submit comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !post) return;

    setIsSubmittingComment(true);
    const parentId = replyingToCommentId;
    const authorName = user?.name || "Student";
    const authorStudentId = user?.studentId || "";

    const optimistic: Comment = {
      id: "cm_" + Date.now(),
      post_id: post.id,
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

    setComments((prev) => [...prev, optimistic]);
    setNewCommentText("");
    setReplyingToCommentId(null);
    setPost((prev) => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);

    try {
      await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          parentCommentId: parentId,
          content: optimistic.content,
          authorName,
          authorStudentId,
        }),
      });
    } catch (err) {
      console.warn("Comment submit notice:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopyFeedback("Post link copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const currentCommunity = communities.find((c) => c.name === post?.community_name);

  const visibleCommunities = communities.filter((c) => {
    if (!communitySearch.trim()) return true;
    const q = communitySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
  });

  const categories = Array.from(new Set(communities.map((c) => c.category || "General")));

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F8F9FA] text-zinc-900 select-none overflow-hidden">
        {/* Toast copy notification */}
        {copyFeedback && (
          <div className="fixed top-20 right-6 z-50 bg-black text-white text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={14} className="text-emerald-400" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* REDDIT 3-COLUMN LAYOUT                                   */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 flex overflow-hidden h-full">
          {/* ======================================================== */}
          {/* COLUMN 1: LEFT SUBREDDIT DIRECTORY                       */}
          {/* ======================================================== */}
          <aside
            className={cn(
              "w-64 lg:w-72 border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-transform z-30 h-full",
              mobileSidebarOpen
                ? "fixed inset-y-0 left-0 shadow-2xl z-50 w-72 flex"
                : "hidden md:flex"
            )}
          >
            {/* Top header */}
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between">
              <Link href="/community" className="flex items-center gap-2 font-extrabold text-sm text-black">
                <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-black">
                  r/
                </span>
                <span>Communities</span>
              </Link>
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

              <Link
                href="/community"
                className="w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors text-zinc-700 hover:bg-zinc-100 hover:text-black"
              >
                <span className="flex items-center gap-2.5">
                  <Globe size={15} />
                  <span>All Campus Feeds</span>
                </span>
                <span className="text-[10px] opacity-70 font-mono">r/all</span>
              </Link>
            </div>

            {/* Search filter */}
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

            {/* Communities list */}
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
                        const isCurrent = post?.community_name === comm.name;
                        const isJoined = Boolean(joinedCommunities[comm.name]);

                        return (
                          <div
                            key={comm.name}
                            onClick={() => router.push(`/community?community=${encodeURIComponent(comm.name)}`)}
                            className={cn(
                              "w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between group transition-all cursor-pointer text-left",
                              isCurrent
                                ? "bg-black text-white font-bold shadow-2xs"
                                : "text-zinc-800 hover:bg-zinc-100 hover:text-black"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0",
                                  isCurrent
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
                                    isCurrent ? "text-zinc-300" : "text-zinc-500"
                                  )}
                                >
                                  {(comm.member_count || 100).toLocaleString()} members
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleJoin(comm.name);
                              }}
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md transition-all shrink-0 ml-1.5 cursor-pointer",
                                isJoined
                                  ? isCurrent
                                    ? "bg-zinc-800 text-zinc-300"
                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                  : isCurrent
                                    ? "bg-white text-black font-extrabold"
                                    : "bg-black text-white"
                              )}
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
          </aside>

          {/* ======================================================== */}
          {/* COLUMN 2: CENTER POST DETAIL & THREADED COMMENTS        */}
          {/* ======================================================== */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto p-3 sm:p-5 space-y-4 pb-20 md:pb-5">
            {/* Mobile Header Button */}
            <div className="flex items-center justify-between md:hidden bg-white p-2.5 rounded-2xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-black"
              >
                <Menu size={16} />
                <span>Communities</span>
              </button>
              <Link
                href="/community"
                className="text-xs font-semibold text-zinc-600 hover:text-black flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Back to feed</span>
              </Link>
            </div>

            {/* Back to feed button (Desktop) */}
            <div className="hidden md:flex items-center justify-between">
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-black bg-white px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors shadow-2xs"
              >
                <ArrowLeft size={14} />
                <span>Back to {post?.community_name || "Feed"}</span>
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-zinc-200">
                <Loader2 size={24} className="animate-spin text-black" />
                <span className="text-xs font-semibold">Loading Reddit post...</span>
              </div>
            ) : !post ? (
              <div className="p-8 bg-white border border-zinc-200 rounded-2xl text-center space-y-3">
                <h3 className="text-sm font-bold text-black">Post not found</h3>
                <p className="text-xs text-zinc-500">
                  This post may have been removed or does not exist.
                </p>
                <Button
                  onClick={() => router.push("/community")}
                  className="bg-black text-white text-xs font-bold h-9 px-4 rounded-xl"
                >
                  Return to Communities
                </Button>
              </div>
            ) : (
              <>
                {/* Full Reddit Post Card matching Screenshot */}
                <article className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#242429] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs flex flex-col space-y-3">
                  {/* Top Header Row: Badge + r/community • 1 day ago + ••• */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center shrink-0 tracking-tighter uppercase shadow-2xs">
                        {post.community_name.replace("r/", "").substring(0, 3).toUpperCase()}
                      </div>

                      <Link
                        href={`/community?community=${encodeURIComponent(post.community_name)}`}
                        className="font-bold text-zinc-950 dark:text-zinc-100 hover:underline truncate text-xs sm:text-[13px]"
                      >
                        {post.community_name.startsWith("r/") ? post.community_name : `r/${post.community_name}`}
                      </Link>

                      <span className="text-zinc-400 dark:text-zinc-500 font-medium">•</span>

                      <span className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-[11px] sm:text-xs">
                        {formatTimeAgo(post.created_at)}
                      </span>

                      {post.flair && (
                        <span
                          className={cn(
                            "hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1",
                            FLAIR_COLORS[post.flair] || "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                          )}
                        >
                          {post.flair}
                        </span>
                      )}
                    </div>

                    {/* Three dots menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveMenuOpen(!activeMenuOpen)}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs text-zinc-700 dark:text-zinc-200 animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              handleShare();
                              setActiveMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            <Share2 size={13} />
                            <span>Copy Link</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSaved(!isSaved);
                              setActiveMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            <Bookmark size={13} />
                            <span>{isSaved ? "Saved" : "Save Post"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-lg sm:text-[21px] font-bold text-zinc-950 dark:text-white tracking-tight leading-snug">
                    {post.title}
                  </h1>

                  {/* Body Content */}
                  <p className="text-xs sm:text-[14px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* External Link */}
                  {post.link_url && (
                    <a
                      href={post.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mt-2 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40 w-fit"
                    >
                      <ExternalLink size={13} />
                      <span className="truncate max-w-md">{post.link_url}</span>
                    </a>
                  )}

                  {/* Image Attachment */}
                  {post.image_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={post.image_url}
                        alt="Post attachment"
                        className="w-full object-cover max-h-96"
                      />
                    </div>
                  )}

                  {/* Bottom Action Pills Bar (Exact Reddit Layout) */}
                  <div className="flex items-center flex-wrap gap-2 pt-2 select-none">
                    {/* 1. Vote Pill: Keep count of upvotes separate and vote down separate */}
                    <div className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 p-0.5 text-xs font-bold transition-colors">
                      {/* Upvote side with separate count */}
                      <button
                        type="button"
                        aria-label="Upvote"
                        onClick={() => handleVote(1)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                          post.userVote === 1
                            ? "text-orange-600 dark:text-orange-500 bg-orange-100/90 dark:bg-orange-950/70"
                            : "text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                        )}
                      >
                        <ArrowUp size={14} className="stroke-[2.5px]" />
                        <span className="tabular-nums font-mono text-xs">{post.upvotes ?? 0}</span>
                      </button>

                      <div className="w-[1px] h-3.5 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

                      {/* Downvote side with separate count */}
                      <button
                        type="button"
                        aria-label="Downvote"
                        onClick={() => handleVote(-1)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                          post.userVote === -1
                            ? "text-blue-600 dark:text-blue-400 bg-blue-100/90 dark:bg-blue-950/70"
                            : "text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                        )}
                      >
                        <ArrowDown size={14} className="stroke-[2.5px]" />
                        <span className="tabular-nums font-mono text-xs">{post.downvotes ?? 0}</span>
                      </button>
                    </div>

                    {/* 2. Comments Pill: [ 💬 {comments.length} ] */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 px-3.5 py-1.5 text-xs font-semibold">
                      <MessageSquare size={14} className="stroke-[2.2px]" />
                      <span>{comments.length}</span>
                    </div>

                    {/* 3. Cycle / Repost Pill: [ 🔁 ] */}
                    <button
                      type="button"
                      onClick={handleShare}
                      title="Repost / Share to network"
                      className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Repeat size={14} className="stroke-[2.2px]" />
                    </button>

                    {/* 4. Share Pill: [ ↗️ {count} ] */}
                    <button
                      type="button"
                      onClick={handleShare}
                      title="Share link"
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Share2 size={13} className="stroke-[2.2px]" />
                      <span>{((post.upvotes || 7) % 35) + 14}</span>
                    </button>
                  </div>
                </article>

                {/* Comment Composer */}
                <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-black dark:text-white">
                      Comment as{" "}
                      <span className="font-normal text-zinc-600 dark:text-zinc-400">
                        {user?.name || "Student"} {user?.studentId ? `(${user.studentId})` : ""}
                      </span>
                    </span>
                    {replyingToCommentId && (
                      <button
                        type="button"
                        onClick={() => setNewCommentText("")}
                        className="text-red-600 font-semibold hover:underline cursor-pointer"
                      >
                        Cancel Reply
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="space-y-2">
                    <textarea
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={
                        replyingToCommentId
                          ? "Write your reply to this student..."
                          : "What are your thoughts?"
                      }
                      className="w-full p-3.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-black dark:focus:border-white leading-relaxed"
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold h-9 px-5 rounded-xl cursor-pointer"
                      >
                        {isSubmittingComment ? (
                          <>
                            <Loader2 size={13} className="animate-spin mr-1.5" />
                            Commenting...
                          </>
                        ) : (
                          "Comment"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Threaded Discussion List */}
                <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
                  <div className="font-black text-sm text-black dark:text-white flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span>Discussion ({comments.length})</span>
                    <span className="text-xs text-zinc-400 font-medium">Sorted by: Best</span>
                  </div>

                  {comments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No comments yet. Be the first student to comment!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comm) => (
                        <div
                          key={comm.id}
                          className={cn(
                            "p-3.5 rounded-2xl border text-xs space-y-2 transition-colors",
                            comm.parent_comment_id
                              ? "ml-6 sm:ml-8 bg-zinc-50/70 dark:bg-zinc-900/60 border-l-4 border-l-black dark:border-l-white border-zinc-200 dark:border-zinc-800"
                              : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-2xs"
                          )}
                        >
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                              <span>{comm.author_name}</span>
                              {comm.author_verified && (
                                <ShieldCheck size={13} className="text-black dark:text-white" />
                              )}
                              <span className="font-mono text-zinc-400 font-normal">
                                ({comm.author_student_id})
                              </span>
                            </div>
                            <span className="text-zinc-400">
                              {new Date(comm.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
                            {comm.content}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-zinc-500">
                            <span className="font-mono text-black font-bold">
                              {comm.score || 1} upvotes
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToCommentId(comm.id);
                                setNewCommentText(`@${comm.author_name} `);
                              }}
                              className="hover:text-black font-bold cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          {/* ======================================================== */}
          {/* COLUMN 3: RIGHT ABOUT COMMUNITY SIDEBAR                  */}
          {/* ======================================================== */}
          <aside className="w-72 xl:w-80 border-l border-zinc-200 bg-white p-4 space-y-4 overflow-y-auto hidden lg:block shrink-0 h-full">
            {currentCommunity ? (
              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-zinc-400">
                    About Community
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                      {currentCommunity.name.replace("r/", "").substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-black">
                        {currentCommunity.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-medium">
                        {currentCommunity.title}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {currentCommunity.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-200/80 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-zinc-200">
                      <div className="font-black text-sm text-black">
                        {(currentCommunity.member_count || 100).toLocaleString()}
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
                    onClick={() => handleToggleJoin(currentCommunity.name)}
                    className={cn(
                      "w-full h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      joinedCommunities[currentCommunity.name]
                        ? "bg-zinc-200 hover:bg-zinc-300 text-zinc-800"
                        : "bg-black hover:bg-zinc-800 text-white"
                    )}
                  >
                    {joinedCommunities[currentCommunity.name] ? "Joined ✓" : "+ Join Community"}
                  </button>
                </div>

                {/* Subreddit Rules */}
                {currentCommunity.rules?.length > 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                    <div className="font-extrabold text-xs text-black flex items-center gap-1.5">
                      <BookOpen size={14} />
                      <span>{currentCommunity.name} Rules</span>
                    </div>

                    <div className="divide-y divide-zinc-100 text-xs">
                      {currentCommunity.rules.map((rule, idx) => (
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
                              Posts violating this rule will be flagged and reviewed by student moderators.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Moderators */}
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
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="font-bold text-xs text-black">CampuStitch Reddit</div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Join student discussions, share lab tips, organize ride splits, and keep up with campus news.
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Navigation for Mobile Devices */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
