"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, setUser, isLoggedIn, setToken } from "../lib/auth";
import api from "../lib/api";

export const PERSONAS = [
  {
    role: "admin",
    name: "Alex Administrator",
    email: "admin@socialpilot.io",
    password: "adminpassword",
    username: "admin",
    badge: "Admin (Full Control)",
    icon: "🛡️",
    desc: "Governance, User Management (/admin/users), Content Moderation (/admin/content), and Logs.",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-500 border-purple-500/30",
    landingRoute: "/admin/users",
  },
  {
    role: "creator",
    name: "Sarah Content Creator",
    email: "sarah@socialpilot.io",
    password: "password123",
    username: "sarah_creator",
    badge: "Creator (Studio & Drafts)",
    icon: "✏️",
    desc: "Post creation studio, AI captions, multi-platform preview cards, drafts, personal queue.",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
    landingRoute: "/posts/create",
  },
  {
    role: "marketing",
    name: "Marcus Marketing Lead",
    email: "alex@socialpilot.io",
    password: "password123",
    username: "alex_marketing",
    badge: "Marketing Lead",
    icon: "🚀",
    desc: "Campaign management, cross-channel ROI analytics, audience targets, and calendar scheduling.",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
    landingRoute: "/campaigns",
  },
  {
    role: "business",
    name: "David Business Owner",
    email: "david@socialpilot.io",
    password: "password123",
    username: "david_business",
    badge: "Business Owner",
    icon: "💼",
    desc: "Connected social channels, team seats, billing plans (/billing), and executive reports.",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30",
    landingRoute: "/social-accounts",
  },
];

export default function PersonaSwitcher() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function checkUser() {
    const local = getUser();
    if (local) {
      setCurrentUser(local);
    }
    if (isLoggedIn()) {
      try {
        const res = await api.get("/api/v1/auth/me");
        if (res.data) {
          setUser(res.data);
          setCurrentUser(res.data);
        }
      } catch (err) {
        // Fallback user if token expired
      }
    }
  }

  useEffect(() => {
    checkUser();

    // Listen for custom trigger event from Navbar or shortcuts
    const handleOpenSwitcher = () => setOpen(true);
    window.addEventListener("open_persona_switcher", handleOpenSwitcher);
    return () => window.removeEventListener("open_persona_switcher", handleOpenSwitcher);
  }, []);

  async function switchPersona(persona) {
    setSwitchingTo(persona.role);
    setStatusMessage(`Authenticating as ${persona.name}...`);

    try {
      let token = null;

      // 1. Attempt JSON login with seeded account credentials
      try {
        const loginRes = await api.post("/api/v1/auth/login/json", {
          email: persona.email,
          password: persona.password,
        });
        token = loginRes.data.access_token || loginRes.data.token;
      } catch (loginErr) {
        // 2. If account doesn't exist yet in fresh DB, auto-register on the fly
        try {
          await api.post("/api/v1/auth/register", {
            email: persona.email,
            username: persona.username,
            role: persona.role,
            password: persona.password,
          });
          const retryLogin = await api.post("/api/v1/auth/login/json", {
            email: persona.email,
            password: persona.password,
          });
          token = retryLogin.data.access_token || retryLogin.data.token;
        } catch (regErr) {
          console.error("Auto-register failed", regErr);
        }
      }

      if (token) {
        setToken(token);
        // Fetch authentic user profile with new token
        const meRes = await api.get("/api/v1/auth/me");
        setUser(meRes.data);
        setCurrentUser(meRes.data);
      } else {
        // Client-side fallback if backend offline
        const fallbackUser = {
          id: 1,
          role: persona.role,
          username: persona.username,
          full_name: persona.name,
          email: persona.email,
        };
        setUser(fallbackUser);
        setCurrentUser(fallbackUser);
      }

      setStatusMessage(`Logged in as ${persona.badge}! Loading workspace...`);

      // Dispatch storage event so all components react immediately
      window.dispatchEvent(new Event("storage"));

      // Smooth redirection to the role's primary landing workspace
      setTimeout(() => {
        setOpen(false);
        setSwitchingTo(null);
        setStatusMessage("");
        window.location.href = persona.landingRoute || "/dashboard";
      }, 600);
    } catch (error) {
      console.error("Error switching persona:", error);
      setSwitchingTo(null);
      setStatusMessage("");
    }
  }

  const activeRole = currentUser?.role || "admin";
  const activePersona =
    PERSONAS.find((p) => p.role === activeRole) || PERSONAS[0];

  return (
    <aside
      aria-label="Role Switcher"
      className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start font-sans"
    >
      {/* Expanded Menu Modal */}
      {open && (
        <div className="mb-3 w-84 sm:w-96 rounded-3xl card-surface border border-surface-border shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200 backdrop-blur-2xl bg-surface/95 relative overflow-hidden">
          {/* Active Switching Loader Overlay */}
          {switchingTo && (
            <div className="absolute inset-0 bg-surface/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xl mb-3 animate-bounce">
                {PERSONAS.find((p) => p.role === switchingTo)?.icon || "🔄"}
              </div>
              <p className="text-sm font-extrabold text-foreground mb-1">
                Switching Active Account
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold animate-pulse">
                {statusMessage}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <span className="text-xxs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Infosys Springboard RBAC
              </span>
              <h3 className="text-sm font-bold text-foreground">
                Instant Real Account Switcher
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted hover:text-foreground flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-foreground-muted mb-3 leading-relaxed">
            Switch in 1 click to authenticate as a real registered account with role-specific views & data:
          </p>

          <div className="space-y-2">
            {PERSONAS.map((p) => {
              const isSelected = activeRole === p.role;
              const isBusy = switchingTo === p.role;

              return (
                <button
                  key={p.role}
                  onClick={() => switchPersona(p)}
                  disabled={!!switchingTo}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-brand-500/10 border-brand-500 shadow-sm"
                      : "bg-foreground/[0.02] hover:bg-foreground/[0.05] border-surface-border hover:border-brand-500/30"
                  } ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
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
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                          AUTHENTICATED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xxs text-brand-600 dark:text-brand-400 font-semibold">
                        {p.badge}
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        • {p.email}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-muted mt-1 line-clamp-2 leading-tight">
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
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-surface-border shadow-xl hover:border-brand-500/50 transition-all duration-200 active:scale-95 bg-surface/95 hover:bg-surface cursor-pointer text-foreground backdrop-blur-lg"
          title="Switch Active Account & Role"
        >
          <span className="text-base">{activePersona.icon}</span>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
              Account Switcher
            </p>
            <p className="text-xs font-bold text-foreground">
              {activePersona.name.split(" ")[0]} ({activePersona.role})
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
        </button>
      </div>
    </aside>
  );
}
