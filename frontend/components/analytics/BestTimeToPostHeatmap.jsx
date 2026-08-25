"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Simulated AI Heatmap Activity Matrix (0 - 100 engagement density)
const DEFAULT_HEATMAP_DATA = {
  all: [
    // Mon
    [12, 8, 5, 3, 2, 8, 24, 56, 82, 94, 88, 76, 85, 91, 79, 68, 74, 88, 92, 85, 64, 42, 28, 18],
    // Tue
    [15, 9, 4, 2, 3, 10, 32, 68, 91, 98, 92, 84, 89, 96, 82, 75, 81, 95, 97, 89, 71, 48, 30, 20],
    // Wed
    [14, 7, 5, 2, 4, 11, 28, 64, 88, 95, 89, 81, 87, 93, 80, 72, 79, 91, 95, 86, 68, 45, 29, 19],
    // Thu
    [16, 8, 6, 3, 3, 12, 30, 71, 94, 99, 95, 87, 92, 98, 86, 78, 85, 97, 99, 91, 74, 52, 34, 22],
    // Fri
    [18, 11, 7, 4, 4, 9, 26, 58, 84, 90, 85, 78, 86, 92, 81, 74, 80, 88, 85, 76, 59, 41, 31, 24],
    // Sat
    [20, 14, 9, 6, 3, 5, 12, 25, 48, 72, 84, 91, 95, 94, 88, 82, 86, 90, 88, 81, 67, 51, 38, 28],
    // Sun
    [22, 16, 10, 7, 4, 4, 10, 20, 42, 68, 81, 89, 93, 91, 87, 85, 89, 94, 96, 92, 78, 59, 42, 30],
  ],
  instagram: [
    [10, 5, 2, 1, 2, 6, 18, 42, 70, 85, 80, 72, 88, 94, 82, 70, 78, 95, 98, 92, 75, 52, 35, 20],
    [12, 6, 3, 1, 2, 8, 22, 54, 82, 92, 88, 80, 91, 98, 86, 76, 84, 98, 100, 95, 80, 58, 38, 22],
    [11, 5, 2, 1, 3, 7, 20, 50, 79, 89, 84, 78, 89, 95, 83, 74, 81, 96, 97, 91, 76, 54, 36, 21],
    [14, 7, 4, 2, 2, 9, 25, 59, 88, 96, 91, 85, 94, 99, 89, 81, 89, 99, 100, 96, 82, 61, 42, 25],
    [16, 9, 5, 3, 3, 7, 21, 48, 76, 86, 82, 77, 89, 95, 85, 78, 86, 92, 90, 82, 68, 49, 36, 26],
    [22, 15, 8, 5, 3, 4, 10, 22, 50, 78, 90, 96, 99, 97, 92, 88, 91, 95, 93, 88, 74, 58, 44, 31],
    [25, 18, 11, 6, 4, 3, 8, 18, 45, 75, 88, 95, 98, 96, 93, 90, 94, 98, 99, 95, 84, 66, 48, 34],
  ],
  twitter: [
    [18, 12, 8, 5, 4, 15, 45, 82, 98, 95, 91, 84, 88, 92, 85, 78, 84, 89, 86, 75, 55, 36, 25, 20],
    [20, 14, 7, 4, 5, 18, 52, 89, 100, 97, 93, 86, 90, 95, 88, 81, 87, 92, 89, 78, 58, 39, 28, 22],
    [19, 13, 6, 3, 6, 16, 48, 86, 97, 94, 90, 83, 87, 91, 84, 77, 83, 88, 85, 74, 54, 35, 26, 21],
    [21, 15, 8, 5, 5, 19, 55, 92, 100, 98, 95, 88, 92, 97, 90, 83, 89, 94, 91, 80, 60, 42, 30, 24],
    [22, 16, 9, 6, 5, 14, 42, 78, 92, 89, 86, 79, 85, 88, 81, 74, 79, 82, 78, 68, 48, 34, 26, 22],
    [15, 10, 7, 4, 3, 6, 15, 32, 55, 74, 82, 86, 88, 86, 80, 75, 78, 82, 79, 71, 54, 40, 30, 22],
    [16, 11, 8, 5, 3, 5, 12, 28, 50, 70, 79, 84, 87, 85, 82, 78, 82, 86, 88, 81, 65, 48, 34, 25],
  ],
  linkedin: [
    [8, 4, 2, 1, 2, 10, 38, 78, 96, 99, 94, 82, 79, 88, 81, 70, 75, 82, 74, 58, 38, 22, 14, 10],
    [10, 5, 3, 1, 3, 14, 46, 88, 100, 100, 96, 85, 84, 94, 86, 76, 81, 88, 79, 64, 42, 26, 16, 12],
    [9, 4, 2, 1, 3, 12, 42, 84, 98, 98, 93, 83, 81, 91, 83, 73, 78, 85, 76, 61, 40, 24, 15, 11],
    [11, 6, 3, 2, 3, 15, 48, 90, 100, 99, 97, 87, 86, 96, 88, 78, 83, 90, 81, 66, 45, 28, 18, 13],
    [10, 5, 3, 2, 2, 11, 36, 72, 89, 90, 86, 75, 72, 79, 70, 62, 65, 68, 58, 44, 28, 18, 12, 9],
    [4, 2, 1, 1, 1, 2, 6, 12, 22, 35, 42, 45, 46, 44, 38, 32, 34, 36, 32, 25, 18, 12, 8, 5],
    [5, 2, 1, 1, 1, 2, 8, 15, 28, 42, 50, 54, 56, 52, 46, 40, 42, 48, 45, 38, 28, 18, 11, 7],
  ],
};

