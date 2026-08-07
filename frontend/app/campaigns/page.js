"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import CampaignCard from "../../components/CampaignCard";
import { getCampaigns } from "../../lib/mockApi";
import { Plus } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to load campaigns", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campaign Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage all your marketing campaigns.
          </p>
        </div>
        <Link
          href="/campaigns/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-slate-500">
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="font-medium text-lg">Loading campaigns...</span>
          </div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No Campaigns Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Get started by creating your first marketing campaign.
          </p>
          <Link
            href="/campaigns/create"
            className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
