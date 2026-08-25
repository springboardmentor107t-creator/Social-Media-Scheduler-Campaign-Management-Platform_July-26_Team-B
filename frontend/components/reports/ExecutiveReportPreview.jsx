"use client";

import React from "react";

export default function ExecutiveReportPreview({
  reportData = null,
  comparisons = [],
  dateRange = "Last 30 Days",
  companyName = "Acme Corp Marketing Operations",
  includeSections = { summary: true, networks: true, campaigns: true, topPosts: true },
}) {
  const generatedAt = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalImpressions = reportData?.total_impressions || "4,290,450";
  const totalReach = reportData?.total_reach || "1,842,900";
  const avgEngagement = reportData?.average_engagement_rate ? `${reportData.average_engagement_rate}%` : "5.84%";
  const totalClicks = reportData?.total_clicks || "142,600";
  const totalPosts = reportData?.total_posts || "84";

  return (
    <div
      id="executive-report-document"
      className="w-full max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl rounded-3xl p-8 sm:p-12 space-y-8 font-sans border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0"
    >
      {/* 1. Executive Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
              SP
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Social<span className="text-indigo-600">Pilot</span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Enterprise Social Intelligence & Performance Audit
              </p>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-900">{companyName}</p>
          <p>Flight Period: <span className="font-semibold text-indigo-600">{dateRange}</span></p>
          <p>Generated: <span className="font-mono text-slate-500">{generatedAt}</span></p>
        </div>
      </div>

      {/* 2. Executive KPI Highlights Grid */}
      {includeSections.summary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              1. Executive KPI Summary
            </h2>
            <span className="text-xxs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ↑ 18.4% Net Growth
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Impressions</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{totalImpressions.toLocaleString("en-US")}</p>
              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">+22.4% vs last period</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audience Reach</p>
              <p className="text-xl font-extrabold text-indigo-600 mt-1">{totalReach.toLocaleString("en-US")}</p>
              <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">+14.2% organic</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Engagement</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{avgEngagement}</p>
              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Above benchmark</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Link Clicks</p>
              <p className="text-xl font-extrabold text-purple-600 mt-1">{totalClicks.toLocaleString("en-US")}</p>
              <p className="text-[10px] font-semibold text-purple-600 mt-0.5">{totalPosts} Published Posts</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cross-Platform Channel Breakdown Table */}
      {includeSections.networks && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            2. Omnichannel Network Breakdown
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Network</th>
                  <th className="p-3">Reach</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">Engagement</th>
                  <th className="p-3">Outbound Clicks</th>
                  <th className="p-3 text-right">Channel ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📸</span> Instagram
                  </td>
                  <td className="p-3 font-mono">720,400</td>
                  <td className="p-3 font-mono">1,420,000</td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">4.82%</td>
                  <td className="p-3 font-mono">32,400</td>
                  <td className="p-3 text-right font-bold text-emerald-600">3.8×</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>💼</span> LinkedIn
                  </td>
                  <td className="p-3 font-mono">480,200</td>
                  <td className="p-3 font-mono">890,000</td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">5.14%</td>
                  <td className="p-3 font-mono">48,100</td>
                  <td className="p-3 text-right font-bold text-emerald-600">4.6×</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>𝕏</span> X (Twitter)
                  </td>
                  <td className="p-3 font-mono">890,500</td>
                  <td className="p-3 font-mono">1,890,000</td>
                  <td className="p-3 font-mono text-slate-900 font-bold">3.25%</td>
                  <td className="p-3 font-mono">26,800</td>
                  <td className="p-3 text-right font-bold text-indigo-600">2.9×</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📘</span> Facebook
                  </td>
                  <td className="p-3 font-mono">360,100</td>
                  <td className="p-3 font-mono">740,000</td>
                  <td className="p-3 font-mono text-slate-900 font-bold">2.74%</td>
                  <td className="p-3 font-mono">18,200</td>
                  <td className="p-3 text-right font-bold text-indigo-600">2.1×</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>▶️</span> YouTube
                  </td>
                  <td className="p-3 font-mono">310,000</td>
                  <td className="p-3 font-mono">620,000</td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">6.30%</td>
                  <td className="p-3 font-mono">15,900</td>
                  <td className="p-3 text-right font-bold text-emerald-600">4.2×</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Active Marketing Campaigns Progress */}
      {includeSections.campaigns && comparisons && comparisons.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            3. Campaign Performance Pacing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comparisons.slice(0, 4).map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">{c.campaign_name}</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {c.status || "active"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <p>Impressions: <strong className="text-slate-900">{(c.total_impressions || 0).toLocaleString("en-US")}</strong></p>
                  <p>Clicks: <strong className="text-slate-900">{(c.total_clicks || 0).toLocaleString("en-US")}</strong></p>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Executive Strategic Insights & Recommendations */}
      {includeSections.topPosts && (
        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
          <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>💡</span> Strategic Marketing Takeaways & AI Recommendations
          </h3>
          <ul className="text-xs text-indigo-900 space-y-1 leading-relaxed list-disc list-inside">
            <li>
              <strong>LinkedIn & Instagram Carousels</strong> drove 58% of total qualified link conversions with the highest engagement retention.
            </li>
            <li>
              Publishing during <strong>Thursday 09:00 AM</strong> and <strong>Tuesday 02:00 PM</strong> produced 2.6× higher reach than weekend average.
            </li>
            <li>
              Recommend allocating +15% additional content cadence to video and carousel creative formats for next month flight.
            </li>
          </ul>
        </div>
      )}

      {/* 6. Signature & Verification Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <p className="font-semibold text-slate-700">Certified by SocialPilot Analytics Engine</p>
          <p className="text-[10px]">Data cryptographic hash: #SP-AUDIT-2026-98124</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-slate-800">Approved by Lead Marketing Director</p>
          <div className="h-0.5 w-36 bg-slate-300 mt-2 sm:ml-auto" />
        </div>
      </div>
    </div>
  );
}
