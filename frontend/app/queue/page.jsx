"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import { getPosts, retryPost, cancelPost } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";

const PLATFORM_META = {
  facebook: { label: "Facebook", color: "bg-blue-600" },
  instagram: { label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" },
  linkedin: { label: "LinkedIn", color: "bg-blue-700" },
  twitter: { label: "X (Twitter)", color: "bg-sky-500" },
  youtube: { label: "YouTube", color: "bg-red-600" },
  pinterest: { label: "Pinterest", color: "bg-red-500" },
};

const TABS = [
  { value: "", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_COPY = {
  "": { 
    icon: "📭",
    title: "No posts in queue", 
    desc: "Everything you create, schedule, or publish will show up here." 
  },
  scheduled: { 
    icon: "⏰",
    title: "Nothing scheduled", 
    desc: "Posts you schedule for automated publishing will appear in this section." 
  },
  published: { 
    icon: "🚀",
    title: "Nothing published yet", 
    desc: "Posts that successfully go live to your social channels will be listed here." 
  },
  failed: { 
    icon: "✨",
    title: "No failed posts — all clear!", 
    desc: "Any posts encountering publishing or network issues will appear here for retry." 
  },
  cancelled: { 
    icon: "🛑",
    title: "No cancelled posts", 
    desc: "Posts that you actively cancel will be retained here for your records." 
  },
};

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

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-surface-border bg-surface/50 animate-pulse">
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-background-secondary rounded w-2/3" />
        <div className="h-3 bg-background-secondary rounded w-1/3" />
      </div>
      <div className="h-7 w-24 bg-background-secondary rounded-full" />
    </div>
  );
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
      setError("Could not load the publishing queue.");
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
      setError("Retry failed. Please try again.");
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
      setError("Could not cancel this post.");
    } finally {
      setActionId(null);
    }
  }

  // Calculate live counts for all status tabs
  const counts = {
    all: posts.length,
    scheduled: posts.filter((p) => (p.status || "").toLowerCase() === "scheduled").length,
    published: posts.filter((p) => (p.status || "").toLowerCase() === "published").length,
    failed: posts.filter((p) => (p.status || "").toLowerCase() === "failed").length,
    cancelled: posts.filter((p) => (p.status || "").toLowerCase() === "cancelled").length,
  };

  // Strictly filter posts matching current active tab
  const filteredPosts = posts.filter((post) => {
    if (!activeTab) return true;
    return (post.status || "").toLowerCase() === activeTab.toLowerCase();
  });

  const emptyCopy = EMPTY_COPY[activeTab] || EMPTY_COPY[""];

  return (
    <DashboardShell>
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Publishing Queue
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Track, organize, and manage scheduled, published, failed, and cancelled posts.
            </p>
          </div>
          <button
            onClick={() => router.push("/posts/create")}
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            + New Post
          </button>
        </div>

        {/* Filter tabs with dynamic count badges */}
        <div className="flex gap-1.5 p-1.5 mb-6 rounded-2xl bg-background-secondary border border-surface-border w-fit overflow-x-auto max-w-full">
          {TABS.map((tab) => {
            const countKey = tab.value || "all";
            const count = counts[countKey] ?? 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-surface shadow-sm text-brand-600 font-bold"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600"
                      : "bg-surface-border/60 text-foreground-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-6 py-3 px-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-background-secondary flex items-center justify-center mb-4 text-3xl shadow-inner">
              {emptyCopy.icon}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {emptyCopy.title}
            </h3>
            <p className="text-sm text-foreground-muted max-w-sm">
              {emptyCopy.desc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-surface-border bg-surface/60 hover:bg-surface hover:shadow-md transition-all group"
              >
                {/* Content + platforms + timeline */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate mb-2">
                    {post.content || "Empty post content"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                    {post.platforms && post.platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 pr-2 border-r border-divider">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            title={PLATFORM_META[p]?.label || p}
                            className={`w-3.5 h-3.5 rounded-full ${
                              PLATFORM_META[p]?.color || "bg-background-secondary"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className="font-medium text-foreground-subtle">
                      {post.status === "published"
                        ? `Published ${formatDateTime(post.updated_at || post.published_at || post.created_at)}`
                        : post.status === "failed"
                        ? `Failed ${formatDateTime(post.updated_at || post.created_at)}`
                        : post.status === "cancelled"
                        ? `Cancelled ${formatDateTime(post.updated_at || post.created_at)}`
                        : `Scheduled for ${formatDateTime(post.scheduled_at || post.created_at)}`}
                    </span>
                  </div>
                  {post.status === "failed" && post.error_message && (
                    <p className="text-xs text-red-500 mt-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
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
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm active:scale-95 disabled:opacity-60 transition-all"
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
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold active:scale-95 disabled:opacity-60 transition-all shadow-sm"
                        >
                          {actionId === post.id ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="px-3 py-1.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs font-semibold hover:bg-background-secondary transition-all"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(post.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-surface-border text-foreground-subtle hover:text-red-600 hover:border-red-500/30 text-xs font-medium hover:bg-background-secondary transition-all"
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