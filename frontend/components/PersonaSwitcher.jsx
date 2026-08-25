"use client";

import { useState, useEffect } from "react";
import { getUser, setUser } from "../lib/auth";

const PERSONAS = [
  {
    role: "admin",
    name: "Alex Administrator",
    badge: "Admin (Full Access)",
    icon: "🛡️",
    desc: "Complete access to User Management, Content Moderation, Analytics, & Settings.",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-500 border-purple-500/30",
  },
  {
    role: "creator",
    name: "Sarah Content Creator",
    badge: "Creator (Publish & Draft)",
    icon: "✏️",
    desc: "Create & schedule posts, manage drafts, view personal queue and calendar.",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    role: "marketing",
    name: "Marcus Marketing Lead",
    badge: "Marketing Lead",
    icon: "🚀",
    desc: "Campaign management, ROI tracking, audience growth, reports, and scheduling.",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
  },
  {
    role: "business",
    name: "Elena Business Analyst",
    badge: "Analyst (Read-Only ROI)",
    icon: "📊",
    desc: "Executive summaries, performance metrics, CSV/PDF report exports.",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30",
  },
];

export default function PersonaSwitcher() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setCurrentUser(u);
    }
  }, []);

  function switchPersona(persona) {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      role: persona.role,
      username: persona.name.split(" ")[0].toLowerCase(),
      full_name: persona.name,
    };

    setUser(updatedUser);
    setCurrentUser(updatedUser);
    setOpen(false);

    // Dispatch storage event so all components react immediately
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  }

  if (!currentUser) return null;

  const activePersona =
    PERSONAS.find((p) => p.role === currentUser.role) || PERSONAS[0];

  return (
    <aside aria-label="Role Switcher" className="fixed bottom-5 left-5 z-[9990] flex flex-col items-start font-sans">
      {/* Expanded Menu Modal */}
      {open && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl glass-panel border border-surface-border shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Infosys Springboard Review
              </span>
              <h3 className="text-sm font-bold text-foreground">
                Instant Persona & RBAC Switcher
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-xl hover:bg-background-secondary text-foreground-subtle hover:text-foreground flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-foreground-muted mb-3 leading-relaxed">
            Switch roles in 1 click to preview how navigation, permissions, and dashboards adapt dynamically:
          </p>

          <div className="space-y-2">
            {PERSONAS.map((p) => {
              const isSelected = currentUser.role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => switchPersona(p)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-brand-500/10 border-brand-500 shadow-sm"
                      : "bg-surface-raised/40 hover:bg-surface-raised border-surface-border"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm flex-shrink-0 bg-gradient-to-br ${p.color}`}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {p.name}
                      </p>
                      {isSelected && (
                        <span className="text-xxs font-extrabold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xxs text-brand-600 dark:text-brand-400 font-semibold">
                      {p.badge}
                    </p>
                    <p className="text-xxs text-foreground-muted mt-0.5 line-clamp-2">
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-surface-border shadow-xl hover:border-brand-500/50 transition-all duration-200 active:scale-95 bg-surface/90 hover:bg-surface"
          title="Switch Demo Persona"
        >
          <span className="text-base">{activePersona.icon}</span>
          <div className="text-left hidden sm:block">
            <p className="text-xxs font-bold text-foreground-muted uppercase tracking-wider">
              Role Simulation
            </p>
            <p className="text-xs font-bold text-foreground">
              {activePersona.badge.split(" ")[0]}
            </p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
        </button>
      </div>
    </aside>
  );
}