const PLATFORM_FILTERS = [
  { id: "all", label: "All Networks", icon: "🌐" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
];

export default function BestTimeToPostHeatmap() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [hoveredCell, setHoveredCell] = useState(null);

  const matrix = DEFAULT_HEATMAP_DATA[selectedPlatform] || DEFAULT_HEATMAP_DATA.all;

  // Get dynamic background color class based on activity score (0-100)
  function getHeatmapBg(score) {
    if (score >= 95) return "bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/50";
    if (score >= 85) return "bg-emerald-600/90 text-white font-semibold";
    if (score >= 70) return "bg-indigo-600/80 text-white";
    if (score >= 50) return "bg-indigo-900/60 text-indigo-200";
    if (score >= 30) return "bg-slate-800/80 text-slate-300";
    return "bg-slate-900/40 text-slate-500";
  }

  // Handle Quick Route to Post Composer
  function handleScheduleForSlot(dayIdx, hour) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon
    const targetDay = dayIdx === 6 ? 0 : dayIdx + 1; // map Mon-Sun to Date day
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7; // schedule for upcoming target day
    today.setDate(today.getDate() + diff);

    const dateStr = today.toISOString().split("T")[0];
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    router.push(`/posts/create?date=${dateStr}&time=${timeStr}`);
  }

  return (
    <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <h3 className="text-lg font-extrabold tracking-tight text-foreground">
              24×7 Best Time to Post Heatmap
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xxs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              AI Algorithmic Model
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Historical engagement density analysis identifying optimal posting windows for maximum reach.
          </p>
        </div>

        {/* Network Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-foreground/[0.04] border border-surface-border">
          {PLATFORM_FILTERS.map((plat) => (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectedPlatform(plat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPlatform === plat.id
                  ? "bg-surface text-brand-500 shadow-sm scale-[1.02]"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <span>{plat.icon}</span>
              <span>{plat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Peak Recommended Slots Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Primary Golden Window
            </p>
            <p className="text-sm font-extrabold text-foreground mt-0.5">Thursday @ 09:00 AM</p>
            <p className="text-[11px] text-foreground-muted">Est. Reach Multiplier: 2.8× Peak</p>
          </div>
          <button
            onClick={() => handleScheduleForSlot(3, 9)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xxs shadow hover:bg-emerald-600 transition-transform active:scale-95"
          >
            Use Slot ⚡
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-brand-500">
              Secondary Golden Window
            </p>
            <p className="text-sm font-extrabold text-foreground mt-0.5">Tuesday @ 02:00 PM</p>
            <p className="text-[11px] text-foreground-muted">Est. Reach Multiplier: 2.4× Peak</p>
          </div>
          <button
            onClick={() => handleScheduleForSlot(1, 14)}
            className="px-3 py-1.5 rounded-xl bg-brand-500 text-white font-bold text-xxs shadow hover:bg-brand-600 transition-transform active:scale-95"
          >
            Use Slot ⚡
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-xxs font-bold uppercase tracking-wider text-blue-500">
              Weekend Prime Slot
            </p>
            <p className="text-sm font-extrabold text-foreground mt-0.5">Sunday @ 07:00 PM</p>
            <p className="text-[11px] text-foreground-muted">Est. Reach Multiplier: 2.2× Peak</p>
          </div>
          <button
            onClick={() => handleScheduleForSlot(6, 19)}
            className="px-3 py-1.5 rounded-xl bg-blue-500 text-white font-bold text-xxs shadow hover:bg-blue-600 transition-transform active:scale-95"
          >
            Use Slot ⚡
          </button>
        </div>
      </div>

      {/* Heatmap Grid Visual Matrix */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px] space-y-1.5">
          {/* Hours Header Row */}
          <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 text-center">
            <span className="text-xxs font-bold text-foreground-muted uppercase">Day</span>
            {HOURS.map((h) => (
              <span key={h} className="text-[9px] font-mono text-foreground-muted">
                {h % 3 === 0 ? `${h}:00` : "·"}
              </span>
            ))}
          </div>

          {/* Days & 24h Blocks */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 items-center">
              <span className="text-xs font-bold text-foreground-muted pr-2">{day}</span>
              {HOURS.map((hour) => {
                const score = matrix[dayIdx][hour];
                const isHovered =
                  hoveredCell?.dayIdx === dayIdx && hoveredCell?.hour === hour;

                return (
                  <div
                    key={hour}
                    onMouseEnter={() => setHoveredCell({ dayIdx, day, hour, score })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleScheduleForSlot(dayIdx, hour)}
                    className={`h-7 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center text-[9px] select-none ${getHeatmapBg(
                      score
                    )} ${isHovered ? "ring-2 ring-white scale-125 z-20" : "hover:scale-110"}`}
                    title={`${day} @ ${hour}:00 — Score: ${score}/100 (Click to Schedule)`}
                  >
                    {score >= 95 ? "🔥" : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend & Active Inspector Footer */}
      <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Hovered Cell Info */}
        <div>
          {hoveredCell ? (
            <p className="font-semibold text-foreground">
              🎯 <span className="font-bold text-brand-500">{hoveredCell.day} @ {hoveredCell.hour}:00</span> — Activity Score: <span className="font-bold">{hoveredCell.score}%</span> · Click to compose post for this slot.
            </p>
          ) : (
            <p className="text-foreground-muted">
              💡 Hover over any hour cell to inspect activity score, or click to schedule a post.
            </p>
          )}
        </div>

        {/* Legend Scale */}
        <div className="flex items-center gap-2 text-xxs font-bold text-foreground-muted">
          <span>Low Traffic</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-slate-900/40 border border-slate-800" />
            <span className="w-3.5 h-3.5 rounded bg-slate-800/80" />
            <span className="w-3.5 h-3.5 rounded bg-indigo-900/60" />
            <span className="w-3.5 h-3.5 rounded bg-indigo-600/80" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
          </div>
          <span>Peak Hotspot</span>
        </div>
      </div>
    </div>
  );
}
