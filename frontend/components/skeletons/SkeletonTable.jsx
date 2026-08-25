"use client";

import React from "react";

export function SkeletonTable({ rows = 5, cols = 5, className = "" }) {
  return (
    <div
      className={`card-surface rounded-2xl border overflow-hidden relative ${className}`}
    >
      <div className="skeleton-shimmer absolute inset-0 pointer-events-none z-10" />
      {/* Table Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="h-5 w-40 bg-foreground/15 rounded-md" />
        <div className="h-8 w-24 bg-foreground/10 rounded-lg" />
      </div>

      {/* Column Headers */}
      <div className="px-6 py-3 bg-foreground/[0.02] border-b grid grid-cols-12 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-foreground/15 rounded col-span-2"
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-foreground/[0.04]">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-6 py-4 grid grid-cols-12 gap-4 items-center animate-pulse"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-foreground/10 rounded col-span-2"
                style={{ width: `${50 + ((r + c) % 4) * 12}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonTable;
