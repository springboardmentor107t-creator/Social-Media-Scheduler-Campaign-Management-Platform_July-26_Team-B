"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "../../../components/DashboardShell";
import { getCampaignById } from "../../../lib/mockApi";
import { ArrowLeft, Target, Calendar, DollarSign, Activity, Users, TrendingUp } from "lucide-react";

export default function CampaignTrackingPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const data = await getCampaignById(id);
        setCampaign(data);
      } catch (error) {
        console.error("Failed to load campaign", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadCampaign();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
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
            <span className="font-medium text-lg">Loading tracking data...</span>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!campaign) {
    return (
      <DashboardShell>
        <div className="text-center p-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Campaign Not Found
          </h2>
          <Link href="/campaigns" className="text-brand-600 hover:underline">
            Return to Campaigns
          </Link>
        </div>
      </DashboardShell>
    );
  }

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
            {campaign.name}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 capitalize border border-slate-200 dark:border-zinc-700">
              {campaign.status}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> {campaign.goal}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
            <Calendar className="w-5 h-5 text-brand-500" />
            <h3 className="font-medium text-sm">Duration</h3>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {campaign.startDate} to {campaign.endDate}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-sm">Budget Spent</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${campaign.spent.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ ${campaign.budget.toLocaleString()}</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-sm">Total Engagement</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {campaign.engagement.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-sm">Conversions</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {campaign.conversions.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Performance Tracking</h3>
          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700">
            <p className="text-slate-500 text-sm">Detailed charts will appear in the Analytics section.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Platforms & Reach</h3>
          <div className="space-y-4">
            {campaign.platforms.map((platform) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                  {platform}
                </span>
                <span className="text-sm text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Return on Investment</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">{campaign.roi}%</span>
              <span className="text-sm font-medium text-slate-500 pb-1">overall</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
