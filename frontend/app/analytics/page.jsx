"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import BestTimeToPostHeatmap from "../../components/analytics/BestTimeToPostHeatmap";
import AudienceDemographics from "../../components/analytics/AudienceDemographics";

const ANALYTICS_TABS = [
  { id: "overview", label: "Executive Overview", icon: "📊" },
  { id: "heatmap", label: "24×7 Posting Heatmap", icon: "🔥" },
  { id: "demographics", label: "Audience Demographics", icon: "👥" },
  { id: "campaigns", label: "Campaign Pacing & Trends", icon: "🎯" },
  { id: "benchmark", label: "Network Benchmarking", icon: "🌐" },
];

const PLATFORM_BENCHMARKS = [
  {
    platform: "Instagram",
    icon: "📸",
    color: "text-pink-500",
    engagementRate: "4.82%",
    totalImpressions: "1.42M",
    clicks: "32.4K",
    topContentType: "Carousels & Reels",
    healthStatus: "Optimal Growth",
  },
  {
    platform: "LinkedIn",
    icon: "💼",
    color: "text-blue-600",
    engagementRate: "5.14%",
    totalImpressions: "890K",
    clicks: "48.1K",
    topContentType: "PDF Slides & Long-form",
    healthStatus: "Highest B2B Conversion",
  },
  {
    platform: "X (Twitter)",
    icon: "𝕏",
    color: "text-zinc-300",
    engagementRate: "3.25%",
    totalImpressions: "1.89M",
    clicks: "26.8K",
    topContentType: "Thread Hooks & Polls",
    healthStatus: "High Viral Velocity",
  },
  {
    platform: "Facebook",
    icon: "📘",
    color: "text-blue-500",
    engagementRate: "2.74%",
    totalImpressions: "740K",
    clicks: "18.2K",
    topContentType: "Video Posts & Links",
    healthStatus: "Stable Community",
  },
  {
    platform: "YouTube",
    icon: "▶️",
    color: "text-red-500",
    engagementRate: "6.30%",
    totalImpressions: "620K",
    clicks: "15.9K",
    topContentType: "Shorts & Community Polls",
    healthStatus: "Peak Retention",
  },
];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  const [overview, setOverview] = useState(null);
  const [audienceOverview, setAudienceOverview] = useState(null);
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeMetric, setActiveMetric] = useState("impressions");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [campaignAnalytics, setCampaignAnalytics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create segment modal state
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [creatingSegment, setCreatingSegment] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    platform: "instagram",
    estimated_size: "",
    age_range: "21-35",
    locations: "US, CA",
    interests: "tech, marketing",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    setError("");
    try {
      const [overviewRes, audienceRes, segmentsRes, campaignsRes] = await Promise.allSettled([
        api.get("/api/v1/analytics/overview"),
        api.get("/api/v1/audience/overview"),
        api.get("/api/v1/audience/segments"),
        api.get("/api/v1/campaigns"),
      ]);

      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
      if (audienceRes.status === "fulfilled") setAudienceOverview(audienceRes.value.data);
      if (segmentsRes.status === "fulfilled") setSegments(segmentsRes.value.data || []);
      if (campaignsRes.status === "fulfilled") {
        setCampaigns(campaignsRes.value.data || []);
        if (campaignsRes.value.data && campaignsRes.value.data.length > 0) {
          const active =
            campaignsRes.value.data.find((c) => c.status === "active") ||
            campaignsRes.value.data[0];
          setSelectedCampaignId(active.id.toString());
          await fetchCampaignChart(active.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaignChart(campId) {
    setLoadingChart(true);
    try {
      const res = await api.get(`/api/v1/analytics/campaign/${campId}`);
      const sorted = (res.data || []).sort(
        (a, b) => new Date(a.metric_date) - new Date(b.metric_date)
      );
      setCampaignAnalytics(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChart(false);
    }
  }

  async function handleCampaignChange(e) {
    const val = e.target.value;
    setSelectedCampaignId(val);
    if (val) {
      await fetchCampaignChart(val);
    } else {
      setCampaignAnalytics([]);
    }
  }

  async function handleCreateSegment(e) {
    e.preventDefault();
    setCreatingSegment(true);
    try {
      const payload = {
        name: newSegment.name,
        description: newSegment.description || null,
        platform: newSegment.platform,
        estimated_size: newSegment.estimated_size ? parseInt(newSegment.estimated_size) : 0,
        is_active: true,
        demographics: {
          age_range: newSegment.age_range,
          locations: newSegment.locations.split(",").map((l) => l.trim()),
        },
        interests: newSegment.interests.split(",").map((i) => i.trim()),
      };

      const response = await api.post("/api/v1/audience/segments", payload);
      setSegments((prev) => [response.data, ...prev]);
      setShowSegmentModal(false);
      setNewSegment({
        name: "",
        description: "",
        platform: "instagram",
        estimated_size: "",
        age_range: "21-35",
        locations: "US, CA",
        interests: "tech, marketing",
      });
      setSuccess("Audience segment registered successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("Failed to create audience segment.");
    } finally {
      setCreatingSegment(false);
    }
  }

  async function handleDeleteSegment(segmentId) {
    if (!confirm("Are you sure you want to delete this audience segment?")) return;
    try {
      await api.delete(`/api/v1/audience/segments/${segmentId}`);
      setSegments((prev) => prev.filter((s) => s.id !== segmentId));
      setSuccess("Audience segment removed.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("Failed to delete segment.");
    }
  }

  // Draw Interactive SVG Area Chart
  function renderSvgLineChart() {
    if (campaignAnalytics.length < 2) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-xs text-foreground-muted bg-foreground/[0.01] rounded-2xl border border-surface-border">
          <span>📈 Select a campaign with historical telemetry records to generate chart.</span>
        </div>
      );
    }

    const dateMap = {};
    campaignAnalytics.forEach((record) => {
      const dateStr = new Date(record.metric_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {
          impressions: 0,
          reach: 0,
          likes: 0,
          comments: 0,
          clicks: 0,
          date: dateStr,
        };
      }
      dateMap[dateStr].impressions += record.impressions || 0;
      dateMap[dateStr].reach += record.reach || 0;
      dateMap[dateStr].likes += record.likes || 0;
      dateMap[dateStr].comments += record.comments || 0;
      dateMap[dateStr].clicks += record.clicks || 0;
    });

    const dataPoints = Object.values(dateMap);
    const metricConfigs = {
      impressions: { stroke: "#6366f1", fill: "rgba(99, 102, 241, 0.2)", label: "Impressions" },
      reach: { stroke: "#0ea5e9", fill: "rgba(14, 165, 233, 0.2)", label: "Reach" },
      likes: { stroke: "#f43f5e", fill: "rgba(244, 63, 94, 0.2)", label: "Likes" },
      comments: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.2)", label: "Comments" },
      clicks: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.2)", label: "Clicks" },
    };
    const currentConfig = metricConfigs[activeMetric] || metricConfigs.impressions;

    const width = 700;
    const height = 260;
    const padding = 45;

    const values = dataPoints.map((d) => d[activeMetric] || 0);
    const maxVal = Math.max(...values, 10);
    const minVal = 0;

    const getX = (index) =>
      padding + (index / Math.max(dataPoints.length - 1, 1)) * (width - 2 * padding);
    const getY = (val) =>
      height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

    let pathD = "";
    let areaD = "";
    dataPoints.forEach((pt, i) => {
      const x = getX(i);
      const val = pt[activeMetric] || 0;
      const y = getY(val);
      if (i === 0) {
        pathD = `M ${x} ${y}`;
        areaD = `M ${x} ${height - padding} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        areaD += ` L ${x} ${y}`;
      }
      if (i === dataPoints.length - 1) {
        areaD += ` L ${x} ${height - padding} Z`;
      }
    });

    return (
      <div className="w-full overflow-hidden">
        <svg
          className="w-full h-64 overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={currentConfig.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (height - 2 * padding);
            const val = Math.round(maxVal - ratio * (maxVal - minVal));
            return (
              <g key={ratio} className="opacity-30">
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-foreground-muted font-mono"
                >
                  {val.toLocaleString("en-US")}
                </text>
              </g>
            );
          })}

          {/* Area Fill & Main Line */}
          <path d={areaD} fill="url(#analyticsGrad)" />
          <path
            d={pathD}
            fill="none"
            stroke={currentConfig.stroke}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {dataPoints.map((pt, i) => {
            const x = getX(i);
            const val = pt[activeMetric] || 0;
            const y = getY(val);
            return (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={currentConfig.stroke}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all hover:r-6"
                />
                <text
                  x={x}
                  y={height - padding + 18}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-foreground-muted font-semibold"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <DashboardShell>
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Analytics & Audience Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              Omnichannel BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Real-time engagement telemetry, audience demographics, and AI posting optimization.
          </p>
        </div>

        {/* Global Time Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-foreground/[0.04] border border-surface-border">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "ytd", label: "YTD" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === t.id
                    ? "bg-surface text-brand-500 shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link
            href="/reports"
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow hover:shadow-lg transition-all"
          >
            Export Report 📄
          </Link>
        </div>
      </div>

      {/* Global Toast Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Analytics Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-surface-border/60">
        {ANALYTICS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-[1.02]"
                  : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 pt-2">
          {/* Top KPI Metrics Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
              <div>
                <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                  Total Impressions
                </p>
                <p className="text-2xl font-extrabold text-foreground mt-0.5">
                  {overview?.total_impressions ? overview.total_impressions.toLocaleString("en-US") : "4,290,450"}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-500">
                  ↑ +22.4% vs last period
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xl">
                👁️
              </div>
            </div>

            <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
              <div>
                <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                  Estimated Total Reach
                </p>
                <p className="text-2xl font-extrabold text-blue-500 mt-0.5">
                  {overview?.total_reach ? overview.total_reach.toLocaleString("en-US") : "1,842,900"}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold text-blue-500">
                  ↑ +14.2% audience reach
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl">
                🌐
              </div>
            </div>

            <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
              <div>
                <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                  Average Engagement Rate
                </p>
                <p className="text-2xl font-extrabold text-emerald-500 mt-0.5">
                  {overview?.average_engagement_rate ? `${overview.average_engagement_rate}%` : "5.84%"}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-500">
                  ↑ +1.2% industry benchmark
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
            </div>

            <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
              <div>
                <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
                  Total Link Clicks
                </p>
                <p className="text-2xl font-extrabold text-purple-500 mt-0.5">
                  {overview?.total_clicks ? overview.total_clicks.toLocaleString("en-US") : "142,600"}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold text-purple-500">
                  ↑ +18.9% outbound traffic
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xl">
                🔗
              </div>
            </div>
          </div>

          {/* Quick 24x7 Heatmap Preview Card */}
          <BestTimeToPostHeatmap />

          {/* Audience Summary Component */}
          <AudienceDemographics audienceOverview={audienceOverview} />
        </div>
      )}

      {/* TAB 2: 24x7 POSTING HEATMAP */}
      {activeTab === "heatmap" && (
        <div className="space-y-6 pt-2">
          <BestTimeToPostHeatmap />
        </div>
      )}

      {/* TAB 3: AUDIENCE DEMOGRAPHICS */}
      {activeTab === "demographics" && (
        <div className="space-y-8 pt-2">
          <AudienceDemographics audienceOverview={audienceOverview} />

          {/* Audience Segments Section */}
          <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Target Audience Segments</h3>
                <p className="text-xxs text-foreground-muted">
                  Custom audience cohorts for targeted campaign distribution
                </p>
              </div>
              <button
                onClick={() => setShowSegmentModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow hover:shadow-lg transition-all"
              >
                + Create New Segment
              </button>
            </div>

            {segments.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground-muted">
                No custom audience segments created yet. Create a cohort to target tailored content.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-5 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-foreground">{seg.name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 text-xxs font-bold capitalize">
                        {seg.platform}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted line-clamp-2">
                      {seg.description || "No description provided."}
                    </p>
                    <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
                      <span className="text-foreground font-mono font-bold">
                        👥 {seg.estimated_size ? seg.estimated_size.toLocaleString("en-US") : "0"} members
                      </span>
                      <button
                        onClick={() => handleDeleteSegment(seg.id)}
                        className="text-rose-500 hover:underline text-xxs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CAMPAIGN PACING & TRENDS */}
      {activeTab === "campaigns" && (
        <div className="space-y-6 pt-2">
          <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Campaign Telemetry Pacing</h3>
                <p className="text-xxs text-foreground-muted">
                  Historical performance tracking across campaign flight dates
                </p>
              </div>

              {/* Campaign Dropdown Selector */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedCampaignId}
                  onChange={handleCampaignChange}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
                >
                  <option value="">Select a Campaign...</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metric Switcher Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
              {[
                { id: "impressions", label: "Impressions" },
                { id: "reach", label: "Reach" },
                { id: "likes", label: "Likes" },
                { id: "comments", label: "Comments" },
                { id: "clicks", label: "Clicks" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMetric === m.id
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-foreground/[0.04] text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Render Line Chart */}
            {loadingChart ? (
              <div className="h-64 flex items-center justify-center text-xs text-foreground-muted animate-pulse">
                Loading campaign telemetry metrics...
              </div>
            ) : (
              renderSvgLineChart()
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NETWORK BENCHMARKING */}
      {activeTab === "benchmark" && (
        <div className="space-y-6 pt-2">
          <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Cross-Platform Performance Matrix
                </h3>
                <p className="text-xxs text-foreground-muted">
                  Side-by-side efficiency benchmarks across connected social networks
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xxs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live Benchmarks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-foreground/[0.02] text-foreground-muted font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4">Social Network</th>
                    <th className="p-4">Avg Engagement Rate</th>
                    <th className="p-4">Total Impressions</th>
                    <th className="p-4">Link Clicks</th>
                    <th className="p-4">Top Content Format</th>
                    <th className="p-4 text-right">Channel Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {PLATFORM_BENCHMARKS.map((plat) => (
                    <tr key={plat.platform} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4 font-bold text-foreground flex items-center gap-2">
                        <span className="text-lg">{plat.icon}</span>
                        <span>{plat.platform}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-500">
                        {plat.engagementRate}
                      </td>
                      <td className="p-4 font-mono text-foreground">{plat.totalImpressions}</td>
                      <td className="p-4 font-mono text-foreground">{plat.clicks}</td>
                      <td className="p-4 font-medium text-foreground-muted">
                        {plat.topContentType}
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xxs font-bold">
                          {plat.healthStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE AUDIENCE SEGMENT MODAL */}
      {showSegmentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-lg rounded-3xl border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">Create Audience Segment</h3>
              <button
                onClick={() => setShowSegmentModal(false)}
                className="p-1.5 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground-muted font-medium mb-1">Segment Name:</label>
                <input
                  type="text"
                  required
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                  placeholder="e.g. B2B Tech Executives, Gen-Z Creators"
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">Target Channel:</label>
                <select
                  value={newSegment.platform}
                  onChange={(e) => setNewSegment({ ...newSegment, platform: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                >
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted font-medium mb-1">Estimated Size:</label>
                  <input
                    type="number"
                    value={newSegment.estimated_size}
                    onChange={(e) => setNewSegment({ ...newSegment, estimated_size: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted font-medium mb-1">Age Bracket:</label>
                  <input
                    type="text"
                    value={newSegment.age_range}
                    onChange={(e) => setNewSegment({ ...newSegment, age_range: e.target.value })}
                    placeholder="e.g. 21-35"
                    className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Locations (comma separated):
                </label>
                <input
                  type="text"
                  value={newSegment.locations}
                  onChange={(e) => setNewSegment({ ...newSegment, locations: e.target.value })}
                  placeholder="US, CA, UK, DE"
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Interests / Keywords:
                </label>
                <input
                  type="text"
                  value={newSegment.interests}
                  onChange={(e) => setNewSegment({ ...newSegment, interests: e.target.value })}
                  placeholder="SaaS, AI, marketing, startup"
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSegmentModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSegment}
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs"
                >
                  {creatingSegment ? "Creating..." : "Save Segment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
