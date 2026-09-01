"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/skeletons";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "draft", label: "Draft" },
  { id: "paused", label: "Paused" },
  { id: "completed", label: "Completed" },
];

/**
 * Client-side helper to compute real-time timeline status for immediate UI feedback.
 */
export function resolveCampaignTimeline(camp) {
  const explicitStatus = (camp.status || "draft").toLowerCase();
  if (explicitStatus === "paused" || explicitStatus === "archived") {
    return {
      status: explicitStatus,
      badgeStatus: explicitStatus,
      progressPct: 0,
      label: explicitStatus === "paused" ? "Paused by User" : "Archived",
    };
  }

  const now = new Date().getTime();
  const start = camp.start_date ? new Date(camp.start_date).getTime() : null;
  let end = camp.end_date ? new Date(camp.end_date).getTime() : null;

  // Extend end date to 23:59:59 if time is not specified (midnight)
  if (end && camp.end_date && !camp.end_date.includes("T")) {
    end += 24 * 60 * 60 * 1000 - 1000;
  } else if (end && camp.end_date && camp.end_date.endsWith("T00:00:00Z")) {
    end += 24 * 60 * 60 * 1000 - 1000;
  }

  if (start && end) {
    if (now > end) {
      return {
        status: "completed",
        badgeStatus: "completed",
        progressPct: 100,
        label: "Campaign Completed",
      };
    } else if (now >= start) {
      const totalDuration = Math.max(1, end - start);
      const elapsed = Math.max(0, now - start);
      const pct = Math.min(100, Math.max(1, Math.round((elapsed / totalDuration) * 100)));
      const msLeft = end - now;
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return {
        status: "active",
        badgeStatus: "active",
        progressPct: pct,
        label: daysLeft <= 1 ? "Ends today / tomorrow" : `${daysLeft} days remaining`,
      };
    } else {
      const msUntilStart = start - now;
      const daysUntil = Math.ceil(msUntilStart / (1000 * 60 * 60 * 24));
      return {
        status: "upcoming",
        badgeStatus: "upcoming",
        progressPct: 0,
        label: daysUntil === 1 ? "Starts tomorrow" : `Starts in ${daysUntil} days`,
      };
    }
  } else if (start) {
    if (now >= start) {
      return {
        status: "active",
        badgeStatus: "active",
        progressPct: 50,
        label: "Running (Open-ended)",
      };
    } else {
      const msUntilStart = start - now;
      const daysUntil = Math.ceil(msUntilStart / (1000 * 60 * 60 * 24));
      return {
        status: "upcoming",
        badgeStatus: "upcoming",
        progressPct: 0,
        label: `Starts in ${daysUntil} days`,
      };
    }
  } else if (end) {
    if (now > end) {
      return {
        status: "completed",
        badgeStatus: "completed",
        progressPct: 100,
        label: "Campaign Concluded",
      };
    } else {
      return {
        status: "active",
        badgeStatus: "active",
        progressPct: 50,
        label: "Active until deadline",
      };
    }
  }

  return {
    status: explicitStatus,
    badgeStatus: explicitStatus,
    progressPct: 0,
    label: "Draft Planning",
  };
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Campaign Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    target_audience: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "auto", // 'auto' | 'draft' | 'active' | 'paused'
  });
  const [creating, setCreating] = useState(false);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/v1/campaigns");
      setCampaigns(response.data || []);
    } catch (err) {
      setError(
        err.friendlyMessage || "Failed to fetch campaigns. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Live status preview for the create modal
  const previewTimeline = useMemo(() => {
    return resolveCampaignTimeline({
      status: newCampaign.status === "auto" ? "draft" : newCampaign.status,
      start_date: newCampaign.start_date || null,
      end_date: newCampaign.end_date || null,
    });
  }, [newCampaign.status, newCampaign.start_date, newCampaign.end_date]);

  async function handleCreateCampaign(e) {
    e.preventDefault();
    setError("");

    if (newCampaign.start_date && newCampaign.end_date) {
      if (new Date(newCampaign.end_date) < new Date(newCampaign.start_date)) {
        setError("Campaign end date cannot be earlier than start date.");
        return;
      }
    }

    setCreating(true);
    try {
      // Calculate intended status: if 'auto', use computed timeline status
      const resolvedStatus =
        newCampaign.status === "auto"
          ? previewTimeline.status === "upcoming"
            ? "upcoming"
            : previewTimeline.status
          : newCampaign.status;

      const data = {
        name: newCampaign.name,
        description: newCampaign.description || null,
        target_audience: newCampaign.target_audience || null,
        budget: newCampaign.budget ? parseFloat(newCampaign.budget) : 0.0,
        start_date: newCampaign.start_date
          ? newCampaign.start_date + "T00:00:00Z"
          : null,
        end_date: newCampaign.end_date
          ? newCampaign.end_date + "T00:00:00Z"
          : null,
        status: resolvedStatus,
      };

      const response = await api.post("/api/v1/campaigns", data);
      setCampaigns((prev) => [response.data, ...prev]);
      setShowModal(false);
      setNewCampaign({
        name: "",
        description: "",
        target_audience: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "auto",
      });
      showToast(`Campaign "${response.data.name}" created (${response.data.status.toUpperCase()})!`);
    } catch (err) {
      setError(
        err.friendlyMessage || "Failed to create campaign. Please check fields."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleQuickStatusToggle(camp, newStatus, e) {
    e.stopPropagation();
    try {
      const response = await api.put(`/api/v1/campaigns/${camp.id}`, {
        status: newStatus,
      });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === camp.id ? response.data : c))
      );
      showToast(`Campaign status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.friendlyMessage || "Could not update campaign status.");
    }
  }

  async function handleDeleteCampaign(id, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await api.delete(`/api/v1/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showToast("Campaign deleted successfully.");
    } catch (err) {
      setError(err.friendlyMessage || "Failed to delete campaign.");
    }
  }

  // Count items per category for interactive badge numbers
  const filterCounts = useMemo(() => {
    const counts = { all: campaigns.length, active: 0, upcoming: 0, draft: 0, paused: 0, completed: 0 };
    campaigns.forEach((camp) => {
      const timeline = resolveCampaignTimeline(camp);
      const s = timeline.status;
      if (counts[s] !== undefined) {
        counts[s] += 1;
      }
    });
    return counts;
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter === "all") return true;
      const timeline = resolveCampaignTimeline(c);
      return timeline.status === statusFilter;
    });
  }, [campaigns, statusFilter]);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-foreground-subtle text-sm text-foreground";

  return (
    <DashboardShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 bg-emerald-600/90 text-white text-xs font-bold animate-in slide-in-from-top-4 duration-200 flex items-center gap-3 backdrop-blur-xl">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Marketing Campaigns & Strategy Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                Timeline Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Organize multi-channel content initiatives, monitor automated timelines, and track strategy ROI.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchCampaigns}
              type="button"
              className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer"
              title="Refresh & Recalculate Timeline Statuses"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin text-brand-500" : ""}`}
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
            <button
              onClick={() => {
                // Preset start date to today and end date to tomorrow for convenience
                const today = new Date().toISOString().split("T")[0];
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0];
                setNewCampaign({
                  name: "",
                  description: "",
                  target_audience: "",
                  budget: "",
                  start_date: today,
                  end_date: tomorrow,
                  status: "auto",
                });
                setShowModal(true);
              }}
              className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span> Create Campaign
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-between animate-in fade-in">
            <span className="font-semibold">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Filter Tabs with Live Item Counts */}
        <div className="flex gap-1.5 p-1 bg-foreground/[0.03] border border-surface-border rounded-2xl w-fit overflow-x-auto">
          {STATUS_FILTERS.map((tab) => {
            const isSelected = statusFilter === tab.id;
            const count = filterCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-surface-raised shadow-sm text-brand-600 dark:text-brand-400 border border-surface-border"
                    : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.02]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                      : "bg-foreground/[0.06] text-foreground-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Campaign List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            type="campaigns"
            title={
              statusFilter === "all"
                ? "No campaigns found"
                : `No ${statusFilter} campaigns found`
            }
            description={
              statusFilter === "all"
                ? "You haven't launched any marketing campaigns yet. Create your first campaign to schedule synchronized cross-channel posts."
                : `There are currently no campaigns categorized as ${statusFilter}. Launch or adjust timeline dates to populate this category.`
            }
            actionLabel="Create Campaign"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => {
              const timeline = resolveCampaignTimeline(camp);
              const isPaused = timeline.status === "paused";

              return (
                <div
                  key={camp.id}
                  onClick={() => router.push(`/campaigns/${camp.id}`)}
                  className="card-surface p-6 rounded-3xl border border-surface-border cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Card Top: Title & Dynamic Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-extrabold text-foreground tracking-tight line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {camp.name}
                      </h3>
                      <StatusBadge status={timeline.badgeStatus} />
                    </div>

                    <p className="text-xs text-foreground-muted line-clamp-2 mb-4 leading-relaxed">
                      {camp.description || "No strategic description provided."}
                    </p>

                    {/* Timeline Progress Bar (if active/running or completed) */}
                    {(camp.start_date || camp.end_date) && (
                      <div className="mb-4 p-3 rounded-2xl bg-foreground/[0.02] border border-surface-border">
                        <div className="flex items-center justify-between text-xxs font-bold mb-1.5">
                          <span className="text-foreground-muted">Timeline Status</span>
                          <span
                            className={`${
                              timeline.status === "active"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : timeline.status === "completed"
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {timeline.label}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              timeline.status === "completed"
                                ? "bg-purple-500"
                                : timeline.status === "active"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${timeline.progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-surface-border">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground-muted font-medium">Budget:</span>
                      <span className="font-extrabold text-foreground">
                        ${camp.budget?.toLocaleString("en-US") || "0"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground-muted font-medium">Audience:</span>
                      <span className="font-semibold text-foreground truncate max-w-[170px]">
                        {camp.target_audience || "General Audience"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground-muted font-medium">Timeline:</span>
                      <span className="font-mono text-xs font-semibold text-foreground-muted">
                        {camp.start_date
                          ? new Date(camp.start_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "TBD"}{" "}
                        -{" "}
                        {camp.end_date
                          ? new Date(camp.end_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "TBD"}
                      </span>
                    </div>

                    {/* Bottom Quick Controls */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-surface-border/60 text-xs">
                      <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:underline">
                        View Strategy &rarr;
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Pause / Activate toggle */}
                        {timeline.status === "active" && (
                          <button
                            onClick={(e) => handleQuickStatusToggle(camp, "paused", e)}
                            className="text-xxs font-bold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Pause active campaign"
                          >
                            Pause
                          </button>
                        )}
                        {isPaused && (
                          <button
                            onClick={(e) => handleQuickStatusToggle(camp, "active", e)}
                            className="text-xxs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Resume campaign"
                          >
                            Resume
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteCampaign(camp.id, e)}
                          className="text-xxs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Campaign with Live Timeline Preview */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowModal(false)}
          >
            <div
              className="card-surface w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted flex items-center justify-center cursor-pointer absolute top-5 right-5"
              >
                ✕
              </button>

              <span className="text-xxs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Campaign Strategy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1 text-foreground">
                Create New Campaign
              </h2>
              <p className="text-xs text-foreground-muted mb-5">
                Group and schedule multi-channel initiatives with automatic timeline status synchronization.
              </p>

              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, name: e.target.value })
                    }
                    className={inputClass}
                    placeholder="e.g. Q3 Summer Product Launch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Strategic Description
                  </label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        description: e.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                    rows={2}
                    placeholder="Campaign goals, key messaging, and target milestones..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Budget (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newCampaign.budget}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          budget: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="e.g. 2500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={newCampaign.target_audience}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          target_audience: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="e.g. SaaS Founders, B2B Leads"
                    />
                  </div>
                </div>

                {/* Timeline Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newCampaign.start_date}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          start_date: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      min={newCampaign.start_date}
                      value={newCampaign.end_date}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          end_date: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Initial Status Mode & Dynamic Timeline Preview Box */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Initial Status Configuration
                  </label>
                  <select
                    value={newCampaign.status}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        status: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="auto">
                      ⚡ Auto-Sync (Calculate dynamically based on dates)
                    </option>
                    <option value="draft">Draft (Planning)</option>
                    <option value="active">Active (Force Running)</option>
                    <option value="paused">Paused (Hold)</option>
                  </select>
                </div>

                {/* Live Timeline Status Evaluation Preview Card */}
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-surface-border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">Timeline Status Result</p>
                    <p className="text-xxs text-foreground-muted mt-0.5">
                      {newCampaign.status === "auto"
                        ? `Auto-determined based on timeline (${previewTimeline.label})`
                        : `Manually locked to ${newCampaign.status.toUpperCase()}`}
                    </p>
                  </div>
                  <StatusBadge
                    status={
                      newCampaign.status === "auto"
                        ? previewTimeline.badgeStatus
                        : newCampaign.status
                    }
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground-muted hover:bg-foreground/[0.04] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-brand text-white px-6 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-75 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    {creating ? "Launching Campaign..." : "Create Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
