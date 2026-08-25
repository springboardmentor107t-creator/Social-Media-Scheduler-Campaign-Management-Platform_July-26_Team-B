"use client";

import React from "react";

export function SkeletonChart({ height = 280, className = "" }) {
  return (
    <div
      className={`card-surface rounded-2xl p-6 border relative overflow-hidden animate-pulse ${className}`}
    >
      <div className="skeleton-shimmer absolute inset-0 pointer-events-none z-10" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 w-36 bg-foreground/15 rounded-md mb-2" />
          <div className="h-3 w-48 bg-foreground/10 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-foreground/10 rounded-lg" />
      </div>

      <div
        className="flex items-end justify-between gap-3 pt-6 px-2 border-b border-foreground/10"
        style={{ height: `${height}px` }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const heights = [40, 65, 30, 85, 55, 95, 70, 80];
          const barHeight = heights[i % heights.length];
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
            >
              <div
                className="w-full max-w-[42px] bg-foreground/10 rounded-t-lg transition-all"
                style={{ height: `${barHeight}%` }}
              />
              <div className="h-2.5 w-6 bg-foreground/10 rounded mt-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkeletonChart;
