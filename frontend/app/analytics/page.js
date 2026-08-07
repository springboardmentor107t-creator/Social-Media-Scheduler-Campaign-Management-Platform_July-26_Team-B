"use client";

import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import ChartWidget from "../../components/ChartWidget";
import { getAnalytics } from "../../lib/mockApi";
import { BarChart3, TrendingUp, Users, Download } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const analytics = await getAnalytics();
        setData(analytics);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            Interactive Analytics Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Measure performance, track audience growth, and analyze campaign ROI.
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-lg">Loading analytics data...</span>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top KPIs Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-brand-100">Total Engagement</h3>
                <TrendingUp className="w-5 h-5 text-brand-200" />
              </div>
              <p className="text-4xl font-bold mb-1">104.2K</p>
              <p className="text-sm text-brand-200">+12% from last month</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-blue-100">Audience Growth</h3>
                <Users className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-4xl font-bold mb-1">9,500</p>
              <p className="text-sm text-blue-200">+8.5% from last month</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-emerald-100">Average ROI</h3>
                <BarChart3 className="w-5 h-5 text-emerald-200" />
              </div>
              <p className="text-4xl font-bold mb-1">190%</p>
              <p className="text-sm text-emerald-200">Across 3 active campaigns</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="Engagement Over Time"
              subtitle="Daily likes, comments, and shares across all connected platforms."
              data={data.engagement}
              type="line"
              xAxisKey="date"
              lines={[
                { key: "likes", name: "Likes", color: "#6366f1" },
                { key: "comments", name: "Comments", color: "#f43f5e" },
                { key: "shares", name: "Shares", color: "#10b981" },
              ]}
            />
            <ChartWidget
              title="Audience Growth"
              subtitle="Total follower count across all platforms."
              data={data.audienceGrowth}
              type="line"
              xAxisKey="month"
              lines={[
                { key: "followers", name: "Total Followers", color: "#3b82f6" },
              ]}
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6">
            <ChartWidget
              title="Campaign ROI & Spend"
              subtitle="Comparison of budget spent vs. Return on Investment for recent campaigns."
              data={data.roi}
              type="bar"
              xAxisKey="name"
              bars={[
                { key: "spend", name: "Budget Spent ($)", color: "#94a3b8" },
                { key: "roi", name: "ROI (%)", color: "#10b981" },
              ]}
            />
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <p className="text-slate-500">Failed to load analytics data.</p>
        </div>
      )}
    </DashboardShell>
  );
}
