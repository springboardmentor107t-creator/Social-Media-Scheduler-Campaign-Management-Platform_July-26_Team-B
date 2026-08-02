"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import { getQueue, retryPost, cancelPost } from "../../lib/posts";
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
  "": { title: "No posts yet", desc: "Everything you schedule or publish will show up here." },
  scheduled: { title: "Nothing scheduled", desc: "Posts you schedule for later will appear here." },
  published: { title: "Nothing published yet", desc: "Posts that go live will show up here." },
  failed: { title: "No failed posts — nice!", desc: "Publishing issues will appear here if they happen." },
  cancelled: { title: "No cancelled posts", desc: "Posts you cancel will be listed here." },
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
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      </div>
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
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
  }, [activeTab]);

  async function fetchQueue() {
    setLoading(true);
    setError("");
    try {
      const data = await getQueue(activeTab || undefined);
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
      await fetchQueue();
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
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setConfirmCancelId(null);
    } catch (err) {
      setError("Could not cancel this post.");
    } finally {
      setActionId(null);
    }
  }

  const emptyCopy = EMPTY_COPY[activeTab] || EMPTY_COPY[""];

  return (
    <DashboardShell>
      <div className="glass-panel p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Publishing Queue</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Track scheduled, published, and failed posts.
            </p>
          </div>
          <button
            onClick={() => router.push("/posts/create")}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all"
          >
            + New Post
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 mb-6 rounded-xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800 w-fit overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 py-3 px-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {emptyCopy.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {emptyCopy.desc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 hover:shadow-md transition-all"
              >
                {/* Content + platforms */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate mb-1.5">
                    {post.content || "Empty post"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      {(post.platforms || []).map((p) => (
                        <span
                          key={p}
                          title={PLATFORM_META[p]?.label}
                          className={`w-3.5 h-3.5 rounded-full ${PLATFORM_META[p]?.color || "bg-slate-400"}`}
                        />
                      ))}
                    </div>
                    <span>
                      {post.status === "published"
                        ? `Published ${formatDateTime(post.published_at)}`
                        : formatDateTime(post.scheduled_at)}
                    </span>
                  </div>
                  {post.status === "failed" && post.error_message && (
                    <p className="text-xs text-red-500 mt-1.5">{post.error_message}</p>
                  )}
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-3 md:flex-shrink-0">
                  <StatusBadge status={post.status} />

                  {post.status === "failed" && (
                    <button
                      onClick={() => handleRetry(post.id)}
                      disabled={actionId === post.id}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium disabled:opacity-60 transition-colors"
                    >
                      {actionId === post.id ? "Retrying..." : "Retry"}
                    </button>
                  )}

                  {post.status === "scheduled" &&
                    (confirmCancelId === post.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCancel(post.id)}
                          disabled={actionId === post.id}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium disabled:opacity-60"
                        >
                          {actionId === post.id ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium"
                        >
                          Never mind
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(post.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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