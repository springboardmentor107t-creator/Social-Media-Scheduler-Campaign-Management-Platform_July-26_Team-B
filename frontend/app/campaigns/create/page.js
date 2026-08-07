"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../../components/DashboardShell";
import { createCampaign } from "../../../lib/mockApi";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    budget: "",
    goal: "Brand Awareness",
    platforms: [],
  });

  const handlePlatformChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(value)
        ? prev.platforms.filter((p) => p !== value)
        : [...prev.platforms, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCampaign({
        ...formData,
        budget: Number(formData.budget) || 0,
      });
      router.push("/campaigns");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/campaigns"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Campaign
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set up a new marketing campaign and schedule your content.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Campaign Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Fall Collection Launch"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                required
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                End Date
              </label>
              <input
                required
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Budget (USD)
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="5000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Primary Goal
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
              >
                <option>Brand Awareness</option>
                <option>Lead Generation</option>
                <option>Increase Sales</option>
                <option>Community Engagement</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Target Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {["facebook", "instagram", "twitter", "linkedin", "tiktok"].map(
                (platform) => (
                  <label
                    key={platform}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition-colors ${
                      formData.platforms.includes(platform)
                        ? "bg-brand-50 dark:bg-brand-900/30 border-brand-500 text-brand-700 dark:text-brand-400"
                        : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      value={platform}
                      checked={formData.platforms.includes(platform)}
                      onChange={handlePlatformChange}
                    />
                    <span className="capitalize text-sm font-medium">
                      {platform}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-3">
            <Link
              href="/campaigns"
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || formData.platforms.length === 0}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-brand-500/20 active:scale-95"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Saving..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
