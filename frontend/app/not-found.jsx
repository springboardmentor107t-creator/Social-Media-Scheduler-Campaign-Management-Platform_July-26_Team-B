import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="card-surface max-w-lg w-full rounded-3xl p-10 border text-center shadow-xl relative overflow-hidden">
        <div className="blob-1 absolute top-0 right-0 w-48 h-48 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
        <div className="blob-2 absolute bottom-0 left-0 w-48 h-48 rounded-full filter blur-3xl opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-4">
            Error 404
          </span>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-base text-foreground-muted mb-8 max-w-sm mx-auto leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved to another URL.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-surface-border text-foreground hover:bg-foreground/[0.04] font-medium text-sm transition-all"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
