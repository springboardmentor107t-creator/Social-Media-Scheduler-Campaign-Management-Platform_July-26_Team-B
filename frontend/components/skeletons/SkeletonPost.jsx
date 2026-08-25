"use client";

import React from "react";

export function SkeletonPost({ count = 3, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card-surface rounded-2xl p-5 border relative overflow-hidden animate-pulse"
        >
          <div className="skeleton-shimmer absolute inset-0 pointer-events-none z-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-foreground/15" />
              <div>
                <div className="h-4 w-28 bg-foreground/15 rounded mb-1" />
                <div className="h-3 w-16 bg-foreground/10 rounded" />
              </div>
            </div>
            <div className="h-6 w-20 bg-foreground/10 rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3.5 bg-foreground/10 rounded w-full" />
            <div className="h-3.5 bg-foreground/10 rounded w-5/6" />
            <div className="h-3.5 bg-foreground/10 rounded w-3/4" />
          </div>
          <div className="h-32 bg-foreground/[0.06] rounded-xl mb-4" />
          <div className="flex items-center justify-between pt-3 border-t border-foreground/[0.06]">
            <div className="h-4 w-32 bg-foreground/10 rounded" />
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-foreground/10 rounded-lg" />
              <div className="h-7 w-16 bg-foreground/10 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonPost;
