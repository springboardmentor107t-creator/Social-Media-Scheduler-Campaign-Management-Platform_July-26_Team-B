"use client";

import React from "react";

export const PLATFORM_CONFIG = {
  twitter: {
    name: "X (Twitter)",
    shortName: "X",
    color: "bg-black text-white dark:bg-zinc-800 dark:text-zinc-100 border-zinc-700/60 shadow-sm",
    badgeBg: "bg-zinc-900/90 text-white border border-zinc-700/50 hover:border-zinc-500",
    iconBg: "bg-black text-white",
    dotColor: "bg-zinc-400",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  instagram: {
    name: "Instagram",
    shortName: "Instagram",
    color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:border-rose-500/40",
    iconBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white",
    dotColor: "bg-rose-500",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  linkedin: {
    name: "LinkedIn",
    shortName: "LinkedIn",
    color: "bg-[#0A66C2] text-white shadow-sm",
    badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:border-sky-500/40",
    iconBg: "bg-[#0A66C2] text-white",
    dotColor: "bg-sky-500",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  facebook: {
    name: "Facebook",
    shortName: "Facebook",
    color: "bg-[#1877F2] text-white shadow-sm",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-[#1877F2] text-white",
    dotColor: "bg-blue-500",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
      </svg>
    ),
  },
  youtube: {
    name: "YouTube",
    shortName: "YouTube",
    color: "bg-[#FF0000] text-white shadow-sm",
    badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:border-red-500/40",
    iconBg: "bg-[#FF0000] text-white",
    dotColor: "bg-red-500",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  pinterest: {
    name: "Pinterest",
    shortName: "Pinterest",
    color: "bg-[#E60023] text-white shadow-sm",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:border-rose-500/40",
    iconBg: "bg-[#E60023] text-white",
    dotColor: "bg-rose-600",
    icon: (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.372 12-12 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
};

const DEFAULT_CONFIG = {
  name: "General Social",
  shortName: "Social",
  color: "bg-slate-700 text-white",
  badgeBg: "bg-foreground/[0.06] text-foreground-subtle border border-surface-border",
  iconBg: "bg-slate-600 text-white",
  dotColor: "bg-slate-400",
  icon: (
    <svg className="w-3 h-3 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
};

export function getPlatformMeta(platformKey) {
  if (!platformKey) return DEFAULT_CONFIG;
  const key = String(platformKey).toLowerCase().trim();
  return PLATFORM_CONFIG[key] || DEFAULT_CONFIG;
}

/**
 * Single Sleek Platform Badge
 * Modes:
 * - "icon": Compact circular/rounded icon chip with tooltip (ideal for tight card headers)
 * - "pill": Rounded micro-pill with icon and subtle text
 * - "brand": Vibrant brand-colored filled pill
 */
export default function PlatformBadge({
  platform,
  mode = "icon",
  size = "sm",
  showTooltip = true,
  className = "",
}) {
  const meta = getPlatformMeta(platform);

  if (mode === "icon") {
    const sizeClasses =
      size === "xs"
        ? "w-5 h-5 text-[10px]"
        : size === "sm"
        ? "w-6 h-6 text-xs"
        : "w-7 h-7 text-sm";

    return (
      <div
        title={showTooltip ? meta.name : undefined}
        className={`inline-flex items-center justify-center rounded-lg ${sizeClasses} ${meta.color} transition-all duration-200 hover:scale-110 hover:shadow-md cursor-default shrink-0 ${className}`}
      >
        {meta.icon}
      </div>
    );
  }

  if (mode === "pill") {
    return (
      <span
        title={showTooltip ? meta.name : undefined}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight ${meta.badgeBg} transition-all duration-150 shrink-0 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "currentColor" }} />
        <span>{meta.shortName}</span>
      </span>
    );
  }

  // "brand" full filled pill
  return (
    <span
      title={showTooltip ? meta.name : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.color} transition-all duration-150 shrink-0 shadow-sm ${className}`}
    >
      <span className="shrink-0">{meta.icon}</span>
      <span>{meta.shortName}</span>
    </span>
  );
}

/**
 * Group of Platform Badges for Cards / Tables
 * Cleanly wraps and prevents overflow
 */
export function PlatformBadgesGroup({
  platforms = [],
  mode = "icon",
  size = "sm",
  maxVisible = 5,
  className = "",
}) {
  const list = Array.isArray(platforms) ? platforms : platforms ? [platforms] : [];

  if (!list.length) {
    return (
      <span className="text-[11px] text-foreground-muted italic">No channels</span>
    );
  }

  const visible = list.slice(0, maxVisible);
  const remaining = list.length - maxVisible;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap justify-end ${className}`}>
      {visible.map((plat, idx) => (
        <PlatformBadge
          key={`${plat}-${idx}`}
          platform={plat}
          mode={mode}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span
          title={`${remaining} more connected channels`}
          className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-foreground/[0.06] text-foreground-muted border border-surface-border text-[10px] font-bold"
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
