"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/skeletons";

const STATUS_FILTERS = ["all", "active", "draft", "paused", "completed"];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    status: "draft",
  });
  const [creating, setCreating] = useState(false);

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
        status: newCampaign.status,
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
        status: "draft",
      });
    } catch (err) {
      setError(
        err.friendlyMessage || "Failed to create campaign. Please check fields."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCampaign(id, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await api.delete(`/api/v1/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.friendlyMessage || "Failed to delete campaign.");
    }
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter === "all") return true;
    return (c.status || "").toLowerCase() === statusFilter.toLowerCase();
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-foreground-subtle text-sm text-foreground";

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Marketing Campaigns & Strategy Hub
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Organize multi-channel content initiatives, monitor timelines, and track budget utilization.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchCampaigns}
              type="button"
              className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer"
              title="Refresh Campaigns"
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
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all text-sm cursor-pointer"
            >
              + Create Campaign
            </button>
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

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-foreground/[0.03] border border-surface-border rounded-2xl w-fit overflow-x-auto">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-surface-raised shadow-sm text-brand-600"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Campaign List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            type="campaigns"
            title="No campaigns found"
            description="You haven't created any campaigns matching this filter. Launch your first marketing campaign to get started."
            actionLabel="Create Campaign"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                onClick={() => router.push(`/campaigns/${camp.id}`)}
                className="card-surface p-6 rounded-3xl border cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {camp.name}
                    </h3>
                    <StatusBadge status={camp.status} />
                  </div>
                  <p className="text-xs text-foreground-muted line-clamp-2 mb-4 leading-relaxed">
                    {camp.description || "No strategic description provided."}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-surface-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-subtle font-medium">Budget:</span>
                    <span className="font-bold text-foreground">
                      ${camp.budget?.toLocaleString("en-US") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-subtle font-medium">Audience:</span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {camp.target_audience || "General Audience"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-subtle font-medium">Timeline:</span>
                    <span className="font-mono text-xs text-foreground-subtle">
                      {camp.start_date
                        ? new Date(camp.start_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )
                        : "TBD"}{" "}
                      -{" "}
                      {camp.end_date
                        ? new Date(camp.end_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/60">
                    <span className="text-xs font-semibold text-brand-600 group-hover:underline">
                      View Details &rarr;
                    </span>
                    <button
                      onClick={(e) => handleDeleteCampaign(camp.id, e)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Campaign */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowModal(false)}
          >
            <div
              className="card-surface w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-foreground-subtle hover:text-foreground text-lg"
              >
                ✕
              </button>

              <h2 className="text-xl font-extrabold tracking-tight mb-1 text-foreground">
                Create New Campaign
              </h2>
              <p className="text-xs text-foreground-muted mb-6">
                Group and schedule thematic posts across multiple social channels.
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
                    placeholder="Campaign goals, key messaging, and desired outcomes..."
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
                      placeholder="e.g. 5000"
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
                      placeholder="e.g. SaaS Founders"
                    />
                  </div>
                </div>

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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Initial Status
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
                    <option value="draft">Draft (Planning)</option>
                    <option value="active">Active (Running)</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground-muted hover:bg-foreground/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-75 shadow-md cursor-pointer"
                  >
                    {creating ? "Creating Campaign..." : "Create Campaign"}
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
