"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import { getPosts, retryPost, cancelPost } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { SkeletonPost } from "../../components/skeletons";

const PLATFORM_META = {
  facebook: { label: "Facebook", color: "bg-blue-600" },
  instagram: {
    label: "Instagram",
    color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
  },
  linkedin: { label: "LinkedIn", color: "bg-blue-700" },
  twitter: { label: "X (Twitter)", color: "bg-sky-500" },
  youtube: { label: "YouTube", color: "bg-red-600" },
  pinterest: { label: "Pinterest", color: "bg-red-500" },
};

const TABS = [
  { value: "", label: "All Posts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function QueuePage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [actionId, setActionId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    setError("");
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (err) {
      setError(
        err.friendlyMessage || "Could not load the publishing queue from server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(id) {
    setActionId(id);
    try {
      await retryPost(id);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "scheduled" } : p))
      );
    } catch (err) {
      setError(err.friendlyMessage || "Retry failed. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(id) {
    setActionId(id);
    try {
      await cancelPost(id);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "cancelled" } : p))
      );
      setConfirmCancelId(null);
    } catch (err) {
      setError(err.friendlyMessage || "Could not cancel this post.");
    } finally {
      setActionId(null);
    }
  }

  // Calculate live counts for all status tabs
  const counts = {
    all: posts.length,
    scheduled: posts.filter(
      (p) => (p.status || "").toLowerCase() === "scheduled"
    ).length,
    published: posts.filter(
      (p) => (p.status || "").toLowerCase() === "published"
    ).length,
    failed: posts.filter((p) => (p.status || "").toLowerCase() === "failed")
      .length,
    cancelled: posts.filter(
      (p) => (p.status || "").toLowerCase() === "cancelled"
    ).length,
  };

  // Strictly filter posts matching current active tab
  const filteredPosts = posts.filter((post) => {
    if (!activeTab) return true;
    return (post.status || "").toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Publishing Queue & Pipeline
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Track, organize, and manage scheduled, published, failed, and cancelled posts.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchQueue}
              type="button"
              className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer"
              title="Refresh Queue"
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
            <Link
              href="/posts/create"
              className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span>+</span> New Post
            </Link>
          </div>
        </div>

        {/* Filter tabs with dynamic count badges */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl bg-foreground/[0.03] border border-surface-border w-fit overflow-x-auto max-w-full">
          {TABS.map((tab) => {
            const countKey = tab.value || "all";
            const count = counts[countKey] ?? 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface-raised shadow-sm text-brand-600 font-bold"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600"
                      : "bg-surface-border text-foreground-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchQueue}
              className="underline text-xs font-semibold hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <SkeletonPost count={3} />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            type="posts"
            title={
              activeTab ? `No ${activeTab} posts` : "No posts in your queue"
            }
            description={
              activeTab === "scheduled"
                ? "You have no posts currently queued for automated publishing."
                : activeTab === "failed"
                ? "Great news! No failed publishing jobs found in your queue."
                : "Create or schedule new content across your social channels to fill the queue."
            }
            actionLabel="Create a Post"
            actionHref="/posts/create"
          />
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="card-surface p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all group"
              >
                {/* Content + platforms + timeline */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {post.content || "Untitled post content"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                    {post.platforms && post.platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 pr-2 border-r border-divider">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            title={PLATFORM_META[p]?.label || p}
                            className={`w-3.5 h-3.5 rounded-full ${
                              PLATFORM_META[p]?.color || "bg-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className="font-medium text-foreground-subtle">
                      {post.status === "published"
                        ? `Published ${formatDateTime(
                            post.updated_at ||
                              post.published_at ||
                              post.created_at
                          )}`
                        : post.status === "failed"
                        ? `Failed ${formatDateTime(
                            post.updated_at || post.created_at
                          )}`
                        : post.status === "cancelled"
                        ? `Cancelled ${formatDateTime(
                            post.updated_at || post.created_at
                          )}`
                        : `Scheduled for ${formatDateTime(
                            post.scheduled_at || post.created_at
                          )}`}
                    </span>
                  </div>
                  {post.status === "failed" && post.error_message && (
                    <p className="text-xs text-rose-500 mt-2 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                      {post.error_message}
                    </p>
                  )}
                </div>

                {/* Status Badge + Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-auto">
                  <StatusBadge status={post.status} />

                  {post.status === "failed" && (
                    <button
                      onClick={() => handleRetry(post.id)}
                      disabled={actionId === post.id}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {actionId === post.id ? "Retrying..." : "Retry"}
                    </button>
                  )}

                  {post.status === "scheduled" &&
                    (confirmCancelId === post.id ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <button
                          onClick={() => handleCancel(post.id)}
                          disabled={actionId === post.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold active:scale-95 disabled:opacity-60 transition-all shadow-sm cursor-pointer"
                        >
                          {actionId === post.id ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="px-3 py-1.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs font-semibold hover:bg-foreground/[0.04] transition-all cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(post.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-surface-border text-foreground-subtle hover:text-rose-600 hover:border-rose-500/30 text-xs font-medium hover:bg-foreground/[0.04] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}