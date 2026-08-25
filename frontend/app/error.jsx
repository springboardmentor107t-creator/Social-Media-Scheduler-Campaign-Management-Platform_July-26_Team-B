"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to console/analytics
    console.error("Global Application Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="card-surface max-w-md w-full rounded-2xl p-8 border text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-foreground-muted mb-6 leading-relaxed">
          An unexpected error occurred while rendering this page. You can try
          reloading the component or return to the dashboard.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-foreground/[0.04] border border-foreground/10 text-left">
            <p className="text-xs font-mono text-foreground-muted break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-surface-border text-foreground hover:bg-foreground/[0.04] font-medium text-sm transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
