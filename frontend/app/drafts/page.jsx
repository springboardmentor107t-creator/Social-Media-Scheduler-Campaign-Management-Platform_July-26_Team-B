"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import { getDrafts, deletePost, updatePost } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/skeletons";

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

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [promoting, setPromoting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchDrafts();
  }, []);

  async function fetchDrafts() {
    setLoading(true);
    setError("");
    try {
      const data = await getDrafts();
      setDrafts(data || []);
    } catch (err) {
      setError(
        err.friendlyMessage || "Could not load saved drafts from server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      await deletePost(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setConfirmId(null);
      setSuccess("Draft deleted successfully.");
    } catch (err) {
      setError(err.friendlyMessage || "Could not delete draft.");
    } finally {
      setDeletingId(null);
    }
  }

  function openScheduler(draft) {
    setSchedulingId(draft.id);
    setScheduleDate("");
    setScheduleTime("09:00");
  }

  async function handlePromote(draft) {
    if (!scheduleDate || !scheduleTime) {
      setError("Pick a date and time to schedule this draft.");
      return;
    }

    const scheduledAt = new Date(
      `${scheduleDate}T${scheduleTime}`
    ).toISOString();

    setPromoting(true);
    setError("");
    setSuccess("");
    try {
      await updatePost(draft.id, {
        status: "scheduled",
        scheduled_at: scheduledAt,
      });
      setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      setSchedulingId(null);
      setSuccess("Draft scheduled and moved to publishing queue!");
    } catch (err) {
      setError(err.friendlyMessage || "Could not schedule draft.");
    } finally {
      setPromoting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Drafts & Content In-Progress
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Refine your ideas, attach media, and promote to the scheduled queue when ready.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/posts/create"
              className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>+</span> New Post
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between animate-in fade-in">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2 animate-in fade-in">
            <span>✓</span> {success}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : drafts.length === 0 ? (
          <EmptyState
            type="posts"
            title="No drafts found"
            description="You don't have any drafts in progress. Start writing new content to store drafts here."
            actionLabel="Create a Draft"
            actionHref="/posts/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="card-surface p-6 rounded-3xl border flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xxs font-mono text-foreground-subtle">
                      Saved {timeAgo(draft.updated_at || draft.created_at)}
                    </span>
                    <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                      Draft
                    </span>
                  </div>

                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap break-words line-clamp-4 mb-4 leading-relaxed">
                    {draft.content || "Empty draft content"}
                  </p>

                  {/* Platforms */}
                  {draft.platforms && draft.platforms.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                      {draft.platforms.map((p) => (
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
                </div>

                {/* Inline Scheduler Box if open */}
                {schedulingId === draft.id ? (
                  <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-3 animate-in fade-in">
                    <p className="text-xs font-bold text-foreground">
                      Set Schedule Time:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        min={todayStr}
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-surface-border text-xs bg-surface text-foreground focus:outline-none"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-surface-border text-xs bg-surface text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSchedulingId(null)}
                        className="text-xs font-semibold text-foreground-muted hover:text-foreground px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePromote(draft)}
                        disabled={promoting}
                        className="px-3 py-1.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {promoting ? "Scheduling..." : "Confirm Schedule"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                    <button
                      onClick={() => openScheduler(draft)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Schedule &rarr;
                    </button>

                    {confirmId === draft.id ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <button
                          onClick={() => handleDelete(draft.id)}
                          disabled={deletingId === draft.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
                        >
                          {deletingId === draft.id ? "..." : "Delete"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 rounded-lg border border-surface-border text-xs text-foreground-muted hover:text-foreground"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(draft.id)}
                        className="text-xs font-medium text-foreground-subtle hover:text-rose-600 transition-colors p-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}