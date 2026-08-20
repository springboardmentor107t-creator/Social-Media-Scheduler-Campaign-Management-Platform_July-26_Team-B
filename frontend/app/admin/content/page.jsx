"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import StatusBadge from "../../../components/StatusBadge";

const PLATFORM_META = {
 facebook: { label: "Facebook", color: "bg-blue-600" },
 instagram: { label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" },
 linkedin: { label: "LinkedIn", color: "bg-blue-700" },
 twitter: { label: "X (Twitter)", color: "bg-sky-500" },
 youtube: { label: "YouTube", color: "bg-red-600" },
 pinterest: { label: "Pinterest", color: "bg-red-500" },
};

const ROLE_BADGE = {
 creator: "bg-brand-500/10 text-brand-600 ",
 marketing: "bg-blue-500/10 text-blue-600 ",
 business: "bg-green-500/10 text-green-600 ",
 admin: "bg-red-500/10 text-red-600 ",
};

const STATUS_TABS = [
 { value: "", label: "All Status" },
 { value: "draft", label: "Draft" },
 { value: "scheduled", label: "Scheduled" },
 { value: "published", label: "Published" },
 { value: "failed", label: "Failed" },
];

function SkeletonRow() {
 return (
 <tr className="animate-pulse">
 <td className="py-3 px-4"><div className="h-4 bg-background-secondary rounded w-48" /></td>
 <td className="py-3 px-4"><div className="h-4 bg-background-secondary rounded w-24" /></td>
 <td className="py-3 px-4"><div className="h-6 bg-background-secondary rounded-full w-16" /></td>
 <td className="py-3 px-4"><div className="h-6 bg-background-secondary rounded-full w-20" /></td>
 <td className="py-3 px-4"><div className="h-4 bg-background-secondary rounded w-20" /></td>
 </tr>
 );
}

export default function AdminContentPage() {
 const router = useRouter();
 const [checkingAccess, setCheckingAccess] = useState(true);
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 const [roleFilter, setRoleFilter] = useState("");

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 checkAccess();
 }, []);

 useEffect(() => {
 if (!checkingAccess) fetchAllContent();
 }, [statusFilter, roleFilter, checkingAccess]);

 async function checkAccess() {
 try {
 const response = await api.get("/api/v1/auth/me");
 if (response.data.role !== "admin") {
 router.push("/profile");
 return;
 }
 setCheckingAccess(false);
 } catch (err) {
 router.push("/login");
 }
 }

 async function fetchAllContent() {
 setLoading(true);
 setError("");
 try {
 const params = {};
 if (statusFilter) params.status = statusFilter;
 if (roleFilter) params.role = roleFilter;
 const response = await api.get("/api/v1/admin/posts", { params });
 setPosts(response.data || []);
 } catch (err) {
 setError("Could not load platform content.");
 setPosts([]);
 } finally {
 setLoading(false);
 }
 }

 if (checkingAccess) {
 return (
 <DashboardShell>
 <div className="flex items-center justify-center py-24">
 <div className="flex items-center gap-3 text-foreground-muted">
 <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 <span className="font-medium">Verifying access...</span>
 </div>
 </div>
 </DashboardShell>
 );
 }

 return (
 <DashboardShell>
 <div className="glass-panel p-8 rounded-3xl">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold mb-1 tracking-tight">All Content</h1>
 <p className="text-foreground-muted text-sm">
 Every post across the platform, from every user.
 </p>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap items-center gap-3 mb-6">
 <div className="flex gap-1 p-1 rounded-xl bg-background-secondary border border-surface-border ">
 {STATUS_TABS.map((tab) => (
 <button
 key={tab.value}
 onClick={() => setStatusFilter(tab.value)}
 className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
 statusFilter === tab.value
 ? "bg-surface shadow-sm text-brand-600 "
 : "text-foreground-muted hover:text-foreground "
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="surface-field px-3.5 py-2 rounded-xl text-xs font-medium bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50"
 >
 <option value="">All Roles</option>
 <option value="creator">Content Creator</option>
 <option value="marketing">Marketing Team</option>
 <option value="business">Business User</option>
 <option value="admin">Administrator</option>
 </select>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-6 py-3 px-4 rounded-xl">
 {error}
 </div>
 )}

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wide border-b border-surface-border ">
 <th className="py-3 px-4">Content</th>
 <th className="py-3 px-4">Posted By</th>
 <th className="py-3 px-4">Role</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-divider">
 {loading ? (
 <>
 <SkeletonRow />
 <SkeletonRow />
 <SkeletonRow />
 </>
 ) : posts.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-12 text-center text-foreground-muted">
 No content matches these filters.
 </td>
 </tr>
 ) : (
 posts.map((post) => (
 <tr key={post.id} className="hover:bg-background-secondary transition-colors">
 <td className="py-3.5 px-4 max-w-xs">
 <p className="text-foreground truncate">
 {post.content || "Empty post"}
 </p>
 <div className="flex items-center gap-1 mt-1">
 {(post.platforms || []).map((p) => (
 <span
 key={p}
 title={PLATFORM_META[p]?.label}
 className={`w-3 h-3 rounded-full ${PLATFORM_META[p]?.color || "bg-background-secondary"}`}
 />
 ))}
 </div>
 </td>
 <td className="py-3.5 px-4 text-foreground-subtle ">
 {post.owner_name || "Unknown"}
 </td>
 <td className="py-3.5 px-4">
 <span
 className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
 ROLE_BADGE[post.owner_role] || ROLE_BADGE.creator
 }`}
 >
 {post.owner_role || "creator"}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <StatusBadge status={post.status} />
 </td>
 <td className="py-3.5 px-4 text-foreground-muted ">
 {post.scheduled_at || post.published_at || post.created_at
 ? new Date(
 post.scheduled_at || post.published_at || post.created_at
 ).toLocaleDateString(undefined, { month: "short", day: "numeric" })
 : "—"}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </DashboardShell>
 );
}