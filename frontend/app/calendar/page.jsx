"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import { getQueue, updatePost, deletePost, retryPost } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const PLATFORM_META = {
  twitter: { label: "X (Twitter)", icon: "𝕏", color: "bg-zinc-800 text-white", border: "border-zinc-700" },
  instagram: {
    label: "Instagram",
    icon: "📸",
    color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white",
    border: "border-pink-500/40",
  },
  linkedin: { label: "LinkedIn", icon: "💼", color: "bg-blue-700 text-white", border: "border-blue-600/40" },
  facebook: { label: "Facebook", icon: "📘", color: "bg-blue-600 text-white", border: "border-blue-500/40" },
  youtube: { label: "YouTube", icon: "▶️", color: "bg-red-600 text-white", border: "border-red-500/40" },
  pinterest: { label: "Pinterest", icon: "📌", color: "bg-red-500 text-white", border: "border-red-400/40" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function toDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const [toastMessage, setToastMessage] = useState("");

  // Navigation & View States
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day' | 'agenda'
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drag-and-Drop States
  const [draggedPost, setDraggedPost] = useState(null);
  const [dragOverDateKey, setDragOverDateKey] = useState(null);

  // Quick Reschedule Modal State
  const [rescheduleModalPost, setRescheduleModalPost] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("09:00");
  const [actionLoading, setActionLoading] = useState(false);

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
      setError(err?.friendlyMessage || "Could not load publishing calendar events.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Filter posts by platform & status
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const platforms = Array.isArray(p.platforms) ? p.platforms : [p.platform || "twitter"];
      if (selectedPlatform !== "all" && !platforms.includes(selectedPlatform)) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [posts, selectedPlatform, statusFilter]);

  // Group posts by date key (YYYY-MM-DD)
  const postsByDay = useMemo(() => {
    const map = {};
    for (const post of filteredPosts) {
      const dateStr = post.status === "published" ? post.published_at : post.scheduled_at;
      if (!dateStr) continue;
      const key = toDateKey(new Date(dateStr));
      if (!map[key]) map[key] = [];
      map[key].push(post);
    }
    return map;
  }, [filteredPosts]);

  // -------------------------------------------------------------
  // DRAG AND DROP ENGINE
  // -------------------------------------------------------------
  function handleDragStart(e, post) {
    setDraggedPost(post);
    e.dataTransfer.setData("text/plain", post.id.toString());
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, dateKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDateKey !== dateKey) {
      setDragOverDateKey(dateKey);
    }
  }

  function handleDragLeave(e, dateKey) {
    if (dragOverDateKey === dateKey) {
      setDragOverDateKey(null);
    }
  }

  async function handleDrop(e, targetDateKey, targetHour = null) {
    e.preventDefault();
    setDragOverDateKey(null);

    if (!draggedPost) return;

    // Check if dropping on the same day/time
    const currentSchedule = new Date(draggedPost.scheduled_at || draggedPost.published_at || Date.now());
    const currentKey = toDateKey(currentSchedule);

    // Keep existing hour/minute unless specified in week/day timetable
    const hour = targetHour !== null ? targetHour : currentSchedule.getHours();
    const minute = currentSchedule.getMinutes();
    const timeFormatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
    const newScheduledAt = `${targetDateKey}T${timeFormatted}`;

    if (currentKey === targetDateKey && targetHour === null) {
      setDraggedPost(null);
      return;
    }

    // Optimistic UI Update
    const originalPosts = [...posts];
    const updatedPost = { ...draggedPost, scheduled_at: newScheduledAt, status: "scheduled" };

    setPosts((prev) => prev.map((p) => (p.id === draggedPost.id ? updatedPost : p)));
    setDraggedPost(null);

    try {
      await updatePost(draggedPost.id, {
        ...draggedPost,
        scheduledAt: newScheduledAt,
        status: "scheduled",
      });
      showToast(
        `📅 Post rescheduled to ${new Date(newScheduledAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })} at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}!`
      );
    } catch (err) {
      setPosts(originalPosts); // Revert on failure
      showToast("⚠️ Failed to reschedule post. Reverted changes.");
    }
  }

  // Action: Delete Post
  async function handleDeletePost(postId, e) {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to remove this scheduled post?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("🗑️ Post deleted.");
    } catch (err) {
      showToast("⚠️ Could not delete post.");
    }
  }

  // Action: Save Manual Reschedule Modal
  async function handleSaveReschedule() {
    if (!rescheduleModalPost || !editDate) return;
    setActionLoading(true);
    try {
      const scheduledAt = `${editDate}T${editTime}:00`;
      await updatePost(rescheduleModalPost.id, {
        ...rescheduleModalPost,
        scheduledAt,
        status: "scheduled",
      });
      showToast("📅 Rescheduled successfully!");
      setRescheduleModalPost(null);
      fetchPosts();
    } catch (err) {
      showToast("⚠️ Failed to reschedule post.");
    } finally {
      setActionLoading(false);
    }
  }

  // -------------------------------------------------------------
  // DATE NAVIGATION LOGIC
  // -------------------------------------------------------------
  function nextPeriod() {
    const next = new Date(viewDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setViewDate(next);
  }

  function prevPeriod() {
    const prev = new Date(viewDate);
    if (viewMode === "month") prev.setMonth(prev.getMonth() - 1);
    else if (viewMode === "week") prev.setDate(prev.getDate() - 7);
    else prev.setDate(prev.getDate() - 1);
    setViewDate(prev);
  }

  function goToToday() {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(now);
  }

  // Month Grid Calculation
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Preceding month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      cells.push({ date: d, isCurrentMonth: false, key: toDateKey(d) });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: d, isCurrentMonth: true, key: toDateKey(d) });
    }

    // Next month starting days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({ date: d, isCurrentMonth: false, key: toDateKey(d) });
    }

    return cells;
  }, [viewDate]);

  // Week Grid Calculation (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const start = new Date(viewDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // rewind to Sunday

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { date: d, key: toDateKey(d) };
    });
  }, [viewDate]);

  const selectedDayKey = toDateKey(selectedDay);
  const selectedDayPosts = postsByDay[selectedDayKey] || [];

  return (
    <DashboardShell>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-foreground text-background font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Fast Scheduling Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Publishing Calendar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              Drag & Drop Rescheduler
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Visual omnichannel scheduling matrix. Drag posts across days to optimize your cadence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/posts/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] transition-all"
          >
            + Schedule New Post
          </Link>
        </div>
      </div>

      {/* Calendar Control Toolbar */}
      <div className="card-surface p-4 rounded-3xl border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        {/* Date Navigator (Prev, Today, Next, Month Title) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-surface-border">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg hover:bg-surface text-foreground-muted hover:text-foreground transition-colors"
              title="Previous"
            >
              ◀
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-lg text-xs font-bold hover:bg-surface text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg hover:bg-surface text-foreground-muted hover:text-foreground transition-colors"
              title="Next"
            >
              ▶
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
            {viewDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
              ...(viewMode === "day" ? { day: "numeric" } : {}),
            })}
          </h2>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
          >
            <option value="all">🌐 All Platforms</option>
            <option value="twitter">𝕏 X (Twitter)</option>
            <option value="instagram">📸 Instagram</option>
            <option value="linkedin">💼 LinkedIn</option>
            <option value="facebook">📘 Facebook</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="pinterest">📌 Pinterest</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">⏳ Scheduled Queue</option>
            <option value="published">🚀 Published Live</option>
            <option value="failed">⚠️ Failed</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-surface-border">
            {[
              { id: "month", label: "Month" },
              { id: "week", label: "Week" },
              { id: "day", label: "Day" },
              { id: "agenda", label: "Agenda" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === v.id
                    ? "bg-surface text-brand-500 shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTH GRID (DEFAULT) */}
      {viewMode === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Main Month Grid (8 cols) */}
          <div className="lg:col-span-8 card-surface rounded-3xl border border-surface-border overflow-hidden shadow-2xl p-4 space-y-2">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-surface-border text-xxs font-bold uppercase tracking-wider text-foreground-muted">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            {/* Day Cells Matrix */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell) => {
                const dayPosts = postsByDay[cell.key] || [];
                const isSelected = isSameDay(cell.date, selectedDay);
                const isToday = isSameDay(cell.date, new Date());
                const isDragOver = dragOverDateKey === cell.key;

                return (
                  <div
                    key={cell.key}
                    onClick={() => setSelectedDay(cell.date)}
                    onDragOver={(e) => handleDragOver(e, cell.key)}
                    onDragLeave={(e) => handleDragLeave(e, cell.key)}
                    onDrop={(e) => handleDrop(e, cell.key)}
                    className={`min-h-[105px] p-2 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group relative ${
                      isDragOver
                        ? "border-brand-500 ring-2 ring-brand-500/40 bg-brand-500/15 scale-[1.03] z-20"
                        : isSelected
                        ? "border-brand-500 bg-brand-500/[0.04] shadow-sm"
                        : cell.isCurrentMonth
                        ? "border-surface-border bg-surface hover:border-foreground/20 hover:bg-foreground/[0.01]"
                        : "border-surface-border/40 bg-foreground/[0.01] opacity-40"
                    }`}
                  >
                    {/* Day Number & Quick Add */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                            : "text-foreground"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {/* Hover + Quick Add Button */}
                      <Link
                        href={`/posts/create?date=${cell.key}&time=09:00`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all text-xxs font-bold"
                        title="Schedule Post on this Day"
                      >
                        +
                      </Link>
                    </div>

                    {/* Draggable Post Pills in Cell */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayPosts.slice(0, 3).map((post) => {
                        const platforms = Array.isArray(post.platforms)
                          ? post.platforms
                          : [post.platform || "twitter"];
                        const mainPlat = platforms[0] || "twitter";
                        const meta = PLATFORM_META[mainPlat] || PLATFORM_META.twitter;

                        return (
                          <div
                            key={post.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, post)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDay(cell.date);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold truncate border cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02] flex items-center gap-1.5 shadow-sm ${
                              meta.border
                            } ${
                              post.status === "failed"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                                : "bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]"
                            }`}
                            title={`[${mainPlat.toUpperCase()}] ${post.content || "Post"} (Drag to Reschedule)`}
                          >
                            <span>{meta.icon}</span>
                            <span className="truncate">{post.content || "Draft"}</span>
                          </div>
                        );
                      })}

                      {dayPosts.length > 3 && (
                        <span className="text-[9px] font-bold text-brand-500 block text-center">
                          +{dayPosts.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Bottom Status Indicators Bar */}
                    <div className="flex items-center gap-1 pt-1 border-t border-surface-border/40">
                      {dayPosts.length > 0 && (
                        <span className="text-[9px] font-bold text-foreground-muted">
                          {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Inspector Side Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-5 sticky top-24 shadow-2xl">
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    📅 {selectedDay.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </h3>
                  <p className="text-xxs text-foreground-muted">
                    {selectedDayPosts.length} posts scheduled for this flight
                  </p>
                </div>
                <Link
                  href={`/posts/create?date=${selectedDayKey}&time=09:00`}
                  className="px-3 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-xxs shadow"
                >
                  + Add Post
                </Link>
              </div>

              {selectedDayPosts.length === 0 ? (
                <div className="py-8 text-center text-xs text-foreground-muted space-y-2">
                  <p>✨ No posts scheduled for this day.</p>
                  <p className="text-xxs text-foreground-muted/60">
                    Drag any post from another date or click "+ Add Post".
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDayPosts.map((post) => {
                    const platforms = Array.isArray(post.platforms)
                      ? post.platforms
                      : [post.platform || "twitter"];

                    return (
                      <div
                        key={post.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, post)}
                        className="p-4 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-3 hover:border-brand-500/40 transition-all cursor-grab active:cursor-grabbing shadow-sm group"
                      >
                        <div className="flex items-center justify-between">
                          <StatusBadge status={post.status} />
                          <div className="flex items-center gap-1">
                            {platforms.map((p) => (
                              <span key={p} className="text-xs">
                                {PLATFORM_META[p]?.icon || "🌐"}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-foreground leading-relaxed line-clamp-3 whitespace-pre-line font-medium">
                          {post.content || <span className="italic text-foreground-muted">No text caption</span>}
                        </p>

                        <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xxs text-foreground-muted">
                          <span className="font-mono">
                            ⏰{" "}
                            {post.scheduled_at
                              ? new Date(post.scheduled_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Draft"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setRescheduleModalPost(post);
                                setEditDate(post.scheduled_at ? post.scheduled_at.split("T")[0] : selectedDayKey);
                              }}
                              className="px-2 py-1 rounded-md bg-foreground/[0.06] hover:bg-brand-500 hover:text-white font-bold transition-colors"
                              title="Reschedule"
                            >
                              Reschedule 🕒
                            </button>
                            <button
                              onClick={(e) => handleDeletePost(post.id, e)}
                              className="p-1 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK TIMETABLE VIEW */}
      {viewMode === "week" && (
        <div className="card-surface rounded-3xl border border-surface-border overflow-hidden shadow-2xl p-4 space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((w) => {
              const dayPosts = postsByDay[w.key] || [];
              const isToday = isSameDay(w.date, new Date());
              const isDragOver = dragOverDateKey === w.key;

              return (
                <div
                  key={w.key}
                  onDragOver={(e) => handleDragOver(e, w.key)}
                  onDragLeave={(e) => handleDragLeave(e, w.key)}
                  onDrop={(e) => handleDrop(e, w.key)}
                  className={`min-h-[450px] p-3 rounded-2xl border transition-all space-y-3 ${
                    isDragOver
                      ? "border-brand-500 bg-brand-500/15 ring-2 ring-brand-500/40"
                      : "border-surface-border bg-surface"
                  }`}
                >
                  {/* Day Header */}
                  <div className="text-center pb-2 border-b border-surface-border">
                    <p className="text-xxs font-bold text-foreground-muted uppercase">
                      {w.date.toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p
                      className={`text-sm font-extrabold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                        isToday ? "bg-brand-500 text-white" : "text-foreground"
                      }`}
                    >
                      {w.date.getDate()}
                    </p>
                  </div>

                  {/* Day's Posts List */}
                  <div className="space-y-2">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, post)}
                        className="p-2.5 rounded-xl bg-foreground/[0.03] border border-surface-border hover:border-brand-500/40 transition-all cursor-grab text-xs space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xxs text-foreground-muted">
                            {post.scheduled_at
                              ? new Date(post.scheduled_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Draft"}
                          </span>
                          <StatusBadge status={post.status} />
                        </div>
                        <p className="line-clamp-2 text-foreground font-medium text-[11px]">
                          {post.content || "Untitled"}
                        </p>
                      </div>
                    ))}

                    {dayPosts.length === 0 && (
                      <div className="py-12 text-center text-xxs text-foreground-muted italic">
                        Empty Slot (Drop post here)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY & AGENDA VIEW */}
      {(viewMode === "day" || viewMode === "agenda") && (
        <div className="card-surface p-6 rounded-3xl border border-surface-border space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Chronological Agenda Timeline
              </h3>
              <p className="text-xxs text-foreground-muted">
                Sequential queue of upcoming social publications
              </p>
            </div>
            <Link
              href="/posts/create"
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow"
            >
              + Create Post
            </Link>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-xs text-foreground-muted">
              No scheduled posts in the calendar agenda.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const platforms = Array.isArray(post.platforms)
                  ? post.platforms
                  : [post.platform || "twitter"];
                const postDate = new Date(post.scheduled_at || post.published_at || Date.now());

                return (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-foreground/[0.02] border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-500/40 transition-all shadow-sm"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-xs font-mono font-bold text-foreground">
                          📅 {postDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                          {platforms.map((p) => (
                            <span key={p} className="text-xs">
                              {PLATFORM_META[p]?.icon || "🌐"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line font-medium">
                        {post.content || "Empty caption draft"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setRescheduleModalPost(post);
                          setEditDate(post.scheduled_at ? post.scheduled_at.split("T")[0] : toDateKey(new Date()));
                        }}
                        className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs font-bold text-foreground hover:bg-foreground/[0.04] transition-colors"
                      >
                        Reschedule 🕒
                      </button>
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-md rounded-3xl border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">
                🕒 Reschedule Post #{rescheduleModalPost.id}
              </h3>
              <button
                onClick={() => setRescheduleModalPost(null)}
                className="p-1.5 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground-muted font-medium mb-1">Target Date:</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>
              <div>
                <label className="block text-foreground-muted font-medium mb-1">Target Time:</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setRescheduleModalPost(null)}
                className="px-4 py-2 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-bold text-xs"
              >
                {actionLoading ? "Saving..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}