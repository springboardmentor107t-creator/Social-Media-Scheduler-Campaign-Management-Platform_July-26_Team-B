"use client";

import React, { useState } from "react";

const DEMOGRAPHICS_DATA = {
  ageGroups: [
    { range: "18 - 24", percentage: 24, count: "24.2K" },
    { range: "25 - 34", percentage: 46, count: "46.5K", isPeak: true },
    { range: "35 - 44", percentage: 18, count: "18.1K" },
    { range: "45 - 54", percentage: 8, count: "8.3K" },
    { range: "55+", percentage: 4, count: "4.1K" },
  ],
  genderSplit: [
    { label: "Female", percentage: 52, color: "bg-pink-500", dotColor: "#ec4899" },
    { label: "Male", percentage: 44, color: "bg-blue-500", dotColor: "#3b82f6" },
    { label: "Non-Binary / Other", percentage: 4, color: "bg-purple-500", dotColor: "#a855f7" },
  ],
  topCountries: [
    { country: "United States", code: "US", percentage: 42, flag: "🇺🇸", followers: "42,800" },
    { country: "United Kingdom", code: "GB", percentage: 18, flag: "🇬🇧", followers: "18,400" },
    { country: "Canada", code: "CA", percentage: 14, flag: "🇨🇦", followers: "14,200" },
    { country: "Germany", code: "DE", percentage: 11, flag: "🇩🇪", followers: "11,100" },
    { country: "India", code: "IN", percentage: 9, flag: "🇮🇳", followers: "9,200" },
    { country: "Australia", code: "AU", percentage: 6, flag: "🇦🇺", followers: "6,100" },
  ],
  topCities: [
    { city: "New York, USA", percentage: 16 },
    { city: "London, UK", percentage: 12 },
    { city: "San Francisco, USA", percentage: 9 },
    { city: "Toronto, Canada", percentage: 7 },
    { city: "Berlin, Germany", percentage: 6 },
  ],
  devices: [
    { label: "Mobile Device (iOS/Android)", percentage: 76, icon: "📱" },
    { label: "Desktop Web", percentage: 19, icon: "💻" },
    { label: "Tablet & Others", percentage: 5, icon: "📟" },
  ],
};

export default function AudienceDemographics({ audienceOverview = null }) {
  const [activeGeoTab, setActiveGeoTab] = useState("countries");

  const totalFollowers = audienceOverview?.total_audience || "101.8K";
  const growthRate = audienceOverview?.growth_rate || "+14.8%";

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards for Audience Growth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Total Audience</p>
            <p className="text-2xl font-extrabold text-foreground mt-0.5">{totalFollowers}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-500">
              {growthRate} this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xl">
            👥
          </div>
        </div>

        <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">New Follower Gains</p>
            <p className="text-2xl font-extrabold text-blue-500 mt-0.5">+4,820</p>
            <span className="inline-block mt-1 text-[11px] text-foreground-muted">Organic + Campaign</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl">
            📈
          </div>
        </div>

        <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Audience Retention</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-0.5">98.2%</p>
            <span className="inline-block mt-1 text-[11px] text-foreground-muted">Low churn rate</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
        </div>

        <div className="card-surface p-5 rounded-3xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Primary Age Segment</p>
            <p className="text-2xl font-extrabold text-purple-500 mt-0.5">25 - 34 yrs</p>
            <span className="inline-block mt-1 text-[11px] text-foreground-muted">46.5% of total</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xl">
            🎯
          </div>
        </div>
      </div>

      {/* Grid Row: Age & Gender Distribution (Left) vs. Geographic Distribution (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (6): Age Brackets & Gender Split */}
        <div className="lg:col-span-6 card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Age & Gender Breakdown</h3>
              <p className="text-xxs text-foreground-muted">Demographic distribution across verified channels</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xxs font-bold bg-foreground/[0.04] text-foreground-muted border border-surface-border">
              Global Sample
            </span>
          </div>

          {/* Age Bracket Progress Bars */}
          <div className="space-y-3.5">
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
              Age Group Distribution
            </p>
            {DEMOGRAPHICS_DATA.ageGroups.map((group) => (
              <div key={group.range} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="text-foreground">{group.range} years</span>
                    {group.isPeak && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                        Peak Core
                      </span>
                    )}
                  </span>
                  <span className="text-foreground-muted font-mono">{group.percentage}% ({group.count})</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      group.isPeak ? "bg-gradient-brand" : "bg-foreground/40"
                    }`}
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gender Split Composite Strip */}
          <div className="pt-4 border-t border-surface-border space-y-3">
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">
              Gender Identity Ratio
            </p>
            {/* Multi-color composite bar */}
            <div className="w-full h-3.5 rounded-full overflow-hidden flex">
              {DEMOGRAPHICS_DATA.genderSplit.map((gender) => (
                <div
                  key={gender.label}
                  className={`${gender.color} h-full transition-all`}
                  style={{ width: `${gender.percentage}%` }}
                  title={`${gender.label}: ${gender.percentage}%`}
                />
              ))}
            </div>

            {/* Legend Labels */}
            <div className="flex items-center justify-between pt-1 text-xs">
              {DEMOGRAPHICS_DATA.genderSplit.map((gender) => (
                <div key={gender.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: gender.dotColor }}
                  />
                  <span className="text-foreground-muted font-medium">
                    {gender.label}: <strong className="text-foreground">{gender.percentage}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col (6): Geographic Hotspots & Top Cities */}
        <div className="lg:col-span-6 card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Top Audience Locations</h3>
              <p className="text-xxs text-foreground-muted">Concentration by country and metropolitan hub</p>
            </div>
            {/* Tab switch: Countries vs Cities */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-surface-border">
              <button
                type="button"
                onClick={() => setActiveGeoTab("countries")}
                className={`px-3 py-1 rounded-lg text-xxs font-bold transition-all ${
                  activeGeoTab === "countries"
                    ? "bg-surface text-brand-500 shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Countries
              </button>
              <button
                type="button"
                onClick={() => setActiveGeoTab("cities")}
                className={`px-3 py-1 rounded-lg text-xxs font-bold transition-all ${
                  activeGeoTab === "cities"
                    ? "bg-surface text-brand-500 shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Top Cities
              </button>
            </div>
          </div>

          {activeGeoTab === "countries" ? (
            <div className="space-y-3">
              {DEMOGRAPHICS_DATA.topCountries.map((item) => (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.country}</span>
                    </span>
                    <span className="font-mono text-foreground-muted">
                      {item.percentage}% ({item.followers})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${item.percentage * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {DEMOGRAPHICS_DATA.topCities.map((c, i) => (
                <div key={c.city} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">
                      #{i + 1} {c.city}
                    </span>
                    <span className="font-mono text-foreground-muted">{c.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${c.percentage * 4}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Device Breakdown Footer */}
          <div className="pt-4 border-t border-surface-border">
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted mb-2.5">
              Device Engagement Share
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMOGRAPHICS_DATA.devices.map((d) => (
                <div key={d.label} className="p-3 rounded-2xl bg-foreground/[0.02] border border-surface-border text-center">
                  <span className="text-base">{d.icon}</span>
                  <p className="text-sm font-extrabold text-foreground mt-0.5">{d.percentage}%</p>
                  <p className="text-[10px] text-foreground-muted truncate">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
