"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";

export default function AnalyticsPage() {
 const router = useRouter();
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

 // Create segment state
 const [showSegmentModal, setShowSegmentModal] = useState(false);
 const [creatingSegment, setCreatingSegment] = useState(false);
 const [newSegment, setNewSegment] = useState({
 name: "",
 description: "",
 platform: "instagram",
 estimated_size: "",
 age_range: "21-35",
 locations: "US, CA",
 interests: "tech, marketing"
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
 const [overviewRes, audienceRes, segmentsRes, campaignsRes] = await Promise.all([
 api.get("/api/v1/analytics/overview").catch(() => ({ data: null })),
 api.get("/api/v1/audience/overview").catch(() => ({ data: null })),
 api.get("/api/v1/audience/segments").catch(() => ({ data: [] })),
 api.get("/api/v1/campaigns").catch(() => ({ data: [] })),
 ]);

 setOverview(overviewRes.data);
 setAudienceOverview(audienceRes.data);
 setSegments(segmentsRes.data || []);
 setCampaigns(campaignsRes.data || []);

 // If campaigns exist, auto-select the first active campaign to load charts
 if (campaignsRes.data && campaignsRes.data.length > 0) {
 const active = campaignsRes.data.find(c => c.status === "active") || campaignsRes.data[0];
 setSelectedCampaignId(active.id.toString());
 await fetchCampaignChart(active.id);
 }
 } catch (err) {
 console.error(err);
 setError("Failed to load analytics dashboard.");
 } finally {
 setLoading(false);
 }
 }

 async function fetchCampaignChart(campId) {
 setLoadingChart(true);
 try {
 const res = await api.get(`/api/v1/analytics/campaign/${campId}`);
 // Sort chronologically by date
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
 setError("");
 setSuccess("");
 setCreatingSegment(true);

 try {
 const interestsArray = newSegment.interests
 ? newSegment.interests.split(",").map(i => i.trim()).filter(Boolean)
 : [];
 const locationsArray = newSegment.locations
 ? newSegment.locations.split(",").map(l => l.trim()).filter(Boolean)
 : [];

 const payload = {
 name: newSegment.name,
 description: newSegment.description || null,
 platform: newSegment.platform,
 estimated_size: newSegment.estimated_size ? parseInt(newSegment.estimated_size) : 0,
 is_active: true,
 demographics: {
 age_range: newSegment.age_range,
 locations: locationsArray
 },
 interests: interestsArray
 };

 const response = await api.post("/api/v1/audience/segments", payload);
 setSegments(prev => [response.data, ...prev]);
 setShowSegmentModal(false);
 setNewSegment({
 name: "",
 description: "",
 platform: "instagram",
 estimated_size: "",
 age_range: "21-35",
 locations: "US, CA",
 interests: "tech, marketing"
 });
 setSuccess("Audience segment created successfully!");
 } catch (err) {
 setError("Failed to create audience segment.");
 } finally {
 setCreatingSegment(false);
 }
 }

 async function handleDeleteSegment(segmentId) {
 if (!confirm("Are you sure you want to delete this audience segment?")) return;
 setError("");
 setSuccess("");
 try {
 await api.delete(`/api/v1/audience/segments/${segmentId}`);
 setSegments(prev => prev.filter(s => s.id !== segmentId));
 setSuccess("Audience segment deleted.");
 } catch (err) {
 setError("Failed to delete segment.");
 }
 }

 // Draw Line Chart helper using raw SVGs for active metric
 function renderSvgLineChart() {
 if (campaignAnalytics.length < 2) {
 return (
 <div className="h-60 flex items-center justify-center text-xs text-foreground-muted">
 Not enough historical metrics to render chart.
 </div>
 );
 }

 // Group metrics by date (aggregating platforms on the same date)
 const dateMap = {};
 campaignAnalytics.forEach((record) => {
 const dateStr = new Date(record.metric_date).toLocaleDateString(undefined, {
 month: "short",
 day: "numeric",
 });
 if (!dateMap[dateStr]) {
 dateMap[dateStr] = { impressions: 0, reach: 0, likes: 0, comments: 0, clicks: 0, date: dateStr };
 }
 dateMap[dateStr].impressions += record.impressions || 0;
 dateMap[dateStr].reach += record.reach || 0;
 dateMap[dateStr].likes += record.likes || 0;
 dateMap[dateStr].comments += record.comments || 0;
 dateMap[dateStr].clicks += record.clicks || 0;
 });

 const dataPoints = Object.values(dateMap);
 const metricConfigs = {
 impressions: { stroke: "#6366f1", label: "Impressions" },
 reach: { stroke: "#0ea5e9", label: "Reach" },
 likes: { stroke: "#f43f5e", label: "Likes" },
 comments: { stroke: "#f59e0b", label: "Comments" },
 clicks: { stroke: "#10b981", label: "Clicks" },
 };
 const currentConfig = metricConfigs[activeMetric] || metricConfigs.impressions;

 const width = 600;
 const height = 240;
 const padding = 40;

 const values = dataPoints.map(d => d[activeMetric] || 0);
 const maxVal = Math.max(...values, 10);
 const minVal = 0;

 const getX = (index) => padding + (index / Math.max(dataPoints.length - 1, 1)) * (width - 2 * padding);
 const getY = (val) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

 // Build SVG Path
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
 <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
 <defs>
 <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={currentConfig.stroke} stopOpacity="0.35" />
 <stop offset="100%" stopColor={currentConfig.stroke} stopOpacity="0.0" />
 </linearGradient>
 </defs>

 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
 const y = padding + ratio * (height - 2 * padding);
 const val = Math.round(maxVal - ratio * (maxVal - minVal));
 return (
 <g key={ratio} className="opacity-40">
 <line
 x1={padding}
 y1={y}
 x2={width - padding}
 y2={y}
 stroke="#94a3b8"
 strokeWidth={1}
 strokeDasharray="4 4"
 />
 <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[10px] font-medium fill-slate-400">
 {val.toLocaleString()}
 </text>
 </g>
 );
 })}

 {/* Shaded Area */}
 <path d={areaD} fill="url(#chartGrad)" />

 {/* Line */}
 <path d={pathD} fill="none" stroke={currentConfig.stroke} strokeWidth={3} strokeLinecap="round" />

 {/* Dots */}
 {dataPoints.map((pt, i) => {
 const val = pt[activeMetric] || 0;
 return (
 <circle
 key={i}
 cx={getX(i)}
 cy={getY(val)}
 r={4}
 fill="#ffffff"
 stroke={currentConfig.stroke}
 strokeWidth={2.5}
 className="hover:r-6 cursor-pointer transition-all"
 >
 <title>{`${pt.date}: ${val.toLocaleString()} ${currentConfig.label}`}</title>
 </circle>
 );
 })}

 {/* X Axis Labels */}
 {dataPoints.map((pt, i) => {
 if (dataPoints.length > 8 && i % 2 !== 0) return null;
 return (
 <text
 key={i}
 x={getX(i)}
 y={height - padding + 18}
 textAnchor="middle"
 className="text-[10px] font-semibold fill-slate-400"
 >
 {pt.date}
 </text>
 );
 })}
 </svg>
 );
 }

 const inputClass =
 "w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-foreground-muted text-sm";

 return (
 <DashboardShell>
 <div className="space-y-6">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground ">
 Analytics & Audience
 </h1>
 <p className="text-sm text-foreground-muted ">
 Track multi-channel social performance and manage audience demographics.
 </p>
 </div>
 <button
 onClick={() => setShowSegmentModal(true)}
 className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm"
 >
 + New Audience Segment
 </button>
 </div>

 {/* Alerts */}
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl flex items-center gap-2">
 {error}
 </div>
 )}
 {success && (
 <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2">
 {success}
 </div>
 )}

 {loading ? (
 <div className="space-y-6">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-background-secondary rounded-2xl animate-pulse" />)}
 </div>
 <div className="h-80 bg-background-secondary rounded-3xl animate-pulse" />
 </div>
 ) : (
 <>
 {/* Overview cards */}
 {overview && (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="glass-panel p-5 rounded-2xl">
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Total Impressions</p>
 <p className="text-2xl font-bold text-foreground mt-1">{overview.total_impressions?.toLocaleString()}</p>
 </div>
 <div className="glass-panel p-5 rounded-2xl">
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Total Reach</p>
 <p className="text-2xl font-bold text-foreground mt-1">{overview.total_reach?.toLocaleString()}</p>
 </div>
 <div className="glass-panel p-5 rounded-2xl">
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Engagement Actions</p>
 <p className="text-2xl font-bold text-foreground mt-1">{(overview.total_likes + overview.total_comments + overview.total_shares + overview.total_clicks)?.toLocaleString()}</p>
 </div>
 <div className="glass-panel p-5 rounded-2xl">
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Avg. Engagement Rate</p>
 <p className="text-2xl font-bold text-foreground mt-1">{overview.avg_engagement_rate}%</p>
 </div>
 </div>
 )}

 {/* Chart Area */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Line Graph */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">Timeline Performance</h3>
                <p className="text-xs text-foreground-muted mt-0.5">Historical metric trend analysis across campaign lifecycle</p>
              </div>
              <select
                value={selectedCampaignId}
                onChange={handleCampaignChange}
                className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface text-xs font-semibold focus:outline-none"
              >
                <option value="">-- Choose Campaign --</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-background-secondary border border-surface-border rounded-xl w-fit">
              {[
                { id: "impressions", label: "Impressions", color: "text-indigo-600" },
                { id: "reach", label: "Reach", color: "text-sky-600" },
                { id: "likes", label: "Likes", color: "text-rose-600" },
                { id: "comments", label: "Comments", color: "text-amber-600" },
                { id: "clicks", label: "Clicks", color: "text-emerald-600" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    activeMetric === m.id
                      ? "bg-surface-raised shadow-sm font-bold " + m.color
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

 <div className="h-64 relative bg-surface/30 rounded-2xl p-2 border border-surface-border/20 ">
 {loadingChart ? (
 <div className="absolute inset-0 flex items-center justify-center">
 <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 </div>
 ) : (
 renderSvgLineChart()
 )}
 </div>
 </div>

 {/* Platform Breakdown */}
 <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-1">Platform Share</h3>
 <p className="text-xs text-foreground-muted mb-6">Distribution of campaign impressions by network</p>
 </div>

 {overview && Object.keys(overview.platform_breakdown).length > 0 ? (
 <div className="space-y-4">
 {Object.entries(overview.platform_breakdown).map(([platform, data]) => {
 const totalImp = Object.values(overview.platform_breakdown).reduce((acc, curr) => acc + (curr.impressions || 0), 0) || 1;
 const percent = Math.round((data.impressions / totalImp) * 100);
 const barColors = {
 instagram: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
 facebook: "bg-blue-600",
 linkedin: "bg-blue-700",
 twitter: "bg-sky-500",
 };
 return (
 <div key={platform} className="space-y-1.5">
 <div className="flex justify-between items-center text-xs font-semibold">
 <span className="capitalize">{platform}</span>
 <span className="text-foreground-muted">{percent}% ({data.impressions.toLocaleString()} views)</span>
 </div>
 <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden">
 <div
 className={`h-full ${barColors[platform] || "bg-background-secondary"}`}
 style={{ width: `${percent}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-foreground-muted text-center py-10">No platform breakdown data available.</p>
 )}
 </div>
 </div>

 {/* Audience Overview & Segmentation */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Audience Growth Summary */}
 {audienceOverview && (
 <div className="lg:col-span-1 glass-panel p-6 rounded-3xl space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">Audience Growth</h3>
 <p className="text-xs text-foreground-muted">General network growth statistics</p>

 <div className="grid grid-cols-2 gap-4 pt-2">
 <div className="p-4 rounded-xl bg-surface/40 border border-surface-border text-center">
 <p className="text-xs font-bold text-foreground-muted uppercase">Estimated Reach</p>
 <p className="text-xl font-bold text-foreground mt-1">{audienceOverview.total_estimated_reach?.toLocaleString()}</p>
 </div>
 <div className="p-4 rounded-xl bg-surface/40 border border-surface-border text-center">
 <p className="text-xs font-bold text-foreground-muted uppercase">Active Segments</p>
 <p className="text-xl font-bold text-foreground mt-1">{audienceOverview.active_segments} / {audienceOverview.total_segments}</p>
 </div>
 </div>

 <div className="space-y-3 pt-4 border-t border-divider ">
 <p className="text-xxs font-bold text-foreground-muted uppercase">Segments by Primary Channel</p>
 <div className="grid grid-cols-2 gap-2 text-xs">
 {Object.entries(audienceOverview.segments_by_platform).map(([p, count]) => (
 <div key={p} className="flex justify-between items-center py-1 border-b border-surface-border/10 font-semibold">
 <span className="capitalize">{p}</span>
 <span className="text-foreground-muted">{count} segments</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Segment CRUD */}
 <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">Audience Segmentation</h3>
 <p className="text-xs text-foreground-muted">Divide followers into targeted customer segments to post matching campaigns.</p>

 {segments.length === 0 ? (
 <div className="py-8 text-center border border-dashed border-surface-border rounded-2xl">
 <p className="text-xs text-foreground-muted">No audience segments defined.</p>
 </div>
 ) : (
 <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
 {segments.map((seg) => (
 <div
 key={seg.id}
 className="flex items-center justify-between gap-4 p-3.5 border border-surface-border rounded-xl bg-surface/40 "
 >
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-bold text-foreground ">{seg.name}</h4>
 <span className="text-xxs px-2 py-0.5 bg-background-secondary text-foreground-muted font-bold rounded-full capitalize">{seg.platform}</span>
 </div>
 <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">{seg.description || "No description."}</p>
 <p className="text-xxs text-foreground-muted font-bold mt-1 uppercase">
 Size: <span className="text-foreground font-extrabold">{seg.estimated_size?.toLocaleString()}</span> | Interests: <span className="text-foreground font-extrabold">{seg.interests?.join(", ")}</span>
 </p>
 </div>
 <button
 onClick={() => handleDeleteSegment(seg.id)}
 className="text-xs text-red-500 font-semibold hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
 >
 Delete
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </>
 )}

 {/* Modal: New Segment */}
 {showSegmentModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
 <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-surface shadow-2xl relative" onClick={e => e.stopPropagation()}>
 <button
 onClick={() => setShowSegmentModal(false)}
 className="absolute top-4 right-4 text-foreground-muted hover:text-foreground-subtle text-lg"
 >
 ✕
 </button>
 <h2 className="text-xl font-bold mb-1 tracking-tight">New Audience Segment</h2>
 <p className="text-xs text-foreground-muted mb-6">Define a targeted user profile demographics for campaign coordination.</p>

 <form onSubmit={handleCreateSegment} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Segment Name
 </label>
 <input
 type="text"
 required
 value={newSegment.name}
 onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
 className={inputClass}
 placeholder="e.g. US Tech Buyers"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Description
 </label>
 <textarea
 value={newSegment.description}
 onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
 className={inputClass + " resize-none"}
 rows={2}
 placeholder="Define who belongs in this segment..."
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Platform Focus
 </label>
 <select
 value={newSegment.platform}
 onChange={(e) => setNewSegment({ ...newSegment, platform: e.target.value })}
 className={inputClass}
 >
 <option value="instagram">Instagram</option>
 <option value="facebook">Facebook</option>
 <option value="linkedin">LinkedIn</option>
 <option value="twitter">X (Twitter)</option>
 <option value="all">All Platforms</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Estimated Size
 </label>
 <input
 type="number"
 value={newSegment.estimated_size}
 onChange={(e) => setNewSegment({ ...newSegment, estimated_size: e.target.value })}
 className={inputClass}
 placeholder="e.g. 25000"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Age Range
 </label>
 <input
 type="text"
 value={newSegment.age_range}
 onChange={(e) => setNewSegment({ ...newSegment, age_range: e.target.value })}
 className={inputClass}
 placeholder="e.g. 21-35"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Locations (comma-separated)
 </label>
 <input
 type="text"
 value={newSegment.locations}
 onChange={(e) => setNewSegment({ ...newSegment, locations: e.target.value })}
 className={inputClass}
 placeholder="e.g. US, CA, UK"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Interests (comma-separated)
 </label>
 <input
 type="text"
 value={newSegment.interests}
 onChange={(e) => setNewSegment({ ...newSegment, interests: e.target.value })}
 className={inputClass}
 placeholder="e.g. software, saas, growth"
 />
 </div>

 <div className="pt-4 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setShowSegmentModal(false)}
 className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground-muted hover:bg-background-secondary transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={creatingSegment}
 className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-75"
 >
 {creatingSegment ? "Creating..." : "Create Segment"}
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
