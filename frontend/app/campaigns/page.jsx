"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";

export default function CampaignsPage() {
 const router = useRouter();
 const [campaigns, setCampaigns] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [statusFilter, setStatusFilter] = useState("all");
 
 // Create Campaign Modal State
 const [showModal, setShowModal] = useState(false);
 const [newCampaign, setNewCampaign] = useState({
 name: "",
 description: "",
 target_audience: "",
 budget: "",
 start_date: "",
 end_date: "",
 status: "draft"
 });
 const [creating, setCreating] = useState(false);

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchCampaigns();
 }, []);

 async function fetchCampaigns() {
 setLoading(true);
 setError("");
 try {
 const response = await api.get("/api/v1/campaigns");
 setCampaigns(response.data || []);
 } catch (err) {
 setError("Failed to fetch campaigns. Please try again.");
 } finally {
 setLoading(false);
 }
 }

 async function handleCreateCampaign(e) {
 e.preventDefault();
 setError("");
 setCreating(true);
 try {
 const data = {
 name: newCampaign.name,
 description: newCampaign.description || null,
 target_audience: newCampaign.target_audience || null,
 budget: newCampaign.budget ? parseFloat(newCampaign.budget) : 0.0,
 start_date: newCampaign.start_date ? newCampaign.start_date + "T00:00:00Z" : null,
 end_date: newCampaign.end_date ? newCampaign.end_date + "T00:00:00Z" : null,
 status: newCampaign.status
 };
 const response = await api.post("/api/v1/campaigns", data);
 setCampaigns((prev) => [response.data, ...prev]);
 setShowModal(false);
 setNewCampaign({
 name: "",
 description: "",
 target_audience: "",
 budget: "",
 start_date: "",
 end_date: "",
 status: "draft"
 });
 } catch (err) {
 setError("Failed to create campaign. Check fields and try again.");
 } finally {
 setCreating(false);
 }
 }

 async function handleDeleteCampaign(id, e) {
 e.stopPropagation();
 if (!confirm("Are you sure you want to delete this campaign? This action is permanent.")) {
 return;
 }
 try {
 await api.delete(`/api/v1/campaigns/${id}`);
 setCampaigns((prev) => prev.filter((c) => c.id !== id));
 } catch (err) {
 setError("Could not delete the campaign.");
 }
 }

 const filteredCampaigns = campaigns.filter((c) => {
 if (statusFilter === "all") return true;
 return c.status === statusFilter;
 });

 const inputClass =
 "w-full px-4 py-2.5 rounded-xl bg-field-bg border border-field-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-field-border-focus transition-all placeholder-field-placeholder text-field-color text-sm";

 return (
 <DashboardShell>
 <div className="space-y-6">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">
 Campaigns
 </h1>
 <p className="text-sm text-foreground-muted">
 Create, manage, and coordinate your multi-channel marketing campaigns.
 </p>
 </div>
 <button
 onClick={() => setShowModal(true)}
 className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all hover:shadow-brand-500/30 text-sm"
 >
 + Create Campaign
 </button>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl flex items-center gap-2">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
 {error}
 </div>
 )}

 {/* Filter bar */}
 <div className="flex flex-wrap gap-2 p-1 bg-background-secondary border border-surface-border rounded-xl w-fit">
 {["all", "draft", "active", "paused", "completed"].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
 statusFilter === status
 ? "bg-surface-raised shadow-sm text-brand-600"
 : "text-foreground-muted hover:text-foreground"
 }`}
 >
 {status}
 </button>
 ))}
 </div>

 {/* Campaign List Grid */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-48 bg-background-secondary rounded-2xl animate-pulse" />
 ))}
 </div>
 ) : filteredCampaigns.length === 0 ? (
 <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto flex flex-col items-center">
 <span className="text-4xl mb-4">🚀</span>
 <h3 className="text-lg font-bold mb-1 text-foreground">No campaigns found</h3>
 <p className="text-sm text-foreground-muted mb-6">
 You haven't created any campaigns matching this filter yet. Start building one now!
 </p>
 <button
 onClick={() => setShowModal(true)}
 className="bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-medium text-sm"
 >
 + Create First Campaign
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {filteredCampaigns.map((camp) => (
 <div
 key={camp.id}
 onClick={() => router.push(`/campaigns/${camp.id}`)}
 className="glass-panel p-6 rounded-3xl cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between gap-4 mb-3">
 <h3 className="text-lg font-bold text-foreground tracking-tight line-clamp-1">
 {camp.name}
 </h3>
 <StatusBadge status={camp.status} />
 </div>
 <p className="text-sm text-foreground-muted line-clamp-2 mb-4">
 {camp.description || "No description provided."}
 </p>
 </div>

 <div className="space-y-3 pt-4 border-t border-divider">
 <div className="flex justify-between items-center text-xs">
 <span className="text-foreground-muted font-medium">Budget:</span>
 <span className="font-semibold text-foreground">
 ${camp.budget?.toLocaleString() || "0"}
 </span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-foreground-muted font-medium">Audience:</span>
 <span className="font-semibold text-foreground truncate max-w-[180px]">
 {camp.target_audience || "General"}
 </span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-foreground-muted font-medium">Timeline:</span>
 <span className="font-semibold text-foreground-subtle">
 {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : "TBD"} -{" "}
 {camp.end_date ? new Date(camp.end_date).toLocaleDateString() : "TBD"}
 </span>
 </div>

 <div className="flex justify-end pt-2">
 <button
 onClick={(e) => handleDeleteCampaign(camp.id, e)}
 className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
 >
 Delete
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal for creating campaign */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
 <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
 <button
 onClick={() => setShowModal(false)}
 className="absolute top-4 right-4 text-foreground-subtle hover:text-foreground text-lg"
 >
 ✕
 </button>
 <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">Create Campaign</h2>
 <p className="text-xs text-foreground-muted mb-6">Create a new unified marketing container.</p>

 <form onSubmit={handleCreateCampaign} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Campaign Name
 </label>
 <input
 type="text"
 required
 value={newCampaign.name}
 onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
 className={inputClass}
 placeholder="e.g. Summer Product Launch"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Description
 </label>
 <textarea
 value={newCampaign.description}
 onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
 className={inputClass + " resize-none"}
 rows={3}
 placeholder="Describe campaign goals and messaging..."
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Target Audience
 </label>
 <input
 type="text"
 value={newCampaign.target_audience}
 onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
 className={inputClass}
 placeholder="e.g. Developers 18-35"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Budget ($)
 </label>
 <input
 type="number"
 value={newCampaign.budget}
 onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
 className={inputClass}
 placeholder="e.g. 5000"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Start Date
 </label>
 <input
 type="date"
 value={newCampaign.start_date}
 onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
 className={inputClass}
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 End Date
 </label>
 <input
 type="date"
 value={newCampaign.end_date}
 onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
 className={inputClass}
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
 Initial Status
 </label>
 <select
 value={newCampaign.status}
 onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
 className={inputClass}
 >
 <option value="draft">Draft</option>
 <option value="active">Active</option>
 <option value="paused">Paused</option>
 </select>
 </div>

 <div className="pt-4 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground-muted hover:bg-background-secondary transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={creating}
 className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-75"
 >
 {creating ? "Creating..." : "Create Campaign"}
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
