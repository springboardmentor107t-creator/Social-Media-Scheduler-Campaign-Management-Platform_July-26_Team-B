"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";
import { THEMES, getStoredTheme, applyTheme } from "../../lib/theme";

const ROLE_LABEL = {
 creator: "Content Creator",
 marketing: "Marketing Team",
 business: "Business User",
 admin: "Administrator",
};

const TABS = [
 { value: "profile", label: "Profile" },
 { value: "account", label: "Account" },
 { value: "security", label: "Security" },
 { value: "preferences", label: "Preferences" },
];

function fieldClass(extra = "") {
 return `surface-field w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-foreground-muted ${extra}`;
}

export default function SettingsPage() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState("profile");
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState("");
 const [message, setMessage] = useState("");

 const [fullName, setFullName] = useState("");
 const [username, setUsername] = useState("");
 const [bio, setBio] = useState("");
 const [email, setEmail] = useState("");
 const [role, setRole] = useState("");
 const [timezone, setTimezone] = useState("Asia/Kolkata");
 const [avatarPreview, setAvatarPreview] = useState(null);

 const [currentPassword, setCurrentPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmNewPassword, setConfirmNewPassword] = useState("");
 const [theme, setTheme] = useState("system");

 async function fetchProfile() {
 try {
 const response = await api.get("/api/v1/auth/me");
 setFullName(response.data.full_name || "");
 setEmail(response.data.email || "");
 setRole(response.data.role || "");
 setUsername(response.data.username || "");
 } catch (err) {
 setError("Could not load account details.");
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchProfile();
 // Theme setter removed to avoid synchronous update in effect
 }, []);

 function handleAvatarChange(e) {
 const file = e.target.files[0];
 if (file) setAvatarPreview(URL.createObjectURL(file));
 }

 async function handleSaveProfile(e) {
 e.preventDefault();
 setError("");
 setMessage("");
 setSaving(true);
 try {
 await api.put("/api/v1/auth/me", { full_name: fullName, email });
 setMessage("Profile updated successfully.");
 } catch (err) {
 setError("Could not save profile changes.");
 } finally {
 setSaving(false);
 }
 }

 async function handleSaveAccount(e) {
 e.preventDefault();
 setError("");
 setMessage("");
 setSaving(true);
 try {
 await api.put("/api/v1/auth/me", { full_name: fullName, email });
 setMessage("Account details updated.");
 } catch (err) {
 setError("Could not save account changes.");
 } finally {
 setSaving(false);
 }
 }

 const strength = evaluatePasswordStrength(newPassword);
 const passwordsMatch = newPassword && newPassword === confirmNewPassword;

 async function handleChangePassword(e) {
 e.preventDefault();
 setError("");
 setMessage("");

 if (!passwordsMatch) {
 setError("New passwords do not match.");
 return;
 }
 if (strength.score < 4) {
 setError("Choose a stronger new password.");
 return;
 }

 setSaving(true);
 try {
 await api.put("/api/v1/auth/change-password", {
 current_password: currentPassword,
 new_password: newPassword,
 });
 setMessage("Password changed successfully.");
 setCurrentPassword("");
 setNewPassword("");
 setConfirmNewPassword("");
 } catch (err) {
 setError("Could not change password. Check your current password.");
 } finally {
 setSaving(false);
 }
 }

 function handleThemeSelect(value) {
 setTheme(value);
 applyTheme(value);
 }

 function handleLogout() {
 logout();
 }

 const initials = fullName
 ? fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
 : "";

 if (loading) {
 return (
 <DashboardShell>
 <div className="flex items-center justify-center py-24">
 <div className="flex items-center gap-3 text-foreground-muted">
 <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 <span className="font-medium">Loading settings...</span>
 </div>
 </div>
 </DashboardShell>
 );
 }

 return (
 <DashboardShell>
 <div className="glass-panel p-6 sm:p-8 rounded-3xl">
 <h1 className="text-2xl font-bold mb-1 tracking-tight">Settings</h1>
 <p className="text-foreground-muted text-sm mb-6">
 Manage your profile, account, and preferences.
 </p>

 {/* Tabs */}
 <div className="flex gap-1 p-1 mb-6 rounded-xl bg-background-secondary border border-surface-border w-fit overflow-x-auto">
 {TABS.map((tab) => (
 <button
 key={tab.value}
 onClick={() => {
 setActiveTab(tab.value);
 setError("");
 setMessage("");
 }}
 className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
 activeTab === tab.value
 ? "bg-surface shadow-sm text-brand-600 "
 : "text-foreground-muted hover:text-foreground "
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-6 py-3 px-4 rounded-xl">
 {error}
 </div>
 )}
 {message && (
 <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm mb-6 py-3 px-4 rounded-xl">
 {message}
 </div>
 )}

 {/* Profile tab */}
 {activeTab === "profile" && (
 <form onSubmit={handleSaveProfile} className="max-w-xl space-y-6">
 <div>
 <label className="block mb-2 text-sm font-semibold text-foreground ">
 Profile Photo
 </label>
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white text-lg font-bold shadow-sm overflow-hidden">
 {avatarPreview ? (
 <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
 ) : (
 initials
 )}
 </div>
 <label className="px-4 py-2 rounded-xl border border-surface-border text-sm font-medium hover:bg-background-secondary cursor-pointer transition-colors">
 Change Photo
 <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
 </label>
 </div>
 <p className="text-xs text-foreground-muted mt-2">
 Photo upload is currently preview-only pending backend support.
 </p>
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Full Name
 </label>
 <input
 type="text"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 required
 className={fieldClass()}
 />
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Username
 </label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">
 @
 </span>
 <input
 type="text"
 value={username}
 onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
 placeholder="yourname"
 className={fieldClass("pl-8")}
 />
 </div>
 <p className="text-xs text-foreground-muted mt-1.5">
 Shown under your name across the dashboard.
 </p>
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Bio
 </label>
 <textarea
 value={bio}
 onChange={(e) => setBio(e.target.value)}
 rows={3}
 placeholder="A short line about you or your team..."
 className={fieldClass("resize-none")}
 />
 </div>

 <button
 type="submit"
 disabled={saving}
 className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-70"
 >
 {saving ? "Saving..." : "Save Profile"}
 </button>
 </form>
 )}

 {/* Account tab */}
 {activeTab === "account" && (
 <form onSubmit={handleSaveAccount} className="max-w-xl space-y-6">
 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Email Address
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className={fieldClass()}
 />
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Role
 </label>
 <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-background-secondary ">
 <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 ">
 {ROLE_LABEL[role] || role}
 </span>
 <span className="text-xs text-foreground-muted ml-auto">
 Contact an administrator to change your role.
 </span>
 </div>
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Time Zone
 </label>
 <select
 value={timezone}
 onChange={(e) => setTimezone(e.target.value)}
 className={fieldClass()}
 >
 <option value="Asia/Kolkata">(GMT+5:30) Asia/Kolkata</option>
 <option value="America/New_York">(GMT-5:00) America/New York</option>
 <option value="Europe/London">(GMT+0:00) Europe/London</option>
 <option value="Asia/Dubai">(GMT+4:00) Asia/Dubai</option>
 </select>
 </div>

 <button
 type="submit"
 disabled={saving}
 className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-70"
 >
 {saving ? "Saving..." : "Save Account"}
 </button>

 <div className="pt-6 border-t border-surface-border ">
 <button
 type="button"
 onClick={handleLogout}
 className="text-red-600 font-medium text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition-colors -ml-4"
 >
 Log out of all sessions
 </button>
 </div>
 </form>
 )}

 {/* Security tab */}
 {activeTab === "security" && (
 <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Current Password
 </label>
 <input
 type="password"
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 required
 autoComplete="off"
 className={fieldClass()}
 />
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 New Password
 </label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 required
 autoComplete="new-password"
 className={fieldClass()}
 />
 {newPassword && (
 <div className="mt-2">
 <div className="flex gap-1 h-1.5 mt-2">
 {[1, 2, 3, 4, 5].map((level) => (
 <div
 key={level}
 className={`flex-1 rounded-full ${
 level <= strength.score
 ? strength.score < 3
 ? "bg-red-500"
 : strength.score < 4
 ? "bg-amber-500"
 : "bg-green-500"
 : "bg-background-secondary "
 } transition-colors`}
 />
 ))}
 </div>
 <span
 className={`text-xs font-medium ${
 strength.score < 3 ? "text-red-500" : strength.score < 4 ? "text-amber-500" : "text-green-500"
 }`}
 >
 {strength.label}
 </span>
 </div>
 )}
 </div>

 <div>
 <label className="block mb-1.5 text-sm font-semibold text-foreground ">
 Confirm New Password
 </label>
 <input
 type="password"
 value={confirmNewPassword}
 onChange={(e) => setConfirmNewPassword(e.target.value)}
 required
 autoComplete="new-password"
 className={fieldClass(
 confirmNewPassword && !passwordsMatch ? "border-red-500" : ""
 )}
 />
 {confirmNewPassword && !passwordsMatch && (
 <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
 )}
 </div>

 <button
 type="submit"
 disabled={saving}
 className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-70"
 >
 {saving ? "Updating..." : "Change Password"}
 </button>
 </form>
 )}

 {/* Preferences tab */}
 {activeTab === "preferences" && (
 <div className="max-w-xl space-y-6">
 <div>
 <label className="block mb-2 text-sm font-semibold text-foreground ">
 Theme
 </label>
 <div className="grid grid-cols-3 gap-3">
 {THEMES.map((t) => (
 <button
 key={t.value}
 onClick={() => handleThemeSelect(t.value)}
 className={`p-4 rounded-xl border text-sm font-medium transition-all ${
 theme === t.value
 ? "border-brand-500 bg-brand-500/10 text-brand-600 ring-2 ring-brand-500/20"
 : "border-surface-border hover:border-surface-border text-foreground-subtle "
 }`}
 >
 {t.label}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </DashboardShell>
 );
}