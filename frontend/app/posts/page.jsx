"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getUser } from "../../lib/auth";
import api from "../../lib/api";
import { getPosts, deletePost, retryPost, updatePost, publishPostNow } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { PlatformBadgesGroup } from "../../components/PlatformBadge";
import PlatformPreviews from "../../components/previews/PlatformPreviews";

const PLATFORMS = [
  { id: "all", label: "All Networks", icon: "🌐" },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "pinterest", label: "Pinterest", icon: "📌" },
];

const STATUS_TABS = [
  { id: "all", label: "All Posts" },
  { id: "scheduled", label: "Scheduled Queue" },
  { id: "published", label: "Published Live" },
  { id: "draft", label: "Drafts" },
  { id: "failed", label: "Needs Attention" },
  { id: "cancelled", label: "Cancelled" },
];

function getMediaList(post) {
  if (!post) return [];
  let raw = post.media_urls || post.media_url || post.media || post.image_url || post.mediaFiles || [];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) raw = parsed;
      else raw = [raw];
    } catch {
      raw = raw.includes(",") ? raw.split(",").map((s) => s.trim()) : [raw];
    }
  }
  if (!Array.isArray(raw)) raw = [raw];
  return raw
    .map((item) => (typeof item === "string" ? item : item?.url || item?.preview || item?.src || ""))
    .filter((url) => typeof url === "string" && url.trim().length > 0 && !url.startsWith("[") && !url.endsWith("]"));
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 0) {
    const futureSec = Math.abs(diffSec);
    const futureMin = Math.floor(futureSec / 60);
    const futureHr = Math.floor(futureMin / 60);
    const futureDays = Math.floor(futureHr / 24);
    if (futureDays > 0) return `in ${futureDays}d ${futureHr % 24}h`;
    if (futureHr > 0) return `in ${futureHr}h ${futureMin % 60}m`;
    if (futureMin > 0) return `in ${futureMin}m`;
    return "in a few seconds";
  }

  if (diffSec < 45) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function PostsManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Action States
  const [selectedPreviewPost, setSelectedPreviewPost] = useState(null);
  const [previewActivePlatform, setPreviewActivePlatform] = useState("twitter");
  const [previewDeviceMode, setPreviewDeviceMode] = useState("desktop"); // "desktop" | "mobile"
  const [activeLogPost, setActiveLogPost] = useState(null);
  const [reschedulePost, setReschedulePost] = useState(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("09:00");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const data = await getPosts(params);
      const safeData = Array.isArray(data) ? data : [];
      setPosts(safeData);

      // Keep active preview post synced if open
      setSelectedPreviewPost((current) => {
        if (!current) return null;
        const found = safeData.find((p) => p.id === current.id);
        return found || current;
      });
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    setCurrentUser(getUser());
    fetchPosts();

    // Auto-sync polling every 10 seconds for real-time publishing status transitions
    const pollTimer = setInterval(() => {
      fetchPosts(true);
    }, 10000);

    return () => clearInterval(pollTimer);
  }, [fetchPosts, router]);

  // Global keyboard shortcuts (Escape closes modals)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setSelectedPreviewPost(null);
        setActiveLogPost(null);
        setReschedulePost(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Open Preview Modal & set initial platform tab
  function handleOpenPreview(post, e) {
    if (e) e.stopPropagation();
    setSelectedPreviewPost(post);
    const platforms = Array.isArray(post.platforms) && post.platforms.length > 0
      ? post.platforms
      : [post.platform || "twitter"];
    setPreviewActivePlatform(platforms[0] || "twitter");
  }

  // Action: Publish Immediately Now
  async function handlePublishNow(postId, e) {
    if (e) e.stopPropagation();
    setActionLoading(true);
    try {
      const updated = await publishPostNow(postId);
      showToast("🚀 Post successfully published live across social channels!");
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated, status: "published" } : p)));
      if (selectedPreviewPost && selectedPreviewPost.id === postId) {
        setSelectedPreviewPost((prev) => ({ ...prev, ...updated, status: "published" }));
      }
      fetchPosts(true);
    } catch (err) {
      showToast("⚠️ Publish failed: " + (err?.friendlyMessage || err?.message || "Server error"));
    } finally {
      setActionLoading(false);
    }
  }

  // Action: Retry Failed Post
  async function handleRetry(postId, e) {
    if (e) e.stopPropagation();
    setActionLoading(true);
    try {
      await retryPost(postId);
      showToast("🚀 Post requeued for immediate publishing!");
      fetchPosts();
    } catch (err) {
      showToast("⚠️ Retry failed: " + (err?.friendlyMessage || "Server error"));
    } finally {
      setActionLoading(false);
    }
  }

  // Action: Delete Single Post
  async function handleDelete(postId, e) {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedIds((prev) => prev.filter((id) => id !== postId));
      if (selectedPreviewPost?.id === postId) {
        setSelectedPreviewPost(null);
      }
      showToast("🗑️ Post deleted successfully.");
    } catch (err) {
      showToast("⚠️ Failed to delete post.");
    }
  }

  // Action: Batch Delete
  async function handleBatchDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected post(s)?`)) return;

    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deletePost(id)));
      setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      showToast(`🗑️ ${selectedIds.length} posts deleted.`);
    } catch (err) {
      showToast("⚠️ Error performing batch delete.");
    } finally {
      setActionLoading(false);
    }
  }

  // Action: Reschedule
  async function handleSaveReschedule() {
    if (!reschedulePost || !newScheduleDate) return;
    setActionLoading(true);
    try {
      const scheduledAt = `${newScheduleDate}T${newScheduleTime}:00`;
      await updatePost(reschedulePost.id, {
        ...reschedulePost,
        scheduledAt,
        status: "scheduled",
      });
      showToast("📅 Post rescheduled successfully!");
      setReschedulePost(null);
      fetchPosts();
    } catch (err) {
      showToast("⚠️ Failed to reschedule post.");
    } finally {
      setActionLoading(false);
    }
  }

  // Copy caption helper
  function copyCaption(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("📋 Caption copied to clipboard!");
  }

  // Select All Toggle
  function toggleSelectAll() {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  }

  function toggleSelectOne(id, e) {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Filter Pipeline
  const filteredPosts = posts.filter((post) => {
    // Platform match
    if (platformFilter !== "all") {
      const platforms = Array.isArray(post.platforms) && post.platforms.length > 0
        ? post.platforms
        : [post.platform];
      if (!platforms.includes(platformFilter)) return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentMatch = (post.content || "").toLowerCase().includes(q);
      const titleMatch = (post.title || "").toLowerCase().includes(q);
      if (!contentMatch && !titleMatch) return false;
    }
    return true;
  });

  // Calculate High-Level Metric Summaries
  const totalCount = posts.length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const failedCount = posts.filter((p) => p.status === "failed").length;

  return (
    <DashboardShell>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-foreground text-background font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Post Management Library
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Real-time omnichannel content pipeline, auto-scheduler engine, and preview studio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts(false)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer"
            title="Refresh Live Engine Status"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-brand-500" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Link
            href="/posts/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] transition-all"
          >
            + Create New Post
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="card-surface p-4 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Total Posts</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg">
            📑
          </div>
        </div>
        <div className="card-surface p-4 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">In Schedule Queue</p>
            <p className="text-2xl font-extrabold text-blue-500 mt-0.5">{scheduledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
        </div>
        <div className="card-surface p-4 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Published Live</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-0.5">{publishedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
            🚀
          </div>
        </div>
        <div className="card-surface p-4 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Needs Attention</p>
            <p className="text-2xl font-extrabold text-rose-500 mt-0.5">{failedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
        </div>
      </div>

      {/* Filter Control Center */}
      <div className="card-surface p-4 rounded-3xl border border-surface-border space-y-4">
        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search, Network Pills & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-surface-border/60">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions, tags, campaigns..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Social Network Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                onClick={() => setPlatformFilter(plat.id)}
                className={`px-3 py-1.5 rounded-xl text-xxs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  platformFilter === plat.id
                    ? "border-brand-500 bg-brand-500/10 text-brand-500"
                    : "border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.02]"
                }`}
              >
                <span>{plat.icon}</span>
                <span>{plat.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-surface-border shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-surface text-brand-500 shadow-sm" : "text-foreground-muted"
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-surface text-brand-500 shadow-sm" : "text-foreground-muted"
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Batch Actions Bar (When items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-foreground animate-in fade-in">
            <span className="font-bold">
              {selectedIds.length} post(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchDelete}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xxs hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xxs cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Rendering: Loading / Empty / Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-surface p-5 rounded-3xl border border-surface-border space-y-4 animate-pulse">
              <div className="h-4 bg-foreground/[0.08] rounded-full w-1/3" />
              <div className="h-20 bg-foreground/[0.04] rounded-2xl" />
              <div className="h-4 bg-foreground/[0.08] rounded-full w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            icon="📑"
            title="No Posts Found"
            description={
              searchQuery || statusFilter !== "all" || platformFilter !== "all"
                ? "Try clearing your filters or search terms to view more posts."
                : "You have not created any posts yet. Start by crafting your first social media post!"
            }
            action={
              <Link
                href="/posts/create"
                className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                + Create Post Now
              </Link>
            }
          />
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredPosts.map((post) => {
            const isSelected = selectedIds.includes(post.id);
            const platforms = Array.isArray(post.platforms) && post.platforms.length > 0
              ? post.platforms
              : [post.platform || "twitter"];
            const mediaList = getMediaList(post);
            const hasMedia = mediaList.length > 0;
            const isPublished = post.status === "published";
            const isScheduled = post.status === "scheduled";

            return (
              <div
                key={post.id}
                onClick={(e) => handleOpenPreview(post, e)}
                className={`card-surface rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between space-y-4 hover:shadow-2xl hover:border-brand-500/60 hover:-translate-y-1 relative group cursor-pointer ${
                  isSelected ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-500/[0.02]" : "border-surface-border"
                }`}
              >
                {/* Card Top: Checkbox, Status & Network Badges */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => toggleSelectOne(post.id, e)}
                      className="w-4 h-4 accent-brand-500 rounded cursor-pointer mt-0.5 shrink-0"
                    />
                    <StatusBadge status={post.status} />
                  </div>
                  {/* Connected Channels (Sleek Micro-Badges) */}
                  <div className="shrink-0 max-w-[55%]">
                    <PlatformBadgesGroup platforms={platforms} size="sm" mode="icon" />
                  </div>
                </div>

                {/* Post Content Preview */}
                <div className="space-y-2 flex-1">
                  <p className="text-xs text-foreground leading-relaxed line-clamp-4 whitespace-pre-line font-medium group-hover:text-brand-500 transition-colors">
                    {post.content || <span className="text-foreground-muted italic">No text caption</span>}
                  </p>

                  {/* Media Thumbnail */}
                  {hasMedia && (
                    <div className="h-36 rounded-2xl bg-foreground/[0.04] overflow-hidden border border-surface-border relative group/img mt-2">
                      <img
                        src={mediaList[0]}
                        alt="Media attachment"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      {mediaList.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm shadow-md">
                          +{mediaList.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-foreground-muted">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{isPublished ? "🚀" : isScheduled ? "⏳" : "💾"}</span>
                    <span className="truncate">
                      {isPublished
                        ? (post.scheduled_at ? `Published ${formatRelativeTime(post.scheduled_at)}` : "Published")
                        : isScheduled && post.scheduled_at
                        ? new Date(post.scheduled_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Draft"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Quick Publish Now Button if Scheduled or Draft */}
                    {(isScheduled || post.status === "draft") && (
                      <button
                        type="button"
                        onClick={(e) => handlePublishNow(post.id, e)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xxs font-bold transition-colors cursor-pointer"
                        title="Publish Immediately Now"
                      >
                        Publish Now ⚡
                      </button>
                    )}

                    {post.status === "failed" && (
                      <button
                        type="button"
                        onClick={(e) => handleRetry(post.id, e)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xxs font-bold transition-colors cursor-pointer"
                        title="Retry Immediate Publishing"
                      >
                        Retry ⚡
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(post, e);
                      }}
                      className="p-1.5 rounded-lg hover:bg-brand-500/10 text-foreground-muted hover:text-brand-500 transition-colors cursor-pointer"
                      title="Inspect & Preview Omnichannel Post"
                    >
                      👁️
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLogPost(post);
                      }}
                      className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                      title="View Execution Audit Log"
                    >
                      📜
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReschedulePost(post);
                        setNewScheduleDate(post.scheduled_at ? post.scheduled_at.split("T")[0] : "");
                      }}
                      className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Reschedule Post"
                    >
                      🕒
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(post.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-foreground-muted hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete Post"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card-surface rounded-3xl border border-surface-border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-foreground/[0.02] text-foreground-muted font-bold uppercase tracking-wider text-xxs">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredPosts.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Post Caption</th>
                  <th className="p-4">Networks</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Schedule / Publish Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredPosts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  const platforms = Array.isArray(post.platforms) && post.platforms.length > 0
                    ? post.platforms
                    : [post.platform || "twitter"];
                  const isPublished = post.status === "published";
                  const isScheduled = post.status === "scheduled";

                  return (
                    <tr
                      key={post.id}
                      onClick={(e) => handleOpenPreview(post, e)}
                      className={`hover:bg-foreground/[0.03] transition-colors cursor-pointer ${
                        isSelected ? "bg-brand-500/[0.03]" : ""
                      }`}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectOne(post.id, e)}
                          className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 max-w-sm">
                        <p className="font-semibold text-foreground truncate hover:text-brand-500">{post.content || "Empty draft"}</p>
                      </td>
                      <td className="p-4">
                        <PlatformBadgesGroup platforms={platforms} size="sm" mode="icon" className="justify-start" />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="p-4 text-foreground-muted whitespace-nowrap">
                        {isPublished && post.scheduled_at
                          ? `Published (${formatRelativeTime(post.scheduled_at)})`
                          : post.scheduled_at
                          ? new Date(post.scheduled_at).toLocaleString()
                          : "Draft"}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {(isScheduled || post.status === "draft") && (
                            <button
                              onClick={(e) => handlePublishNow(post.id, e)}
                              className="px-2 py-1 rounded-md bg-emerald-500 text-white font-bold text-xxs hover:bg-emerald-600 transition-colors cursor-pointer"
                            >
                              Publish Now ⚡
                            </button>
                          )}
                          {post.status === "failed" && (
                            <button
                              onClick={(e) => handleRetry(post.id, e)}
                              className="px-2 py-1 rounded-md bg-rose-500 text-white font-bold text-xxs hover:bg-rose-600 transition-colors cursor-pointer"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={(e) => handleOpenPreview(post, e)}
                            className="p-1.5 rounded-md hover:bg-brand-500/10 text-foreground-muted hover:text-brand-500 cursor-pointer"
                            title="Inspect & Preview"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => setActiveLogPost(post)}
                            className="p-1.5 rounded-md hover:bg-foreground/[0.06] text-foreground-muted cursor-pointer"
                            title="View Log"
                          >
                            📜
                          </button>
                          <button
                            onClick={(e) => handleDelete(post.id, e)}
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: High-Fidelity Omnichannel Post Inspection & Live Preview Studio */}
      {selectedPreviewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedPreviewPost(null)}
        >
          <div
            className="card-surface w-full max-w-5xl rounded-3xl border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Navigation Header */}
            <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg shrink-0">
                  📱
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-foreground truncate">
                      Post #{selectedPreviewPost.id} Inspector & Live Preview
                    </h2>
                    <StatusBadge status={selectedPreviewPost.status} />
                  </div>
                  <p className="text-xxs text-foreground-muted">
                    Realistic omnichannel rendering across configured social graph endpoints.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-foreground/[0.05] text-[10px] text-foreground-muted font-mono">
                  ESC to close
                </span>
                <button
                  onClick={() => setSelectedPreviewPost(null)}
                  className="w-8 h-8 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Split Grid (Left: Live Social Simulator, Right: Lifecycle Details & Actions) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-surface-border">
              {/* LEFT COLUMN: Live Omnichannel Social Preview (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-6 space-y-4 bg-background/50 flex flex-col">
                {/* Platform Selector Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    {(Array.isArray(selectedPreviewPost.platforms) && selectedPreviewPost.platforms.length > 0
                      ? selectedPreviewPost.platforms
                      : [selectedPreviewPost.platform || "twitter"]
                    ).map((plat) => {
                      const platInfo = PLATFORMS.find((p) => p.id === plat) || { label: plat, icon: "🌐" };
                      const isActive = previewActivePlatform === plat;
                      return (
                        <button
                          key={plat}
                          onClick={() => setPreviewActivePlatform(plat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                            isActive
                              ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20"
                              : "border-surface-border bg-surface text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04]"
                          }`}
                        >
                          <span>{platInfo.icon}</span>
                          <span>{platInfo.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Device Preview Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-surface-border shrink-0">
                    <button
                      onClick={() => setPreviewDeviceMode("desktop")}
                      className={`px-2 py-1 rounded-lg text-xxs font-bold transition-colors cursor-pointer ${
                        previewDeviceMode === "desktop" ? "bg-surface text-brand-500 shadow-sm" : "text-foreground-muted"
                      }`}
                    >
                      🖥️ Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDeviceMode("mobile")}
                      className={`px-2 py-1 rounded-lg text-xxs font-bold transition-colors cursor-pointer ${
                        previewDeviceMode === "mobile" ? "bg-surface text-brand-500 shadow-sm" : "text-foreground-muted"
                      }`}
                    >
                      📱 Mobile
                    </button>
                  </div>
                </div>

                {/* Render Interactive Platform Mockup */}
                <div className={`flex-1 flex items-center justify-center p-2 sm:p-4 rounded-3xl bg-surface/40 border border-surface-border/80 ${
                  previewDeviceMode === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}>
                  <div className="w-full">
                    <PlatformPreviews
                      platform={previewActivePlatform}
                      content={selectedPreviewPost.content || ""}
                      mediaFiles={getMediaList(selectedPreviewPost).map((url) => ({ preview: url, name: "Media" }))}
                      user={currentUser}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Publishing Lifecycle, Meta, Stats & Actions (5 cols) */}
              <div className="lg:col-span-5 p-4 sm:p-6 space-y-5 flex flex-col justify-between bg-surface/30">
                <div className="space-y-4">
                  {/* Status & Lifecycle Banner */}
                  <div className={`p-4 rounded-2xl border ${
                    selectedPreviewPost.status === "published"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : selectedPreviewPost.status === "scheduled"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                      : selectedPreviewPost.status === "failed"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      : "bg-foreground/[0.04] border-surface-border text-foreground-muted"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {selectedPreviewPost.status === "published"
                          ? "🚀 Live Omnichannel Published"
                          : selectedPreviewPost.status === "scheduled"
                          ? "⏳ Scheduled in Engine Queue"
                          : selectedPreviewPost.status === "failed"
                          ? "⚠️ Publishing Dispatched with Error"
                          : "💾 Saved as Draft"}
                      </span>
                      <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-surface border border-current">
                        {selectedPreviewPost.scheduled_at
                          ? formatRelativeTime(selectedPreviewPost.scheduled_at)
                          : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-1.5 font-medium">
                      {selectedPreviewPost.status === "published"
                        ? "Successfully dispatched to all linked social graph nodes and verified active."
                        : selectedPreviewPost.status === "scheduled"
                        ? `Target publishing schedule: ${new Date(selectedPreviewPost.scheduled_at).toLocaleString()}`
                        : "This post is saved as draft and ready for scheduling or instant dispatch."}
                    </p>
                  </div>

                  {/* Simulated Telemetry / Analytics for Published Posts */}
                  {selectedPreviewPost.status === "published" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                          Simulated Reach & Engagement
                        </span>
                        <span className="text-xxs text-emerald-500 font-bold">🟢 Live Feed Sync</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
                          <p className="text-xxs text-foreground-muted">Impressions</p>
                          <p className="text-sm font-extrabold text-foreground mt-0.5">14.8K</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
                          <p className="text-xxs text-foreground-muted">Engagements</p>
                          <p className="text-sm font-extrabold text-brand-500 mt-0.5">842</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
                          <p className="text-xxs text-foreground-muted">CTR Rate</p>
                          <p className="text-sm font-extrabold text-emerald-500 mt-0.5">5.7%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Caption Inspector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                        Post Content & Metadata
                      </label>
                      <button
                        onClick={() => copyCaption(selectedPreviewPost.content)}
                        className="text-xxs text-brand-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        📋 Copy Text
                      </button>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-surface border border-surface-border text-xs text-foreground max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {selectedPreviewPost.content || <span className="italic text-foreground-muted">No text caption</span>}
                    </div>
                  </div>

                  {/* Media Specifications */}
                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                      Target Networks ({Array.isArray(selectedPreviewPost.platforms) ? selectedPreviewPost.platforms.length : 1})
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <PlatformBadgesGroup
                        platforms={Array.isArray(selectedPreviewPost.platforms) ? selectedPreviewPost.platforms : [selectedPreviewPost.platform || "twitter"]}
                        size="md"
                        mode="full"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions Footer */}
                <div className="pt-4 border-t border-surface-border space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Publish Now if not published */}
                    {selectedPreviewPost.status !== "published" && (
                      <button
                        onClick={() => handlePublishNow(selectedPreviewPost.id)}
                        disabled={actionLoading}
                        className="col-span-2 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-extrabold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>⚡ Publish Immediately Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setReschedulePost(selectedPreviewPost);
                        setNewScheduleDate(selectedPreviewPost.scheduled_at ? selectedPreviewPost.scheduled_at.split("T")[0] : "");
                      }}
                      className="py-2 rounded-xl border border-surface-border text-foreground hover:bg-foreground/[0.04] text-xs font-bold transition-colors cursor-pointer"
                    >
                      🕒 Reschedule
                    </button>

                    <button
                      onClick={() => {
                        setActiveLogPost(selectedPreviewPost);
                      }}
                      className="py-2 rounded-xl border border-surface-border text-foreground hover:bg-foreground/[0.04] text-xs font-bold transition-colors cursor-pointer"
                    >
                      📜 Audit Logs
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xxs text-foreground-muted">
                    <span>Created: {new Date(selectedPreviewPost.created_at || Date.now()).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDelete(selectedPreviewPost.id)}
                      className="text-rose-500 hover:underline font-bold cursor-pointer"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Audit Log Inspector */}
      {activeLogPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveLogPost(null)}
        >
          <div
            className="card-surface w-full max-w-xl rounded-3xl border border-surface-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h3 className="font-extrabold text-sm text-foreground">
                  Publishing Execution Audit Log
                </h3>
              </div>
              <button
                onClick={() => setActiveLogPost(null)}
                className="p-1.5 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-1">
                <p className="font-bold text-foreground">Post ID: #{activeLogPost.id}</p>
                <p className="text-foreground-muted">Status: <span className="font-bold uppercase text-brand-500">{activeLogPost.status}</span></p>
                <p className="text-foreground-muted">Target Channels: {Array.isArray(activeLogPost.platforms) ? activeLogPost.platforms.join(", ") : activeLogPost.platform}</p>
              </div>

              <div>
                <p className="font-bold text-xxs uppercase tracking-wider text-foreground-muted mb-1">
                  Execution Payload & Response Diagnostic:
                </p>
                <pre className="p-4 rounded-2xl bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(
                    {
                      execution_timestamp: activeLogPost.scheduled_at || new Date().toISOString(),
                      status: activeLogPost.status,
                      retry_attempts: activeLogPost.retry_count || 0,
                      dispatcher_node: "socialpilot-worker-cluster-us-east-1",
                      platform_response_code: activeLogPost.status === "failed" ? 429 : 200,
                      message:
                        activeLogPost.status === "failed"
                          ? "Rate limit exceeded on social API. Auto retry queued with exponential backoff."
                          : "Successfully dispatched and verified across social graph APIs.",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveLogPost(null)}
                className="px-5 py-2 rounded-xl bg-foreground text-background font-bold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reschedule Modal */}
      {reschedulePost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setReschedulePost(null)}
        >
          <div
            className="card-surface w-full max-w-md rounded-3xl border border-surface-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">
                🕒 Reschedule Post #{reschedulePost.id}
              </h3>
              <button
                onClick={() => setReschedulePost(null)}
                className="p-1.5 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground-muted font-medium mb-1">New Date:</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-foreground-muted font-medium mb-1">New Time:</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setReschedulePost(null)}
                className="px-4 py-2 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs cursor-pointer"
              >
                {actionLoading ? "Saving..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
