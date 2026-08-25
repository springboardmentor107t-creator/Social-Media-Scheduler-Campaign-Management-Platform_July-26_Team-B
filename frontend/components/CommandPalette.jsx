"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { applyTheme } from "../lib/theme";

const COMMANDS = [
  {
    id: "create-post",
    title: "Create New Post",
    subtitle: "Draft, schedule, and simulate cross-platform posts",
    category: "Actions",
    icon: "✏️",
    href: "/posts/create",
  },
  {
    id: "calendar",
    title: "Editorial Calendar",
    subtitle: "Visual publishing timetable & schedule planner",
    category: "Navigation",
    icon: "📅",
    href: "/calendar",
  },
  {
    id: "queue",
    title: "Publishing Queue",
    subtitle: "Manage active, scheduled, and published pipeline",
    category: "Navigation",
    icon: "📋",
    href: "/queue",
  },
  {
    id: "campaigns",
    title: "Marketing Campaigns",
    subtitle: "Coordinate multi-channel campaigns and budgets",
    category: "Navigation",
    icon: "🚀",
    href: "/campaigns",
  },
  {
    id: "analytics",
    title: "Performance Analytics",
    subtitle: "Cross-platform impressions, reach, and engagement",
    category: "Navigation",
    icon: "📊",
    href: "/analytics",
  },
  {
    id: "reports",
    title: "Campaign Reports & Exports",
    subtitle: "ROI score comparisons and CSV download exports",
    category: "Navigation",
    icon: "📑",
    href: "/reports",
  },
  {
    id: "social-accounts",
    title: "Connected Social Channels",
    subtitle: "Link Twitter, Instagram, LinkedIn, and Facebook",
    category: "Navigation",
    icon: "🔗",
    href: "/social-accounts",
  },
  {
    id: "drafts",
    title: "Saved Drafts",
    subtitle: "Review unfinished posts and promote to queue",
    category: "Navigation",
    icon: "📄",
    href: "/drafts",
  },
  {
    id: "settings",
    title: "System Settings",
    subtitle: "Account preferences, passwords, and themes",
    category: "Navigation",
    icon: "⚙️",
    href: "/settings",
  },
  {
    id: "profile",
    title: "Account Profile",
    subtitle: "Manage personal identity and permissions",
    category: "Navigation",
    icon: "👤",
    href: "/profile",
  },
  {
    id: "theme-dark",
    title: "Theme: Dark Mode",
    subtitle: "Sleek high-contrast dark palette",
    category: "Themes",
    icon: "🌙",
    action: () => applyTheme("dark"),
  },
  {
    id: "theme-light",
    title: "Theme: System Light",
    subtitle: "Clean bright SaaS interface",
    category: "Themes",
    icon: "☀️",
    action: () => applyTheme("system"),
  },
  {
    id: "theme-peach",
    title: "Theme: Peach Sunset",
    subtitle: "Warm, vibrant coral tones",
    category: "Themes",
    icon: "🍑",
    action: () => applyTheme("peach"),
  },
  {
    id: "theme-cream",
    title: "Theme: Soft Cream",
    subtitle: "Earthy minimalist warm beige",
    category: "Themes",
    icon: "🍦",
    action: () => applyTheme("cream"),
  },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) => {
    const text = `${cmd.title} ${cmd.subtitle} ${cmd.category}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const handleSelect = useCallback(
    (cmd) => {
      setOpen(false);
      setQuery("");
      if (cmd.href) {
        router.push(cmd.href);
      } else if (cmd.action) {
        cmd.action();
      }
    },
    [router]
  );

  useEffect(() => {
    function handleNav(e) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [open, filteredCommands, selectedIndex, handleSelect]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        className="modal-surface w-full max-w-xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border bg-surface-raised">
          <svg
            className="w-5 h-5 text-brand-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to page... (e.g. 'Post', 'Calendar', 'Theme')"
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-foreground-muted"
          />
          <kbd className="px-2 py-1 rounded-lg bg-foreground/[0.06] border border-surface-border text-xxs font-mono font-bold text-foreground-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-surface-raised">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-xs font-semibold text-foreground-muted">
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-500/15 text-brand-600 border border-brand-500/30 shadow-sm"
                      : "hover:bg-foreground/[0.04] text-foreground border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xl w-8 h-8 rounded-xl bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                      {cmd.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {cmd.title}
                      </p>
                      <p className="text-xxs text-foreground-muted truncate">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-foreground-muted uppercase px-2 py-0.5 rounded-md bg-foreground/[0.05] border border-surface-border">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 border-t border-surface-border bg-foreground/[0.02] flex items-center justify-between text-xxs text-foreground-muted font-medium">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-bold text-brand-600">SocialPilot Spotlight</span>
        </div>
      </div>
    </div>
  );
}
