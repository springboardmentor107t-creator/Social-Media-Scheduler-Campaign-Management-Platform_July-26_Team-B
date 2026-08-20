"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import { getDrafts, getQueue } from "../../lib/posts";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";

const PLATFORM_META = {
 facebook: { color: "bg-blue-600" },
 instagram: { color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" },
 linkedin: { color: "bg-blue-700" },
 twitter: { color: "bg-sky-500" },
 youtube: { color: "bg-red-600" },
 pinterest: { color: "bg-red-500" },
};

function StatCard({ label, value, icon, loading }) {
 return (
 <div className="glass-panel p-5 rounded-2xl">
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-lg">
 {icon}
 </div>
 </div>
 {loading ? (
 <div className="h-7 w-12 bg-background-secondary rounded animate-pulse mb-1" />
 ) : (
 <p className="text-2xl font-bold text-foreground mb-0.5">
 {value}
 </p>
 )}
 <p className="text-xs font-medium text-foreground-muted ">{label}</p>
 </div>
 );
}

export default function DashboardPage() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [drafts, setDrafts] = useState([]);
 const [scheduled, setScheduled] = useState([]);
 const [published, setPublished] = useState([]);
 const [accounts, setAccounts] = useState([]);
 const [recent, setRecent] = useState([]);
 const [error, setError] = useState("");

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchAll();
 }, []);

 async function fetchAll() {
 setLoading(true);
 setError("");
 try {
 const [draftsData, scheduledData, publishedData, accountsRes] = await Promise.all([
 getDrafts().catch(() => []),
 getQueue("scheduled").catch(() => []),
 getQueue("published").catch(() => []),
 api.get("/api/v1/social-accounts/").catch(() => ({ data: [] })),
 ]);
 setDrafts(draftsData || []);
 setScheduled(scheduledData || []);
 setPublished(publishedData || []);
 setAccounts(accountsRes.data || []);

 const combined = [...(scheduledData || []), ...(publishedData || [])]
 .sort((a, b) => {
 const dateA = new Date(a.scheduled_at || a.published_at || 0);
 const dateB = new Date(b.scheduled_at || b.published_at || 0);
 return dateB - dateA;
 })
 .slice(0, 5);
 setRecent(combined);
 } catch (err) {
 setError("Some dashboard data could not be loaded.");
 } finally {
 setLoading(false);
 }
 }

 const quickActions = [
 { label: "Create Post", href: "/posts/create", icon: "✏️" },
 { label: "Drafts", href: "/drafts", icon: "📄" },
 { label: "Queue", href: "/queue", icon: "📋" },
 { label: "Calendar", href: "/calendar", icon: "📅" },
 ];

 return (
 <DashboardShell>
 <div className="space-y-6">
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl">
 {error}
 </div>
 )}

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Drafts" value={drafts.length} icon="📄" loading={loading} />
 <StatCard label="Scheduled" value={scheduled.length} icon="🕒" loading={loading} />
 <StatCard label="Published" value={published.length} icon="✅" loading={loading} />
 <StatCard label="Connected Accounts" value={accounts.length} icon="🔗" loading={loading} />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Quick actions */}
 <div className="lg:col-span-1 glass-panel p-6 rounded-3xl">
 <h2 className="text-sm font-bold uppercase tracking-wide text-foreground-muted mb-4">
 Quick Actions
 </h2>
 <div className="space-y-2">
 {quickActions.map((action) => (
 <button
 key={action.href}
 onClick={() => router.push(action.href)}
 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-border hover:bg-background-secondary transition-colors text-left"
 >
 <span className="text-lg">{action.icon}</span>
 <span className="text-sm font-medium text-foreground ">
 {action.label}
 </span>
 <svg className="w-4 h-4 text-foreground-muted ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
 </svg>
 </button>
 ))}
 </div>
 </div>

 {/* Recent activity */}
 <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-bold uppercase tracking-wide text-foreground-muted ">
 Recent Activity
 </h2>
 <button
 onClick={() => router.push("/queue")}
 className="text-xs font-medium text-brand-600 hover:underline"
 >
 View all
 </button>
 </div>

 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-12 bg-background-secondary rounded-xl animate-pulse" />
 ))}
 </div>
 ) : recent.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 text-center">
 <p className="text-sm text-foreground-muted mb-3">
 No activity yet. Create your first post to get started.
 </p>
 <button
 onClick={() => router.push("/posts/create")}
 className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-medium shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
 >
 Create Post
 </button>
 </div>
 ) : (
 <div className="space-y-2.5">
 {recent.map((post) => (
 <div
 key={post.id}
 className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface/40 "
 >
 <div className="flex-1 min-w-0">
 <p className="text-sm text-foreground truncate">
 {post.content || "Empty post"}
 </p>
 <div className="flex items-center gap-1.5 mt-1">
 {(post.platforms || []).map((p) => (
 <span
 key={p}
 className={`w-3 h-3 rounded-full ${PLATFORM_META[p]?.color || "bg-background-secondary"}`}
 />
 ))}
 </div>
 </div>
 <StatusBadge status={post.status} />
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </DashboardShell>
 );
}