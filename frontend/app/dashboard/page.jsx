"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getUser } from "../../lib/auth";
import api from "../../lib/api";
import { getDrafts, getQueue } from "../../lib/posts";
import { roleConfig } from "../../lib/roleConfig";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/skeletons";

const PLATFORM_META = {
  facebook: { color: "bg-blue-600", label: "Facebook" },
  instagram: {
    color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    label: "Instagram",
  },
  linkedin: { color: "bg-blue-700", label: "LinkedIn" },
  twitter: { color: "bg-sky-500", label: "X / Twitter" },
  youtube: { color: "bg-red-600", label: "YouTube" },
  pinterest: { color: "bg-red-500", label: "Pinterest" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [published, setPublished] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [draftsData, scheduledData, publishedData, accountsRes] =
        await Promise.all([
          getDrafts().catch(() => []),
          getQueue("scheduled").catch(() => []),
          getQueue("published").catch(() => []),
          api.get("/api/v1/social-accounts").catch(() => ({ data: [] })),
        ]);
      setDrafts(draftsData || []);
      setScheduled(scheduledData || []);
      setPublished(publishedData || []);
      setAccounts(accountsRes.data || []);

      const combined = [...(scheduledData || []), ...(publishedData || [])]
        .sort((a, b) => {
          const dateA = new Date(a.scheduled_at || a.published_at || 0);
          const dateB = new Date(b.scheduled_at || b.published_at || 0);
          return dateB - dateA;
        })
        .slice(0, 6);
      setRecent(combined);
    } catch (err) {
      setError(
        err.friendlyMessage || "Some dashboard data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  const user = getUser();
  const role = user?.role || "creator";
  const currentConfig = roleConfig[role] || roleConfig.creator;
  const quickActions = currentConfig.quickActions || [
    {
      label: "Create Post",
      href: "/posts/create",
      icon: "✏️",
      desc: "Draft or schedule new content",
    },
    {
      label: "Publishing Queue",
      href: "/queue",
      icon: "📋",
      desc: "Manage publishing pipeline",
    },
    {
      label: "Interactive Calendar",
      href: "/calendar",
      icon: "📅",
      desc: "Visual schedule planner",
    },
    {
      label: "Post Library",
      href: "/posts",
      icon: "📚",
      desc: "Browse published and scheduled posts",
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {currentConfig.landingTitle || "Dashboard Overview"}
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              {currentConfig.landingDesc || "Monitor scheduled posts, campaign metrics, and publishing performance."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              type="button"
              className="p-2 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer"
              title="Refresh Dashboard"
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
              href={currentConfig.primaryHref || "/posts/create"}
              className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>+</span> {currentConfig.primaryAction || "Create Post"}
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAll}
              className="underline text-xs font-semibold hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {loading ? (
            <SkeletonCard count={4} />
          ) : (
            <>
              <div className="card-surface p-5 rounded-2xl border transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Drafts
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-base">
                    📄
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
                  {drafts.length}
                </p>
                <p className="text-xs text-foreground-subtle">
                  Ready to review or schedule
                </p>
              </div>

              <div className="card-surface p-5 rounded-2xl border transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Scheduled
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-base">
                    🕒
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
                  {scheduled.length}
                </p>
                <p className="text-xs text-foreground-subtle">
                  Queued in active timetable
                </p>
              </div>

              <div className="card-surface p-5 rounded-2xl border transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Published
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base">
                    ✅
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
                  {published.length}
                </p>
                <p className="text-xs text-foreground-subtle">
                  Live on connected channels
                </p>
              </div>

              <div className="card-surface p-5 rounded-2xl border transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Accounts
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-base">
                    🔗
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
                  {accounts.length}
                </p>
                <p className="text-xs text-foreground-subtle">
                  Active social integrations
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 card-surface p-6 rounded-3xl border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-surface-border hover:bg-foreground/[0.03] transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/10 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-foreground-subtle truncate">
                      {action.desc}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-foreground-subtle group-hover:translate-x-0.5 group-hover:text-brand-500 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 card-surface p-6 rounded-3xl border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
                  Recent Activity
                </h2>
                <p className="text-xs text-foreground-subtle mt-0.5">
                  Latest scheduled & published content
                </p>
              </div>
              <Link
                href="/queue"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View Full Queue &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-foreground/[0.04] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                type="posts"
                title="No recent posts found"
                description="You haven't scheduled or published any posts yet. Start scheduling across your channels."
                actionLabel="Create Your First Post"
                actionHref="/posts/create"
                className="border-dashed bg-transparent shadow-none"
              />
            ) : (
              <div className="space-y-2.5">
                {recent.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-surface-border bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {post.content || "Untitled post"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          {(post.platforms || []).map((p) => (
                            <span
                              key={p}
                              title={PLATFORM_META[p]?.label || p}
                              className={`w-2.5 h-2.5 rounded-full ${
                                PLATFORM_META[p]?.color || "bg-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-foreground-subtle">
                          {post.scheduled_at
                            ? new Date(post.scheduled_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Draft / Immediate"}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}