"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import { getDrafts, deletePost, updatePost } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";

const PLATFORM_META = {
 facebook: { label: "Facebook", color: "bg-blue-600" },
 instagram: { label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" },
 linkedin: { label: "LinkedIn", color: "bg-blue-700" },
 twitter: { label: "X (Twitter)", color: "bg-sky-500" },
 youtube: { label: "YouTube", color: "bg-red-600" },
 pinterest: { label: "Pinterest", color: "bg-red-500" },
};

function timeAgo(dateStr) {
 if (!dateStr) return "";
 const diff = Date.now() - new Date(dateStr).getTime();
 const mins = Math.floor(diff / 60000);
 if (mins < 1) return "Just now";
 if (mins < 60) return `${mins}m ago`;
 const hrs = Math.floor(mins / 60);
 if (hrs < 24) return `${hrs}h ago`;
 const days = Math.floor(hrs / 24);
 return `${days}d ago`;
}

function SkeletonCard() {
 return (
 <div className="glass-panel p-5 rounded-2xl animate-pulse">
 <div className="h-4 bg-background-secondary rounded w-3/4 mb-2" />
 <div className="h-4 bg-background-secondary rounded w-1/2 mb-4" />
 <div className="flex gap-2 mb-4">
 <div className="w-6 h-6 rounded-full bg-background-secondary " />
 <div className="w-6 h-6 rounded-full bg-background-secondary " />
 </div>
 <div className="h-8 bg-background-secondary rounded-lg" />
 </div>
 );
}

export default function DraftsPage() {
 const router = useRouter();
 const [drafts, setDrafts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [deletingId, setDeletingId] = useState(null);
 const [confirmId, setConfirmId] = useState(null);
 const [schedulingId, setSchedulingId] = useState(null);
 const [scheduleDate, setScheduleDate] = useState("");
 const [scheduleTime, setScheduleTime] = useState("");
 const [promoting, setPromoting] = useState(false);

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchDrafts();
 }, []);

 async function fetchDrafts() {
 setLoading(true);
 setError("");
 try {
 const data = await getDrafts();
 setDrafts(data || []);
 } catch (err) {
 setError("Could not load drafts.");
 } finally {
 setLoading(false);
 }
 }

 async function handleDelete(id) {
 setDeletingId(id);
 try {
 await deletePost(id);
 setDrafts((prev) => prev.filter((d) => d.id !== id));
 setConfirmId(null);
 } catch (err) {
 setError("Could not delete draft.");
 } finally {
 setDeletingId(null);
 }
 }

 function openScheduler(draft) {
 setSchedulingId(draft.id);
 setScheduleDate("");
 setScheduleTime("");
 }

 async function handlePromote(draft) {
 if (!scheduleDate || !scheduleTime) {
 setError("Pick a date and time to schedule this draft.");
 return;
 }
 setPromoting(true);
 setError("");
 try {
 const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
 await updatePost(draft.id, {
 content: draft.content,
 platforms: draft.platforms,
 status: "scheduled",
 scheduledAt,
 recurrence: null,
 });
 setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
 setSchedulingId(null);
 router.push("/queue");
 } catch (err) {
 setError("Could not schedule this draft.");
 } finally {
 setPromoting(false);
 }
 }

 return (
 <DashboardShell>
 <div className="glass-panel p-8 rounded-3xl">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold mb-1 tracking-tight">Drafts</h1>
 <p className="text-foreground-muted text-sm">
 {loading
 ? "Loading your saved drafts..."
 : `You have ${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
 </p>
 </div>
 <button
 onClick={() => router.push("/posts/create")}
 className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all"
 >
 + New Post
 </button>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-6 py-3 px-4 rounded-xl">
 {error}
 </div>
 )}

 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3].map((i) => (
 <SkeletonCard key={i} />
 ))}
 </div>
 ) : drafts.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <div className="w-16 h-16 rounded-2xl bg-background-secondary flex items-center justify-center mb-4">
 <svg className="w-8 h-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 <h3 className="font-semibold text-foreground mb-1">No drafts yet</h3>
 <p className="text-sm text-foreground-muted mb-5 max-w-xs">
 Save a post as a draft and it'll show up here, ready to finish later.
 </p>
 <button
 onClick={() => router.push("/posts/create")}
 className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-medium shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
 >
 Create your first post
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {drafts.map((draft) => (
 <div
 key={draft.id}
 className="p-5 rounded-2xl border border-surface-border bg-surface/40 hover:shadow-md transition-all flex flex-col"
 >
 <p className="text-sm text-foreground line-clamp-3 mb-4 min-h-[3.75rem]">
 {draft.content || "Empty draft"}
 </p>

 <div className="flex items-center gap-1.5 mb-4">
 {(draft.platforms || []).map((p) => (
 <span
 key={p}
 title={PLATFORM_META[p]?.label}
 className={`w-5 h-5 rounded-full ${PLATFORM_META[p]?.color || "bg-background-secondary"}`}
 />
 ))}
 </div>

 <p className="text-xs text-foreground-muted mb-4">
 Edited {timeAgo(draft.updated_at || draft.created_at)}
 </p>

 {schedulingId === draft.id ? (
 <div className="space-y-2 mt-auto">
 <div className="grid grid-cols-2 gap-2">
 <input
 type="date"
 value={scheduleDate}
 onChange={(e) => setScheduleDate(e.target.value)}
 className="px-2 py-1.5 text-xs rounded-lg bg-surface border border-surface-border "
 />
 <input
 type="time"
 value={scheduleTime}
 onChange={(e) => setScheduleTime(e.target.value)}
 className="px-2 py-1.5 text-xs rounded-lg bg-surface border border-surface-border "
 />
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handlePromote(draft)}
 disabled={promoting}
 className="flex-1 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium disabled:opacity-60"
 >
 {promoting ? "..." : "Confirm"}
 </button>
 <button
 onClick={() => setSchedulingId(null)}
 className="flex-1 py-1.5 rounded-lg border border-surface-border text-xs font-medium"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : confirmId === draft.id ? (
 <div className="flex gap-2 mt-auto">
 <button
 onClick={() => handleDelete(draft.id)}
 disabled={deletingId === draft.id}
 className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium disabled:opacity-60"
 >
 {deletingId === draft.id ? "..." : "Confirm Delete"}
 </button>
 <button
 onClick={() => setConfirmId(null)}
 className="flex-1 py-1.5 rounded-lg border border-surface-border text-xs font-medium"
 >
 Cancel
 </button>
 </div>
 ) : (
 <div className="flex gap-2 mt-auto">
 <button
 onClick={() => router.push(`/posts/create?draftId=${draft.id}`)}
 className="flex-1 py-1.5 rounded-lg border border-surface-border text-xs font-medium hover:bg-background-secondary transition-colors"
 >
 Edit
 </button>
 <button
 onClick={() => openScheduler(draft)}
 className="flex-1 py-1.5 rounded-lg border border-surface-border text-xs font-medium hover:bg-background-secondary transition-colors"
 >
 Schedule
 </button>
 <button
 onClick={() => setConfirmId(draft.id)}
 className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
 >
 Delete
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </DashboardShell>
 );
}