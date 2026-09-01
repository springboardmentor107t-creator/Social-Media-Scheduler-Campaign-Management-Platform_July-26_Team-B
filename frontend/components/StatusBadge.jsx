import React from "react";

const STATUS_META = {
  active: {
    label: "Active",
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    renderIcon: () => (
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    ),
  },
  upcoming: {
    label: "Upcoming",
    classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  scheduled: {
    label: "Scheduled",
    classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  draft: {
    label: "Draft",
    classes: "bg-foreground/[0.06] text-foreground-muted border border-surface-border",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  paused: {
    label: "Paused",
    classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  completed: {
    label: "Completed",
    classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  published: {
    label: "Published",
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    label: "Failed",
    classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-foreground/[0.06] text-foreground-muted border border-surface-border",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  archived: {
    label: "Archived",
    classes: "bg-foreground/[0.04] text-foreground-subtle border border-surface-border",
    renderIcon: () => (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
};

export default function StatusBadge({ status, customLabel }) {
  const normalized = (status || "draft").toLowerCase();
  const meta = STATUS_META[normalized] || STATUS_META.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${meta.classes}`}
    >
      {meta.renderIcon && meta.renderIcon()}
      <span>{customLabel || meta.label}</span>
    </span>
  );
}