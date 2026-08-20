"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import Link from "next/link";

export default function ReportsPage() {
  const router = useRouter();
  const [overviewReport, setOverviewReport] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Export animation states
  const [exporting, setExporting] = useState(false);
  const [exportStep, setExportStep] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchReportsData();
  }, []);

  async function fetchReportsData() {
    setLoading(true);
    setError("");
    try {
      const [overviewRes, comparisonsRes] = await Promise.all([
        api.get("/api/v1/reports/overview").catch(() => ({ data: null })),
        api.get("/api/v1/reports/comparison").catch(() => ({ data: [] })),
      ]);

      setOverviewReport(overviewRes.data);
      setComparisons(comparisonsRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load performance report summaries.");
    } finally {
      setLoading(false);
    }
  }

  async function triggerExport(reportType, format) {
    if (exporting) return;
    setError("");
    setExportSuccess("");
    setExporting(true);

    const steps = [
      "Connecting to data services...",
      "Querying analytics databases...",
      "Compiling metrics breakdown...",
      `Structuring ${format.toUpperCase()} layout...`,
      "Generating download package..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setExportStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    try {
      if (format === "csv") {
        // Direct download from backend CSV endpoint
        const response = await api.get(`/api/v1/reports/export/csv`, {
          params: { report_type: reportType },
          responseType: "blob"
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `socialpilot_${reportType}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Formatted JSON data file download
        const exportRes = await api.get("/api/v1/reports/export", { params: { report_type: reportType } });
        const dataToSave = exportRes.data || { overview: overviewReport, comparisons };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `socialpilot_${reportType}_report.${format === "excel" ? "json" : "json"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setExportSuccess(`Success! ${format.toUpperCase()} report generated and downloaded.`);
    } catch (err) {
      setError("Failed to export report data from server.");
    } finally {
      setExporting(false);
      setExportStep("");
    }
  }

  const getRatingBadge = (rating) => {
    switch (rating) {
      case "High Performer":
        return <span className="text-xxs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">🌟 High Performer</span>;
      case "Moderate":
        return <span className="text-xxs px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">⚡ Moderate</span>;
      case "Needs Optimization":
        return <span className="text-xxs px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">⚠️ Needs Optimization</span>;
      default:
        return <span className="text-xxs px-2.5 py-1 rounded-full font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">No Data</span>;
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Campaign Reports & ROI Analytics
            </h1>
            <p className="text-sm text-foreground-muted">
              Compare cross-campaign performance metrics, efficiency ratings, and export formal reports.
            </p>
          </div>
          <button
            onClick={() => triggerExport("campaigns", "csv")}
            disabled={exporting}
            className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm flex items-center gap-2"
          >
            <span>📥</span> Quick CSV Export
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl flex items-center gap-2 animate-in fade-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}
        {exportSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2 animate-in fade-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {exportSuccess}
          </div>
        )}

        {/* Loading Export Animation */}
        {exporting && (
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-brand-500/5 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
            <div className="relative w-12 h-12">
              <svg className="animate-spin w-full h-full text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{exportStep}</p>
              <p className="text-xs text-foreground-muted mt-1">Please keep this window open while the report compiles.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-background-secondary rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-96 bg-background-secondary rounded-3xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* Global Aggregate KPI Summary */}
            {overviewReport && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Total Posts Published</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{overviewReport.total_posts}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Active Campaigns</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{overviewReport.total_campaigns}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Audience Segments</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{overviewReport.total_audience_segments}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Global Impressions</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{overviewReport.total_impressions?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Campaign ROI & Performance Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ROI Comparison Bars */}
              <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Campaign ROI Efficiency Index</h3>
                  <p className="text-xs text-foreground-muted">Normalized 0-100 return score based on reach & engagement generated per budget dollar.</p>
                </div>

                {comparisons.length === 0 ? (
                  <div className="py-12 text-center text-sm text-foreground-muted">
                    No campaign comparison data available.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {comparisons.map((c) => {
                      const colors = {
                        "High Performer": "bg-emerald-500",
                        "Moderate": "bg-blue-500",
                        "Needs Optimization": "bg-amber-500",
                        "No Data": "bg-slate-400"
                      };
                      return (
                        <div key={c.campaign_id} className="space-y-2 p-4 rounded-2xl bg-surface/40 border border-surface-border">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <Link href={`/campaigns/${c.campaign_id}`} className="font-bold text-sm text-foreground hover:text-brand-600 transition-colors">
                                {c.campaign_name}
                              </Link>
                              <StatusBadge status={c.status} />
                              {getRatingBadge(c.performance_rating)}
                            </div>
                            <span className="text-xs font-bold text-foreground-subtle">
                              ROI Score: <span className="text-brand-600 font-extrabold text-sm">{c.roi_score}</span> / 100
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-background-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[c.performance_rating] || "bg-brand-500"} transition-all duration-500`}
                              style={{ width: `${Math.min(c.roi_score, 100)}%` }}
                            />
                          </div>

                          {/* Metrics strip */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xxs font-semibold text-foreground-muted">
                            <div>Budget: <span className="text-foreground font-bold">${c.budget?.toLocaleString()}</span></div>
                            <div>Reach: <span className="text-foreground font-bold">{c.total_reach?.toLocaleString()}</span></div>
                            <div>Engagements: <span className="text-foreground font-bold">{c.total_engagements?.toLocaleString()}</span></div>
                            <div>Cost/Engage: <span className="text-foreground font-bold">${c.cpe}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Export Hub Panel */}
              <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground mb-1">Export Center</h3>
                  <p className="text-xs text-foreground-muted mb-6">Generate standardized export files for stakeholder presentations.</p>
                  
                  <div className="space-y-4">
                    {/* CSV Full Campaign Report */}
                    <div className="p-4 border border-surface-border rounded-2xl bg-surface/30 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">Campaign Matrix Dataset (CSV)</p>
                        <p className="text-[11px] text-foreground-muted mt-0.5">Complete table with CPM, CPC, CPE, impressions, and ROI ratings.</p>
                      </div>
                      <button
                        onClick={() => triggerExport("campaigns", "csv")}
                        disabled={exporting}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span> Download CSV Report
                      </button>
                    </div>

                    {/* Global JSON Summary */}
                    <div className="p-4 border border-surface-border rounded-2xl bg-surface/30 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">Performance Summary Data (JSON)</p>
                        <p className="text-[11px] text-foreground-muted mt-0.5">Structured aggregate telemetry of audience, campaigns, and overall reach.</p>
                      </div>
                      <button
                        onClick={() => triggerExport("summary", "json")}
                        disabled={exporting}
                        className="w-full py-2 bg-background-secondary hover:bg-surface-border text-foreground text-xs font-bold rounded-xl active:scale-[0.98] transition-all border border-surface-border flex items-center justify-center gap-1.5"
                      >
                        <span>📄</span> Download JSON Schema
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 text-xxs text-foreground-muted">
                  💡 <span className="font-bold text-foreground">Pro-Tip:</span> CSV exports include calculated financial ratios (CPM, CPC, CPE) suitable for import into Excel, PowerBI, or Google Sheets.
                </div>
              </div>
            </div>

            {/* Comprehensive Comparison Data Table */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Campaign Comparison Breakdown</h3>
                  <p className="text-xs text-foreground-muted">Multi-dimensional table comparing key social ROI conversion metrics.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-surface-border text-foreground-muted uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-3">Campaign</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Budget</th>
                      <th className="py-3 px-3 text-right">Impressions</th>
                      <th className="py-3 px-3 text-right">Reach</th>
                      <th className="py-3 px-3 text-right">Engagements</th>
                      <th className="py-3 px-3 text-right">Eng. Rate</th>
                      <th className="py-3 px-3 text-right">CPM</th>
                      <th className="py-3 px-3 text-right">CPE</th>
                      <th className="py-3 px-3 text-center">ROI Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {comparisons.map((c) => (
                      <tr key={c.campaign_id} className="hover:bg-background-secondary/50 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">
                          <Link href={`/campaigns/${c.campaign_id}`} className="hover:text-brand-600 transition-colors">
                            {c.campaign_name}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">${c.budget?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold">{c.total_impressions?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold">{c.total_reach?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold">{c.total_engagements?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold">{c.avg_engagement_rate}%</td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground-muted">${c.cpm}</td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground-muted">${c.cpe}</td>
                        <td className="py-3 px-3 text-center">
                          {getRatingBadge(c.performance_rating)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
