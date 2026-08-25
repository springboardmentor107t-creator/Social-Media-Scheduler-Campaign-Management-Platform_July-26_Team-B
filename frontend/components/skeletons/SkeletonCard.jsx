"use client";

import React from "react";

export function SkeletonCard({ count = 1, className = "" }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`card-surface rounded-2xl p-6 border relative overflow-hidden animate-pulse ${className}`}
        >
          <div className="skeleton-shimmer absolute inset-0 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-28 bg-foreground/10 rounded-md" />
            <div className="h-9 w-9 rounded-xl bg-foreground/10" />
          </div>
          <div className="h-8 w-36 bg-foreground/15 rounded-lg mb-2" />
          <div className="h-3 w-48 bg-foreground/10 rounded-md" />
        </div>
      ))}
    </>
  );
}

export default SkeletonCard;
