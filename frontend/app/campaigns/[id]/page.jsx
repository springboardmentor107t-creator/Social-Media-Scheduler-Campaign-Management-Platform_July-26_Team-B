"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import StatusBadge from "../../../components/StatusBadge";
import Link from "next/link";

export default function CampaignDetailPage() {
 const router = useRouter();
 const params = useParams();
 const campaignId = params.id;

 const [campaign, setCampaign] = useState(null);
 const [contents, setContents] = useState([]);
 const [analytics, setAnalytics] = useState([]);
 const [allPosts, setAllPosts] = useState([]);
 
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");

 // Modals state
 const [showAddContentModal, setShowAddContentModal] = useState(false);
 const [showLinkPostModal, setShowLinkPostModal] = useState(false);
 const [submittingContent, setSubmittingContent] = useState(false);

 // New Content form state
 const [newContent, setNewContent] = useState({
 title: "",
 content: "",
 platform: "instagram",
 scheduled_date: "",
 scheduled_time: "",
 });

 // Link Post form state
 const [selectedPostId, setSelectedPostId] = useState("");
 const [linkTitle, setLinkTitle] = useState("");
 const [linkChannel, setLinkChannel] = useState("instagram");

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchCampaignDetails();
 }, [campaignId]);

 async function fetchCampaignDetails() {
 setLoading(true);
 setError("");
 try {
 const [campaignRes, contentsRes, analyticsRes, postsRes] = await Promise.all([
 api.get(`/api/v1/campaigns/${campaignId}`),
 api.get(`/api/v1/campaigns/${campaignId}/content`),
 api.get(`/api/v1/analytics/campaign/${campaignId}`),
 api.get("/api/v1/posts"),
 ]);

 setCampaign(campaignRes.data);
 setContents(contentsRes.data || []);
 setAnalytics(analyticsRes.data || []);
 setAllPosts(postsRes.data || []);
 } catch (err) {
 console.error(err);
 setError("Failed to load campaign details.");
 } finally {
 setLoading(false);
 }
 }

 async function handleUpdateStatus(newStatus) {
 setError("");
 setSuccess("");
 try {
 const response = await api.put(`/api/v1/campaigns/${campaignId}`, {
 status: newStatus
 });
 setCampaign(response.data);
 setSuccess(`Campaign marked as ${newStatus}!`);
 } catch (err) {
 setError("Could not update campaign status.");
 }
 }

 async function handleAddContent(e) {
 e.preventDefault();
 setError("");
 setSuccess("");
 setSubmittingContent(true);

 if (!newContent.title || !newContent.content) {
 setError("Title and content are required.");
 setSubmittingContent(false);
 return;
 }

 try {
 // 1. Create a Post first
 let scheduledAt = null;
 if (newContent.scheduled_date && newContent.scheduled_time) {
 scheduledAt = new Date(`${newContent.scheduled_date}T${newContent.scheduled_time}`).toISOString();
 }

 const postRes = await api.post("/api/v1/posts", {
 content: newContent.content,
 platforms: [newContent.platform],
 status: scheduledAt ? "scheduled" : "draft",
 scheduled_at: scheduledAt
 });

 const newPost = postRes.data;

 // 2. Link this Post as CampaignContent
 const contentRes = await api.post(`/api/v1/campaigns/${campaignId}/content`, {
 title: newContent.title,
 content_type: "social_post",
 status: newPost.status,
 channel: newContent.platform,
 scheduled_time: scheduledAt,
 post_id: newPost.id
 });

 setContents((prev) => [...prev, contentRes.data]);
 setShowAddContentModal(false);
 setNewContent({
 title: "",
 content: "",
 platform: "instagram",
 scheduled_date: "",
 scheduled_time: "",
 });
 setSuccess("Post created and added to campaign!");
 } catch (err) {
 setError("Failed to add new campaign content.");
 } finally {
 setSubmittingContent(false);
 }
 }

 async function handleLinkPost(e) {
 e.preventDefault();
 setError("");
 setSuccess("");
 setSubmittingContent(true);

 if (!selectedPostId || !linkTitle) {
 setError("Please select a post and provide a title.");
 setSubmittingContent(false);
 return;
 }

 const post = allPosts.find((p) => p.id === parseInt(selectedPostId));

 try {
 const contentRes = await api.post(`/api/v1/campaigns/${campaignId}/content`, {
 title: linkTitle,
 content_type: "social_post",
 status: post.status,
 channel: linkChannel,
 scheduled_time: post.scheduled_at,
 post_id: post.id
 });

 setContents((prev) => [...prev, contentRes.data]);
 setShowLinkPostModal(false);
 setSelectedPostId("");
 setLinkTitle("");
 setSuccess("Existing post linked to campaign!");
 } catch (err) {
 setError("Failed to link post to campaign.");
 } finally {
 setSubmittingContent(false);
 }
 }

 async function handleDeleteContent(contentId) {
 if (!confirm("Remove this post from the campaign?")) return;
 setError("");
 setSuccess("");
 try {
 await api.delete(`/api/v1/campaigns/${campaignId}/content/${contentId}`);
 setContents((prev) => prev.filter((c) => c.id !== contentId));
 setSuccess("Item removed from campaign.");
 } catch (err) {
 setError("Failed to remove campaign content.");
 }
 }

 if (loading) {
 return (
 <DashboardShell>
 <div className="flex-1 flex items-center justify-center p-12">
 <div className="flex items-center gap-3 text-foreground-muted">
 <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 <span className="font-medium text-lg">Loading campaign details...</span>
 </div>
 </div>
 </DashboardShell>
 );
 }

 if (!campaign) {
 return (
 <DashboardShell>
 <div className="glass-panel p-8 rounded-3xl text-center max-w-md mx-auto">
 <span className="text-3xl mb-3">⚠️</span>
 <h2 className="text-xl font-bold mb-2">Campaign not found</h2>
 <p className="text-sm text-foreground-muted mb-6">The campaign you are looking for does not exist or you do not have permission to view it.</p>
 <Link href="/campaigns" className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-medium text-sm">
 Back to Campaigns
 </Link>
 </div>
 </DashboardShell>
 );
 }

 // Calculate campaign timeline percentage
 let timelinePercentage = 0;
 if (campaign.start_date && campaign.end_date) {
 const start = new Date(campaign.start_date).getTime();
 const end = new Date(campaign.end_date).getTime();
 const now = Date.now();
 if (now >= end) timelinePercentage = 100;
 else if (now <= start) timelinePercentage = 0;
 else timelinePercentage = Math.round(((now - start) / (end - start)) * 100);
 }

 // Calculate total metrics from database analytics records
 const totalImpressions = analytics.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
 const totalReach = analytics.reduce((acc, curr) => acc + (curr.reach || 0), 0);
 const totalLikes = analytics.reduce((acc, curr) => acc + (curr.likes || 0), 0);
 const totalComments = analytics.reduce((acc, curr) => acc + (curr.comments || 0), 0);
 const totalClicks = analytics.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

 const inputClass =
 "w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-foreground-muted text-sm";

 return (
 <DashboardShell>
 <div className="space-y-6">
 
 {/* Back Link */}
 <Link href="/campaigns" className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-brand-500 transition-colors w-fit">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
 Back to Campaigns
 </Link>

 {/* Alerts */}
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl flex items-center gap-2">
 {error}
 </div>
 )}
 {success && (
 <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2">
 {success}
 </div>
 )}

 {/* Campaign Info Panel */}
 <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-3xl font-bold tracking-tight text-foreground ">
 {campaign.name}
 </h1>
 <StatusBadge status={campaign.status} />
 </div>
 <p className="text-sm text-foreground-muted ">
 {campaign.description || "No description provided."}
 </p>
 </div>
 
 {/* Status actions */}
 <div className="flex flex-wrap gap-2">
 {campaign.status !== "active" && (
 <button
 onClick={() => handleUpdateStatus("active")}
 className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
 >
 Activate
 </button>
 )}
 {campaign.status === "active" && (
 <button
 onClick={() => handleUpdateStatus("paused")}
 className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
 >
 Pause
 </button>
 )}
 {campaign.status !== "completed" && (
 <button
 onClick={() => handleUpdateStatus("completed")}
 className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
 >
 Complete
 </button>
 )}
 </div>
 </div>

 {/* Timeline and Progress */}
 {campaign.start_date && campaign.end_date && (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs font-semibold text-foreground-muted">
 <span>Timeline Progress</span>
 <span>{timelinePercentage}% ({new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()})</span>
 </div>
 <div className="w-full h-2.5 bg-background-secondary rounded-full overflow-hidden">
 <div
 className="h-full bg-gradient-brand transition-all duration-500"
 style={{ width: `${timelinePercentage}%` }}
 />
 </div>
 </div>
 )}

 {/* Campaign details grids */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-divider ">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">Budget Allocation</p>
 <p className="text-xl font-bold text-foreground ">${campaign.budget?.toLocaleString() || "0"}</p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">Target Audience</p>
 <p className="text-sm font-semibold text-foreground truncate">{campaign.target_audience || "General"}</p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">Content Items</p>
 <p className="text-xl font-bold text-foreground ">{contents.length}</p>
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">Date Created</p>
 <p className="text-sm font-semibold text-foreground ">{new Date(campaign.created_at).toLocaleDateString()}</p>
 </div>
 </div>
 </div>

 {/* Campaign Analytics Summary */}
 {analytics.length > 0 && (
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
 <div className="glass-panel p-4 rounded-2xl text-center">
 <span className="text-lg">👁️</span>
 <p className="text-lg font-bold text-foreground mt-1">{totalImpressions.toLocaleString()}</p>
 <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Impressions</p>
 </div>
 <div className="glass-panel p-4 rounded-2xl text-center">
 <span className="text-lg">👥</span>
 <p className="text-lg font-bold text-foreground mt-1">{totalReach.toLocaleString()}</p>
 <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Reach</p>
 </div>
 <div className="glass-panel p-4 rounded-2xl text-center">
 <span className="text-lg">❤️</span>
 <p className="text-lg font-bold text-foreground mt-1">{totalLikes.toLocaleString()}</p>
 <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Likes</p>
 </div>
 <div className="glass-panel p-4 rounded-2xl text-center">
 <span className="text-lg">💬</span>
 <p className="text-lg font-bold text-foreground mt-1">{totalComments.toLocaleString()}</p>
 <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Comments</p>
 </div>
 <div className="glass-panel p-4 rounded-2xl text-center col-span-2 lg:col-span-1">
 <span className="text-lg">🖱️</span>
 <p className="text-lg font-bold text-foreground mt-1">{totalClicks.toLocaleString()}</p>
 <p className="text-xxs font-bold uppercase tracking-wider text-foreground-muted">Clicks</p>
 </div>
 </div>
 )}

 {/* Campaign Posts Section */}
 <div className="glass-panel p-6 sm:p-8 rounded-3xl">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h2 className="text-xl font-bold tracking-tight text-foreground ">
 Campaign Content
 </h2>
 <p className="text-xs text-foreground-muted ">
 Schedule posts and content associated with this campaign.
 </p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => setShowLinkPostModal(true)}
 className="border border-surface-border hover:bg-background-secondary px-4 py-2 rounded-xl text-xs font-semibold transition-all"
 >
 🔗 Link Existing Post
 </button>
 <button
 onClick={() => setShowAddContentModal(true)}
 className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
 >
 + Add New Post
 </button>
 </div>
 </div>

 {contents.length === 0 ? (
 <div className="py-12 text-center">
 <span className="text-3xl mb-2 block">📝</span>
 <h4 className="text-sm font-bold text-foreground mb-1">No content linked yet</h4>
 <p className="text-xs text-foreground-muted max-w-sm mx-auto mb-4">You haven't added or linked any posts to this campaign. Keep your strategy organized by adding scheduled posts.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {contents.map((item) => (
 <div
 key={item.id}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-surface-border rounded-2xl bg-surface/40 hover:bg-background-secondary/50 transition-all"
 >
 <div className="flex items-start gap-3 min-w-0">
 <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center font-bold text-brand-600 text-sm shrink-0">
 {item.channel?.slice(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-foreground tracking-tight leading-tight truncate">
 {item.title}
 </h4>
 <p className="text-xxs text-foreground-muted mt-1 uppercase font-semibold">
 Platform: <span className="text-foreground-muted font-bold">{item.channel}</span> | Type: <span className="text-foreground-muted font-bold">{item.content_type}</span>
 </p>
 {item.scheduled_time && (
 <p className="text-xxs text-foreground-muted mt-0.5">
 🕒 Scheduled: {new Date(item.scheduled_time).toLocaleString()}
 </p>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-4">
 <span className="text-xs uppercase tracking-wider font-bold">
 <StatusBadge status={item.status} />
 </span>
 <div className="flex items-center gap-1">
 {item.post_id && (
 <button
 onClick={() => router.push(`/posts/create?id=${item.post_id}`)}
 className="text-xxs font-bold text-brand-600 hover:text-brand-500 hover:bg-brand-500/10 px-2 py-1.5 rounded-lg transition-all"
 >
 View/Edit Post
 </button>
 )}
 <button
 onClick={() => handleDeleteContent(item.id)}
 className="text-xxs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-all"
 >
 Remove
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Modal: Add New Post */}
 {showAddContentModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
 <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-surface shadow-2xl relative">
 <button
 onClick={() => setShowAddContentModal(false)}
 className="absolute top-4 right-4 text-foreground-muted hover:text-foreground-subtle text-lg"
 >
 ✕
 </button>
 <h2 className="text-xl font-bold mb-1 tracking-tight">Add Campaign Post</h2>
 <p className="text-xs text-foreground-muted mb-6">Create and schedule a new post directly in this campaign.</p>

 <form onSubmit={handleAddContent} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Content Identifier / Title
 </label>
 <input
 type="text"
 required
 value={newContent.title}
 onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
 className={inputClass}
 placeholder="e.g. Early Bird Promo Post"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Social Media Content
 </label>
 <textarea
 required
 value={newContent.content}
 onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
 className={inputClass + " resize-none"}
 rows={4}
 placeholder="Write what you want to share..."
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Target Platform
 </label>
 <select
 value={newContent.platform}
 onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
 className={inputClass}
 >
 <option value="instagram">Instagram</option>
 <option value="facebook">Facebook</option>
 <option value="linkedin">LinkedIn</option>
 <option value="twitter">X (Twitter)</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Schedule Date
 </label>
 <input
 type="date"
 value={newContent.scheduled_date}
 onChange={(e) => setNewContent({ ...newContent, scheduled_date: e.target.value })}
 className={inputClass}
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Schedule Time
 </label>
 <input
 type="time"
 value={newContent.scheduled_time}
 onChange={(e) => setNewContent({ ...newContent, scheduled_time: e.target.value })}
 className={inputClass}
 />
 </div>

 <div className="pt-4 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setShowAddContentModal(false)}
 className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground-muted hover:bg-background-secondary transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submittingContent}
 className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-75"
 >
 {submittingContent ? "Creating..." : "Add to Campaign"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Modal: Link Existing Post */}
 {showLinkPostModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
 <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-surface shadow-2xl relative">
 <button
 onClick={() => setShowLinkPostModal(false)}
 className="absolute top-4 right-4 text-foreground-muted hover:text-foreground-subtle text-lg"
 >
 ✕
 </button>
 <h2 className="text-xl font-bold mb-1 tracking-tight">Link Existing Post</h2>
 <p className="text-xs text-foreground-muted mb-6">Choose an already created post to include in this campaign.</p>

 <form onSubmit={handleLinkPost} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Content Title
 </label>
 <input
 type="text"
 required
 value={linkTitle}
 onChange={(e) => setLinkTitle(e.target.value)}
 className={inputClass}
 placeholder="e.g. Banner Ad Post #1"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Select Post
 </label>
 <select
 required
 value={selectedPostId}
 onChange={(e) => setSelectedPostId(e.target.value)}
 className={inputClass}
 >
 <option value="">-- Select Post --</option>
 {allPosts.map((post) => (
 <option key={post.id} value={post.id}>
 [{post.status.toUpperCase()}] {post.content?.slice(0, 50)}...
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Platform Channel
 </label>
 <select
 value={linkChannel}
 onChange={(e) => setLinkChannel(e.target.value)}
 className={inputClass}
 >
 <option value="instagram">Instagram</option>
 <option value="facebook">Facebook</option>
 <option value="linkedin">LinkedIn</option>
 <option value="twitter">X (Twitter)</option>
 </select>
 </div>

 <div className="pt-4 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setShowLinkPostModal(false)}
 className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground-muted hover:bg-background-secondary transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submittingContent}
 className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-75"
 >
 {submittingContent ? "Linking..." : "Link to Campaign"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 </DashboardShell>
 );
}
