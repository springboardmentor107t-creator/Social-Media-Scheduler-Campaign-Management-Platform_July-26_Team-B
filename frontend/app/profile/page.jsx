"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";

export default function ProfilePage() {
 const router = useRouter();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");
 const [error, setError] = useState("");

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchProfile();
 }, []);

 async function fetchProfile() {
 try {
 const response = await api.get("/api/v1/auth/me");
 setName(response.data.full_name || "");
 setEmail(response.data.email || "");
 } catch (err) {
 setError("Could not load profile.");
 } finally {
 setLoading(false);
 }
 }

 async function handleUpdate(e) {
 e.preventDefault();
 setError("");
 setMessage("");
 setSaving(true);
 try {
 await api.put("/api/v1/auth/me", { full_name: name, email });
 setMessage("Profile updated successfully.");
 } catch (err) {
 setError("Update failed. Please try again.");
 } finally {
 setSaving(false);
 }
 }

 function handleLogout() {
 logout();
 router.push("/login");
 }

 if (loading) {
 return (
 <div className="flex-1 flex items-center justify-center p-6">
 <div className="flex items-center gap-3 text-foreground-muted">
 <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 <span className="font-medium text-lg">Loading profile...</span>
 </div>
 </div>
 );
 }

 return (
 <DashboardShell>
 

 <div className="glass-panel p-8 rounded-3xl">
 <h1 className="text-2xl font-bold mb-2 tracking-tight">
 Personal Information
 </h1>
 <p className="text-foreground-muted text-sm mb-6">
 Update your personal details and how we can reach you.
 </p>

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-6 py-3 px-4 rounded-xl flex items-center gap-2">
 {error}
 </div>
 )}
 {message && (
 <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm mb-6 py-3 px-4 rounded-xl flex items-center gap-2">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
 {message}
 </div>
 )}

 <form onSubmit={handleUpdate} className="space-y-5">
 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Full Name
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-foreground-muted "
 />
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Email Address
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-foreground-muted "
 />
 </div>

 <div className="pt-4 flex items-center justify-between">
 <button
 type="button"
 onClick={handleLogout}
 className="text-red-600 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
 >
 Log out
 </button>
 <button
 type="submit"
 disabled={saving}
 className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {saving ? "Saving..." : "Save Changes"}
 </button>
 </div>
 </form>
 </div>
 </DashboardShell>
 );
}