"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, logout } from "../lib/auth";
import api from "../lib/api";
import ThemeToggle from "./ThemeToggle";
import RoleBadge from "./RoleBadge";

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: "Post Scheduled for Publishing",
    desc: "Your product update is queued for Twitter & LinkedIn.",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Campaign Budget Active",
    desc: "Summer Launch 2026 reached 85% budget efficiency.",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Channel Token Verified",
    desc: "Instagram OAuth sync completed successfully.",
    time: "1d ago",
    unread: false,
  },
];

import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const [customAvatar, setCustomAvatar] = useState(null);

  async function checkAuth() {
    if (!isLoggedIn()) {
      setUser(null);
      setChecked(true);
      return;
    }
    try {
      const response = await api.get("/api/v1/auth/me");
      setUser(response.data);
      const saved = localStorage.getItem(`socialpilot_avatar_${response.data.id || response.data.email}`) || localStorage.getItem("socialpilot_current_avatar");
      if (saved) setCustomAvatar(JSON.parse(saved));
    } catch (err) {
      setUser(null);
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => {
    checkAuth();

    const handleAvatarChange = (e) => {
      setCustomAvatar(e.detail);
    };
    window.addEventListener("socialpilot_avatar_changed", handleAvatarChange);
    return () => window.removeEventListener("socialpilot_avatar_changed", handleAvatarChange);
  }, [pathname]);

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user?.username || "U")[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/90 backdrop-blur-xl transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              SP
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Social<span className="text-brand-500">Pilot</span>
            </span>
          </Link>

          {/* Quick Spotlight Trigger (Desktop) */}
          <button
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              );
            }}
            type="button"
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-surface-border bg-foreground/[0.02] hover:bg-foreground/[0.05] text-foreground-subtle hover:text-foreground text-xs transition-all cursor-pointer shadow-inner"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span>Search or jump to...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-foreground/[0.06] border border-surface-border text-[10px] font-mono font-bold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {checked && user && (
            <>
              {/* Notifications Center */}
              <NotificationCenter />

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setMenuOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-surface-border hover:bg-foreground/[0.03] transition-all cursor-pointer"
                >
                  {customAvatar?.src ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-brand-500/40 shadow-sm relative flex-shrink-0 bg-surface">
                      <img
                        src={customAvatar.src}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${customAvatar.zoom || 1}) translate(${customAvatar.panX || 0}px, ${customAvatar.panY || 0}px) rotate(${customAvatar.rotation || 0}deg)`,
                          filter: customAvatar.filter || "none",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                  <span className="text-xs font-bold text-foreground hidden sm:block max-w-[120px] truncate">
                    {user.full_name || user.username}
                  </span>
                  <svg
                    className={`w-3 h-3 text-foreground-muted transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[90]"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 dropdown-surface rounded-3xl p-3 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3 py-2.5 border-b border-surface-border mb-2 bg-foreground/[0.02] rounded-2xl">
                        <p className="text-xs font-bold text-foreground truncate">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xxs text-foreground-muted truncate">
                          {user.email}
                        </p>
                        <div className="mt-2">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors"
                        >
                          <span>👤</span> Profile Identity
                        </Link>
                        <Link
                          href="/social-accounts"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors"
                        >
                          <span>🔗</span> Connected Channels
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors"
                        >
                          <span>⚙️</span> System Settings
                        </Link>
                      </div>

                      <div className="h-px bg-divider my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {checked && !user && (
            <nav className="flex items-center gap-3 text-xs font-bold">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-brand text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                Get Started &rarr;
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}