"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "success",
    title: "Post Published to Twitter & LinkedIn",
    message: "Your scheduled post 'Product v2.4 Release Notes' went live with 0 errors.",
    timestamp: "2 mins ago",
    read: false,
    link: "/queue?status=published",
    category: "publishing",
  },
  {
    id: "notif_2",
    type: "warning",
    title: "Campaign Budget Threshold",
    message: "Summer Product Launch reached 85% of allocated budget ($4,250 / $5,000).",
    timestamp: "28 mins ago",
    read: false,
    link: "/campaigns/1",
    category: "campaigns",
  },
  {
    id: "notif_3",
    type: "info",
    title: "Audience Engagement Spike",
    message: "Instagram engagement rate increased by +14.8% over the last 24 hours.",
    timestamp: "2 hours ago",
    read: false,
    link: "/analytics",
    category: "analytics",
  },
  {
    id: "notif_4",
    type: "error",
    title: "Token Refresh Needed",
    message: "Facebook Page token expires in 3 days. Reconnect in Social Accounts.",
    timestamp: "5 hours ago",
    read: true,
    link: "/social-accounts",
    category: "security",
  },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");
  const dropdownRef = useRef(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearNotification(id, e) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const filteredList = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "alerts") return n.type === "warning" || n.type === "error";
    return true;
  });

  const typeConfig = {
    success: { icon: "✓", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    warning: { icon: "⚠", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    error: { icon: "✕", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    info: { icon: "✦", color: "text-brand-500 bg-brand-500/10 border-brand-500/20" },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
          open
            ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
            : "text-foreground-subtle hover:text-foreground hover:bg-background-secondary"
        }`}
        title="Notifications"
        aria-label="Open notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl glass-panel border border-surface-border shadow-2xl p-0 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-raised/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xxs font-bold bg-brand-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2.5 border-b border-surface-border flex gap-1.5 bg-background-secondary/30">
            {["all", "unread", "alerts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-raised"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-border/50">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mb-2 font-bold">
                  ✓
                </div>
                <p className="text-sm font-semibold text-foreground">All caught up!</p>
                <p className="text-xs text-foreground-muted mt-0.5">No notifications in this filter.</p>
              </div>
            ) : (
              filteredList.map((item) => {
                const conf = typeConfig[item.type] || typeConfig.info;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      markAsRead(item.id);
                      if (item.link) {
                        router.push(item.link);
                        setOpen(false);
                      }
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-surface-raised/80 transition-colors cursor-pointer relative group ${
                      !item.read ? "bg-brand-500/[0.04]" : ""
                    }`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${conf.color}`}
                    >
                      {conf.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !item.read ? "text-foreground" : "text-foreground-muted"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-xxs text-foreground-subtle whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xxs text-foreground-muted line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread indicator / Dismiss */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
                      )}
                      <button
                        onClick={(e) => clearNotification(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-foreground-subtle hover:text-foreground text-xs p-1 transition-opacity"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-surface-raised/60 border-t border-surface-border text-center">
            <Link
              href="/queue"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>View Publishing Activity Center</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
