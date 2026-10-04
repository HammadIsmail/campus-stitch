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

  // Voting on post
  const handleVote = (direction: 1 | -1) => {
    if (!post) return;

    const currentVote = post.userVote || 0;
    let newVote: number = direction;
    let delta = 0;

    if (currentVote === direction) {
      newVote = 0;
      delta = -direction;
    } else if (currentVote === 0) {
      newVote = direction;
      delta = direction;
    } else {
      newVote = direction;
      delta = direction * 2;
    }

    setPost({
      ...post,
      userVote: newVote,
      score: post.score + delta,
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
    const authorName = user?.name || "Muhammad Hammad Ismail";
    const authorStudentId = user?.studentId || "2023-CS-807";

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
      <div className="w-full h-full flex flex-col bg-[#F8F9FA] text-zinc-900 select-none">
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
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* ======================================================== */}
          {/* COLUMN 1: LEFT SUBREDDIT DIRECTORY                       */}
          {/* ======================================================== */}
          <aside
            className={cn(
              "w-64 lg:w-72 border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-transform z-30",
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
          <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 space-y-4">
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
                {/* Full Reddit Post Card */}
                <article className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-2xs flex gap-3.5 sm:gap-4">
                  {/* Left Upvote / Downvote Pillar */}
                  <div className="flex flex-col items-center justify-start bg-zinc-50/80 rounded-2xl p-1.5 border border-zinc-200/80 shrink-0 w-10 sm:w-11">
                    <button
                      type="button"
                      onClick={() => handleVote(1)}
                      className={cn(
                        "p-1.5 rounded-xl transition-colors cursor-pointer",
                        post.userVote === 1
                          ? "bg-orange-600 text-white font-bold"
                          : "text-zinc-500 hover:text-orange-600 hover:bg-orange-50"
                      )}
                      title="Upvote"
                    >
                      <ArrowUp size={18} className="stroke-[2.5px]" />
                    </button>

                    <span
                      className={cn(
                        "text-xs sm:text-sm font-extrabold my-1.5 font-mono tracking-tight",
                        post.userVote === 1
                          ? "text-orange-600"
                          : post.userVote === -1
                            ? "text-blue-600"
                            : "text-zinc-800"
                      )}
                    >
                      {post.score}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVote(-1)}
                      className={cn(
                        "p-1.5 rounded-xl transition-colors cursor-pointer",
                        post.userVote === -1
                          ? "bg-blue-600 text-white font-bold"
                          : "text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                      )}
                      title="Downvote"
                    >
                      <ArrowDown size={18} className="stroke-[2.5px]" />
                    </button>
                  </div>

                  {/* Main Post Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header info */}
                    <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500">
                      <Link
                        href={`/community?community=${encodeURIComponent(post.community_name)}`}
                        className="font-extrabold text-black hover:underline"
                      >
                        {post.community_name}
                      </Link>
                      <span>&bull;</span>
                      <span>Posted by</span>
                      <span className="font-semibold text-zinc-800 flex items-center gap-1">
                        {post.author_name}
                        {post.author_verified && (
                          <ShieldCheck size={13} className="text-black" />
                        )}
                      </span>
                      {post.author_student_id && (
                        <span className="font-mono text-zinc-400 text-[11px]">
                          ({post.author_student_id})
                        </span>
                      )}
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5 text-zinc-400">
                        <Clock size={12} />
                        <span>
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>

                    {/* Title with Flair */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.flair && (
                          <span
                            className={cn(
                              "text-xs font-bold px-2.5 py-0.5 rounded-lg border",
                              FLAIR_COLORS[post.flair] || "bg-zinc-100 text-zinc-800 border-zinc-200"
                            )}
                          >
                            {post.flair}
                          </span>
                        )}
                        <h1 className="text-lg sm:text-xl font-black text-black leading-snug">
                          {post.title}
                        </h1>
                      </div>

                      {/* Content Text */}
                      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line pt-1">
                        {post.content}
                      </p>

                      {/* External Link */}
                      {post.link_url && (
                        <a
                          href={post.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium mt-2 bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100"
                        >
                          <ExternalLink size={13} />
                          <span className="truncate max-w-md">{post.link_url}</span>
                        </a>
                      )}

                      {/* Image Attachment */}
                      {post.image_url && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                          <img
                            src={post.image_url}
                            alt="Post attachment"
                            className="w-full object-cover max-h-96"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions row */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center gap-4 text-xs font-semibold text-zinc-500">
                      <div className="flex items-center gap-1.5 text-black font-bold">
                        <MessageSquare size={15} />
                        <span>{comments.length} Comments</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center gap-1.5 hover:text-black hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSaved(!isSaved)}
                        className={cn(
                          "flex items-center gap-1.5 hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors cursor-pointer",
                          isSaved ? "text-black font-bold" : "hover:text-black"
                        )}
                      >
                        <Bookmark size={14} className={isSaved ? "fill-black text-black" : ""} />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
                  </div>
                </article>

                {/* Comment Composer */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-black">
                      Comment as{" "}
                      <span className="font-normal text-zinc-600">
                        {user?.name || "Muhammad Hammad Ismail"} ({user?.studentId || "2023-CS-807"})
                      </span>
                    </span>
                    {replyingToCommentId && (
                      <button
                        type="button"
                        onClick={() => setNewCommentText("")}
                        className="text-red-600 font-semibold hover:underline"
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
                      className="w-full p-3.5 border border-zinc-300 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black leading-relaxed"
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-9 px-5 rounded-xl cursor-pointer"
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
                <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
                  <div className="font-black text-sm text-black flex items-center justify-between border-b border-zinc-100 pb-3">
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
                              ? "ml-6 sm:ml-8 bg-zinc-50/70 border-l-4 border-l-black border-zinc-200"
                              : "bg-white border-zinc-200 shadow-2xs"
                          )}
                        >
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <div className="flex items-center gap-1.5 font-bold text-black">
                              <span>{comm.author_name}</span>
                              {comm.author_verified && (
                                <ShieldCheck size={13} className="text-black" />
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
          <aside className="w-72 xl:w-80 border-l border-zinc-200 bg-white p-4 space-y-4 overflow-y-auto hidden lg:block shrink-0">
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
      </div>
    </MobileShell>
  );
}
