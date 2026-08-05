"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import { getQueue } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";

const PLATFORM_META = {
  facebook: { label: "Facebook", color: "bg-blue-600" },
  instagram: { label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" },
  linkedin: { label: "LinkedIn", color: "bg-blue-700" },
  twitter: { label: "X (Twitter)", color: "bg-sky-500" },
  youtube: { label: "YouTube", color: "bg-red-600" },
  pinterest: { label: "Pinterest", color: "bg-red-500" },
};

const STATUS_DOT = {
  scheduled: "bg-amber-500",
  published: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-slate-400",
  cancelled: "bg-slate-300",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setError("");
    try {
      const data = await getQueue();
      setPosts((data || []).filter((p) => p.scheduled_at || p.published_at));
    } catch (err) {
      setError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  }

  // Group posts by date key (YYYY-MM-DD) for fast lookup
  const postsByDay = useMemo(() => {
    const map = {};
    for (const post of posts) {
      const dateStr = post.status === "published" ? post.published_at : post.scheduled_at;
      if (!dateStr) continue;
      const key = toDateKey(new Date(dateStr));
      if (!map[key]) map[key] = [];
      map[key].push(post);
    }
    return map;
  }, [posts]);

  // Build the visible grid: full weeks covering the month
  const gridDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(year, month, 1 - startOffset);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [viewDate]);

  function goToMonth(offset) {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
    setSelectedDay(null);
  }

  function goToToday() {
    setViewDate(new Date());
    setSelectedDay(new Date());
  }

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date();
  const currentMonth = viewDate.getMonth();

  const selectedDayPosts = selectedDay ? postsByDay[toDateKey(selectedDay)] || [] : [];

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{monthLabel}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Publishing calendar
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToMonth(-1)}
                  className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 h-9 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => goToMonth(1)}
                  className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-4 py-3 px-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-semibold text-slate-400 py-1.5">
                  {w}
                </div>
              ))}
            </div>

            {/* Day grid */}
            {loading ? (
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {gridDays.map((day, i) => {
                  const dateKey = toDateKey(day);
                  const dayPosts = postsByDay[dateKey] || [];
                  const isCurrentMonth = day.getMonth() === currentMonth;
                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square rounded-xl border p-1.5 text-left flex flex-col transition-all ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-brand-500/30 bg-brand-500/5"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      } ${!isCurrentMonth ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`text-xs font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                          isToday ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {dayPosts.slice(0, 2).map((p) => (
                          <span
                            key={p.id}
                            className={`w-full h-1.5 rounded-full ${STATUS_DOT[p.status] || "bg-slate-400"}`}
                          />
                        ))}
                        {dayPosts.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{dayPosts.length - 2} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl sticky top-6">
            {!selectedDay ? (
              <div className="text-center py-8">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a day to see its posts.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedDay.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </h2>
                  <button
                    onClick={() => {
                      const dateStr = toDateKey(selectedDay);
                      router.push(`/posts/create?date=${dateStr}`);
                    }}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    + Add post
                  </button>
                </div>

                {selectedDayPosts.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-600">
                    Nothing scheduled for this day.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <StatusBadge status={post.status} />
                          <span className="text-xs text-slate-400">
                            {new Date(post.scheduled_at || post.published_at).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {(post.platforms || []).map((p) => (
                            <span
                              key={p}
                              title={PLATFORM_META[p]?.label}
                              className={`w-4 h-4 rounded-full ${PLATFORM_META[p]?.color || "bg-slate-400"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}