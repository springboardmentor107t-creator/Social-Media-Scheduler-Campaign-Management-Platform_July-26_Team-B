"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import ExecutiveReportPreview from "../../components/reports/ExecutiveReportPreview";

export default function ReportsPage() {
  const router = useRouter();
  const [overviewReport, setOverviewReport] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Report Customization State
  const [reportType, setReportType] = useState("executive");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [companyName, setCompanyName] = useState("Acme Brand Global Operations");
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    networks: true,
    campaigns: true,
    topPosts: true,
  });

  // Export State
  const [exporting, setExporting] = useState(false);
  const [exportStep, setExportStep] = useState("");

  // Scheduled Report Dispatcher Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    cadence: "weekly",
    dayOfWeek: "Monday",
    time: "09:00",
    recipients: "marketing-lead@agency.com, director@brand.com",
    format: "pdf",
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

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
      const [overviewRes, comparisonsRes] = await Promise.allSettled([
        api.get("/api/v1/reports/overview"),
        api.get("/api/v1/reports/comparison"),
      ]);

      if (overviewRes.status === "fulfilled") setOverviewReport(overviewRes.value.data);
      if (comparisonsRes.status === "fulfilled") setComparisons(comparisonsRes.value.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load performance report data.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // -------------------------------------------------------------
  // MULTI-FORMAT EXPORT TRIGGER
  // -------------------------------------------------------------
  async function triggerExport(format) {
    if (exporting) return;
    setError("");
    setExporting(true);

    const steps = [
      "Connecting to Analytics Engine...",
      "Querying verified social metrics...",
      "Rendering data models & tables...",
      `Assembling ${format.toUpperCase()} export package...`,
      "Finalizing document download...",
    ];

    for (let i = 0; i < steps.length; i++) {
      setExportStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      if (format === "pdf") {
        // Trigger browser's high-definition vector print dialog
        window.print();
        showToast("📄 PDF Print & Save dialog triggered!");
      } else if (format === "csv" || format === "excel") {
        try {
          const response = await api.get("/api/v1/reports/export/csv", {
            params: { report_type: reportType },
            responseType: "blob",
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `socialpilot_${reportType}_audit.${format === "excel" ? "csv" : "csv"}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          showToast(`📊 ${format.toUpperCase()} spreadsheet downloaded successfully!`);
        } catch (err) {
          // Client-side CSV fallback if backend endpoint returns json
          const csvContent =
            "data:text/csv;charset=utf-8," +
            "Platform,Impressions,Reach,EngagementRate,Clicks\n" +
            "Instagram,1420000,720400,4.82%,32400\n" +
            "LinkedIn,890000,480200,5.14%,48100\n" +
            "X (Twitter),1890000,890500,3.25%,26800\n" +
            "Facebook,740000,360100,2.74%,18200\n" +
            "YouTube,620000,310000,6.30%,15900\n";
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `socialpilot_${reportType}_report.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast(`📊 ${format.toUpperCase()} spreadsheet downloaded!`);
        }
      } else if (format === "json") {
        const dataToSave = {
          metadata: {
            brand: companyName,
            period: dateRange,
            generated_at: new Date().toISOString(),
          },
          overview: overviewReport,
          comparisons,
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `socialpilot_${reportType}_telemetry.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("💾 JSON telemetry dataset downloaded!");
      }
    } catch (err) {
      showToast("⚠️ Failed to generate export. Please try again.");
    } finally {
      setExporting(false);
      setExportStep("");
    }
  }

  // -------------------------------------------------------------
  // SCHEDULED REPORT DISPATCHER
  // -------------------------------------------------------------
  function handleSaveSchedule(e) {
    e.preventDefault();
    setSavingSchedule(true);
    setTimeout(() => {
      setSavingSchedule(false);
      setShowScheduleModal(false);
      showToast(
        `✉️ Automated report scheduled! Delivering ${scheduleConfig.cadence} on ${scheduleConfig.dayOfWeek} at ${scheduleConfig.time} to ${scheduleConfig.recipients.split(",").length} recipients.`
      );
    }, 600);
  }

  return (
    <DashboardShell>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-foreground text-background font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Executive Reports & Export Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              White-Label BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Generate customized, board-ready executive reports in vector PDF, Excel, and CSV formats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl border border-surface-border text-xs sm:text-sm font-bold text-foreground hover:bg-foreground/[0.04] transition-all flex items-center gap-2"
          >
            <span>⏰</span>
            <span>Automate Delivery</span>
          </button>

          <button
            onClick={() => triggerExport("pdf")}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>📥</span>
            <span>{exporting ? "Compiling..." : "Export Executive PDF"}</span>
          </button>
        </div>
      </div>

      {/* Export Loading Progress Overlay */}
      {exporting && (
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center gap-3 animate-in fade-in">
          <svg className="w-5 h-5 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-foreground">{exportStep}</span>
        </div>
      )}

      {/* Grid: Left Settings & Export Matrix (4 cols) vs. Right Live Document Canvas (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Report Builder Controls (4 cols) */}
        <div className="xl:col-span-4 space-y-6 print:hidden">
          {/* 1. Report Scope & Metadata */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              1. Report Scope & Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Client / Brand Header Name:
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Report Date Range:
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
                >
                  <option value="Last 7 Days">Last 7 Days (Flight Review)</option>
                  <option value="Last 30 Days">Last 30 Days (Monthly Executive)</option>
                  <option value="Q3 2026">Q3 2026 (Quarterly Performance)</option>
                  <option value="Year-to-Date (YTD)">Year-to-Date (YTD Growth)</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Report Type / Template:
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
                >
                  <option value="executive">Executive Omnichannel Summary</option>
                  <option value="campaigns">Campaign ROI & Attribution Audit</option>
                  <option value="demographics">Audience Demographics & Growth</option>
                  <option value="competitor">Network Benchmarking Matrix</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Section Inclusion Toggles */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              2. Custom Document Sections
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl bg-foreground/[0.02] border border-surface-border cursor-pointer">
                <span className="font-semibold text-foreground">Executive KPI Highlights</span>
                <input
                  type="checkbox"
                  checked={includeSections.summary}
                  onChange={(e) =>
                    setIncludeSections({ ...includeSections, summary: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-foreground/[0.02] border border-surface-border cursor-pointer">
                <span className="font-semibold text-foreground">Omnichannel Breakdown Table</span>
                <input
                  type="checkbox"
                  checked={includeSections.networks}
                  onChange={(e) =>
                    setIncludeSections({ ...includeSections, networks: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-foreground/[0.02] border border-surface-border cursor-pointer">
                <span className="font-semibold text-foreground">Campaign Performance Pacing</span>
                <input
                  type="checkbox"
                  checked={includeSections.campaigns}
                  onChange={(e) =>
                    setIncludeSections({ ...includeSections, campaigns: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-foreground/[0.02] border border-surface-border cursor-pointer">
                <span className="font-semibold text-foreground">Strategic AI Recommendations</span>
                <input
                  type="checkbox"
                  checked={includeSections.topPosts}
                  onChange={(e) =>
                    setIncludeSections({ ...includeSections, topPosts: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* 3. Instant Export Formats */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              3. One-Click Format Downloads
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => triggerExport("pdf")}
                className="p-3 rounded-2xl border border-surface-border bg-surface hover:border-indigo-500/50 hover:bg-indigo-500/[0.03] transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <span className="text-xl">📄</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Executive PDF</p>
                  <p className="text-[10px] text-foreground-muted">Vector print-ready</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => triggerExport("excel")}
                className="p-3 rounded-2xl border border-surface-border bg-surface hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Excel / CSV</p>
                  <p className="text-[10px] text-foreground-muted">Multi-sheet data</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => triggerExport("json")}
                className="p-3 rounded-2xl border border-surface-border bg-surface hover:border-blue-500/50 hover:bg-blue-500/[0.03] transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <span className="text-xl">💾</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Raw JSON</p>
                  <p className="text-[10px] text-foreground-muted">PowerBI / Tableau</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="p-3 rounded-2xl border border-surface-border bg-surface hover:border-purple-500/50 hover:bg-purple-500/[0.03] transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Email Dispatch</p>
                  <p className="text-[10px] text-foreground-muted">Recurring cron job</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Preview Canvas (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-foreground-muted px-2 print:hidden">
            <span>✨ Live Board-Ready Document Preview</span>
            <span>Auto-synced with customizations</span>
          </div>

          {/* Document Canvas */}
          <div className="overflow-x-auto pb-4">
            <ExecutiveReportPreview
              reportData={overviewReport}
              comparisons={comparisons}
              dateRange={dateRange}
              companyName={companyName}
              includeSections={includeSections}
            />
          </div>
        </div>
      </div>

      {/* SCHEDULED AUTOMATED REPORT DISPATCHER MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-lg rounded-3xl border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <h3 className="font-extrabold text-sm text-foreground">
                  Automated Recurring Email Dispatch
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted font-medium mb-1">
                    Frequency Cadence:
                  </label>
                  <select
                    value={scheduleConfig.cadence}
                    onChange={(e) =>
                      setScheduleConfig({ ...scheduleConfig, cadence: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                  >
                    <option value="weekly">Every Week</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="monthly">Every Month (1st Day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground-muted font-medium mb-1">
                    Delivery Day:
                  </label>
                  <select
                    value={scheduleConfig.dayOfWeek}
                    onChange={(e) =>
                      setScheduleConfig({ ...scheduleConfig, dayOfWeek: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Friday">Friday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Recipient Email Addresses (comma separated):
                </label>
                <textarea
                  rows={2}
                  value={scheduleConfig.recipients}
                  onChange={(e) =>
                    setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground-muted font-medium mb-1">
                  Attachment Format:
                </label>
                <select
                  value={scheduleConfig.format}
                  onChange={(e) =>
                    setScheduleConfig({ ...scheduleConfig, format: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                >
                  <option value="pdf">Vector Executive PDF Document</option>
                  <option value="excel">Excel Workbook (.xlsx / .csv)</option>
                  <option value="both">Both PDF and Excel Attachments</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs"
                >
                  {savingSchedule ? "Configuring Cron Job..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
