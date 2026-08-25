"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SHORTCUT_GROUPS = [
  {
    title: "Navigation & Routes",
    shortcuts: [
      { keys: ["G", "D"], label: "Go to Dashboard" },
      { keys: ["G", "C"], label: "Go to Publishing Calendar" },
      { keys: ["G", "A"], label: "Go to Analytics Engine" },
      { keys: ["G", "R"], label: "Go to Reports & ROI" },
      { keys: ["G", "M"], label: "Go to Campaign Hub" },
      { keys: ["G", "S"], label: "Go to Social Accounts" },
    ],
  },
  {
    title: "Actions & Creation",
    shortcuts: [
      { keys: ["C"], label: "Compose New Post" },
      { keys: ["Ctrl", "K"], label: "Open Command Palette" },
      { keys: ["T"], label: "Toggle Active Theme" },
      { keys: ["?"], label: "Open Shortcuts Cheatsheet" },
      { keys: ["Esc"], label: "Close Active Modal / Drawer" },
    ],
  },
];

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [buffer, setBuffer] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !buffer) {
        e.preventDefault();
        router.push("/posts/create");
        return;
      }

      if (e.key.toLowerCase() === "g" && !buffer) {
        setBuffer("g");
        setTimeout(() => setBuffer(""), 1200);
        return;
      }

      if (buffer === "g") {
        const k = e.key.toLowerCase();
        setBuffer("");
        if (k === "d") router.push("/dashboard");
        else if (k === "c") router.push("/calendar");
        else if (k === "a") router.push("/analytics");
        else if (k === "r") router.push("/reports");
        else if (k === "m") router.push("/campaigns");
        else if (k === "s") router.push("/social-accounts");
        else if (k === "p") router.push("/profile");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buffer, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-surface-border shadow-2xl p-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
              ⌨
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Keyboard Shortcuts Cheatsheet
              </h3>
              <p className="text-xs text-foreground-muted">
                Navigate the entire platform like a power user
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-xl hover:bg-background-secondary text-foreground-subtle hover:text-foreground flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xxs font-bold uppercase tracking-wider text-foreground-subtle mb-2.5">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.label}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised/40 border border-surface-border/50 text-xs"
                  >
                    <span className="text-foreground-muted font-medium">
                      {sc.label}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {sc.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 rounded-lg bg-surface-raised border border-surface-border text-foreground font-mono text-xxs font-bold shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xxs text-foreground-subtle">
          <span>Press <kbd className="font-bold">Esc</kbd> anytime to dismiss</span>
          <span className="font-semibold text-brand-600 dark:text-brand-400">SocialPilot v2.4</span>
        </div>
      </div>
    </div>
  );
}