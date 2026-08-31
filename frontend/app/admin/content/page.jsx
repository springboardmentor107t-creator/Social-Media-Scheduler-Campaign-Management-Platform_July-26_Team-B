"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import StatusBadge from "../../../components/StatusBadge";
import RoleBadge from "../../../components/RoleBadge";
import EmptyState from "../../../components/EmptyState";
import { SkeletonTable } from "../../../components/skeletons";

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

const STATUS_TABS = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

export default function AdminContentPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    checkAccess();
  }, []);

  useEffect(() => {
    if (!checkingAccess) fetchAllContent();
  }, [statusFilter, roleFilter, checkingAccess]);

  async function checkAccess() {
    try {
      const response = await api.get("/api/v1/auth/me");
      if (response.data.role !== "admin") {
        router.push("/profile");
        return;
      }
      setCheckingAccess(false);
    } catch (err) {
      router.push("/login");
    }
  }

  async function fetchAllContent() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;
      const response = await api.get("/api/v1/admin/posts", { params });
      setPosts(response.data || []);
    } catch (err) {
      setError(
        err.friendlyMessage || "Could not load platform content from database."
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAccess) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-foreground-muted">
            <svg
              className="animate-spin h-6 w-6 text-brand-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-semibold text-sm">
              Verifying Administrator Access...
            </span>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Content Moderation & Oversight
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Audit all user-generated posts, scheduled queues, and publishing channels platform-wide.
            </p>
          </div>
          <button
            onClick={fetchAllContent}
            type="button"
            className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer self-start sm:self-auto"
            title="Refresh Content"
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
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAllContent}
              className="underline text-xs font-semibold hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-foreground/[0.03] border border-surface-border rounded-2xl flex-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  statusFilter === tab.value
                    ? "bg-surface-raised shadow-sm text-brand-600 font-bold"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">All Author Roles</option>
            <option value="creator">Creator</option>
            <option value="manager">Manager</option>
            <option value="scheduler">Scheduler</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Posts Table / Mobile Card List */}
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : posts.length === 0 ? (
          <EmptyState
            type="posts"
            title="No platform posts found"
            description="No user content matches the selected status or role filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setStatusFilter("");
              setRoleFilter("");
            }}
          />
        ) : (
          <div className="card-surface rounded-2xl border overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-foreground/[0.02]">
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Post Content
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Author
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Target Platforms
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Status
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 max-w-xs font-medium text-foreground">
                        <p className="line-clamp-2">
                          {post.content || "Empty content"}
                        </p>
                        {post.media_urls && post.media_urls.length > 0 && (
                          <span className="text-xxs text-foreground-subtle flex items-center gap-1 mt-1">
                            📎 {post.media_urls.length} media attached
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-xs">
                            {post.owner_name || post.author_username || `User #${post.user_id}`}
                          </span>
                          {(post.owner_role || post.author_role) && (
                            <RoleBadge role={post.owner_role || post.author_role} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(post.platforms || []).map((p) => (
                            <span
                              key={p}
                              title={PLATFORM_META[p]?.label || p}
                              className={`w-3 h-3 rounded-full ${
                                PLATFORM_META[p]?.color || "bg-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-foreground-subtle whitespace-nowrap">
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
                          : post.created_at
                          ? new Date(post.created_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" }
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (<768px) */}
            <div className="md:hidden divide-y divide-surface-border">
              {posts.map((post) => (
                <div key={post.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-3">
                        {post.content || "Empty content"}
                      </p>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-surface-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {post.owner_name || post.author_username || `User #${post.user_id}`}
                      </span>
                      {(post.owner_role || post.author_role) && (
                        <RoleBadge role={post.owner_role || post.author_role} />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {(post.platforms || []).map((p) => (
                        <span
                          key={p}
                          className={`w-2.5 h-2.5 rounded-full ${
                            PLATFORM_META[p]?.color || "bg-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}