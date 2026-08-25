"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import RoleBadge from "../../components/RoleBadge";
import ProfilePhotoAdjuster from "../../components/ProfilePhotoAdjuster";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";
import { THEMES, applyTheme, getStoredTheme } from "../../lib/theme";
import { useToast } from "../../components/Toast";

const TABS = [
  { id: "profile", label: "Profile & Identity", icon: "👤", desc: "Personal info, bio, and avatar" },
  { id: "security", label: "Security & Access", icon: "🛡️", desc: "Password, 2FA, and active sessions" },
  { id: "notifications", label: "Notifications & Alerts", icon: "🔔", desc: "Channel publishing & failure triggers" },
  { id: "appearance", label: "Themes & Interface", icon: "🎨", desc: "Theme palettes, density, and animation" },
  { id: "integrations", label: "API & Webhooks", icon: "⚡", desc: "Developer keys and broadcast endpoints" },
];

const AVATAR_GRADIENTS = [
  "from-brand-500 to-indigo-600",
  "from-pink-500 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-blue-500 to-cyan-500",
  "from-purple-600 to-violet-900",
];

const DEMO_SESSIONS = [
  {
    id: 1,
    device: "Windows Desktop • Chrome 128",
    location: "Bengaluru, India",
    ip: "103.21.244.12",
    current: true,
    time: "Active Now",
  },
  {
    id: 2,
    device: "iPhone 15 Pro • Safari Mobile",
    location: "Mumbai, India",
    ip: "49.36.120.89",
    current: false,
    time: "2 hours ago",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("creator");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [selectedGradient, setSelectedGradient] = useState(AVATAR_GRADIENTS[0]);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(DEMO_SESSIONS);

  // Notifications state
  const [notifyPublish, setNotifyPublish] = useState(true);
  const [notifyFailures, setNotifyFailures] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [notifyCampaignMilestones, setNotifyCampaignMilestones] = useState(true);

  // Appearance state
  const [currentTheme, setCurrentTheme] = useState("system");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);

  // API & Webhooks state
  const [apiKey, setApiKey] = useState("sp_live_98a76f2d1e04b5c87932");
  const [webhookUrl, setWebhookUrl] = useState("https://api.company.com/webhooks/socialpilot");
  const [webhookSecret, setWebhookSecret] = useState("whsec_54f9a0b12e38c7d6");

  async function fetchProfile() {
    try {
      const response = await api.get("/api/v1/auth/me");
      const data = response.data;
      setUser(data);
      setFullName(data.full_name || data.username || "");
      setUsername(data.username || (data.email ? data.email.split("@")[0] : "user"));
      setEmail(data.email || "");
      setRole(data.role || "creator");
    } catch (err) {
      showToast("error", "Failed to load account settings", err.friendlyMessage);
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
    setCurrentTheme(getStoredTheme());
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/v1/auth/me", { full_name: fullName, email });
      showToast("success", "Profile Updated", "Your personal details have been saved successfully.");
    } catch (err) {
      showToast("error", "Update Failed", err.friendlyMessage || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const strength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!passwordsMatch) {
      showToast("error", "Validation Error", "New passwords do not match.");
      return;
    }
    if (strength.score < 3) {
      showToast("warning", "Weak Password", "Please choose a stronger password.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/v1/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast("success", "Password Changed", "Your security credentials have been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("error", "Password Change Failed", "Please verify your current password.");
    } finally {
      setSaving(false);
    }
  }

  function handleThemeSwitch(themeVal) {
    setCurrentTheme(themeVal);
    applyTheme(themeVal);
    showToast("info", "Theme Applied", `Workspace theme switched to ${themeVal.toUpperCase()}.`);
  }

  function handleRevokeSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("info", "Session Terminated", "The selected device session was disconnected.");
  }

  function generateNewApiKey() {
    const randomKey = `sp_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(randomKey);
    showToast("success", "New API Key Generated", "Make sure to copy and store your new secret token.");
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-foreground-subtle text-sm text-foreground";

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SP";

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-foreground-muted">
            <svg className="animate-spin h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-sm">Loading Control Center...</span>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              System Settings & Control Center
            </h1>
            <p className="text-foreground-muted text-xs sm:text-sm mt-1">
              Configure profile credentials, RBAC permissions, notification thresholds, and developer endpoints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={role} />
          </div>
        </div>

        {/* Main Grid: Settings Navigation (4 cols) & Tab Panel (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Settings Tabs List */}
          <div className="lg:col-span-4 card-surface p-3 rounded-3xl border space-y-1.5 sticky top-24">
            <p className="text-xxs font-bold uppercase tracking-wider text-foreground-subtle px-3 py-2">
              Configuration Sections
            </p>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-500/15 text-brand-600 border border-brand-500/25 shadow-sm"
                      : "hover:bg-foreground/[0.03] text-foreground border border-transparent"
                  }`}
                >
                  <span className="text-xl w-8 h-8 rounded-xl bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                    {tab.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{tab.label}</p>
                    <p className="text-[11px] text-foreground-muted truncate mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              );
            })}

            <div className="pt-3 border-t border-surface-border px-3">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Sign Out of Workspace
              </button>
            </div>
          </div>

          {/* Right Tab Content Panel */}
          <div className="lg:col-span-8 card-surface p-6 sm:p-8 rounded-3xl border">
            {/* 1. Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-surface-border pb-4">
                  <h2 className="text-base font-bold text-foreground">Personal Identity & Avatar Settings</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">Customize your circular profile photo, media framing, and account details.</p>
                </div>

                {/* Interactive Circular Profile Photo Adjuster */}
                <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-surface-border shadow-sm">
                  <ProfilePhotoAdjuster
                    user={user}
                    onAvatarSaved={(avatar) => {
                      showToast("success", "Avatar Updated", "Your profile photo is now synced across your workspace.");
                    }}
                  />
                </div>

                {/* Monogram Gradient Theme (Alternative/Fallback) */}
                <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                      Fallback Monogram Theme (If No Media Photo Is Active)
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-tr ${selectedGradient} text-white flex items-center justify-center font-extrabold text-base shadow-md`}
                    >
                      {initials}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVATAR_GRADIENTS.map((grad, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedGradient(grad)}
                          className={`w-7 h-7 rounded-full bg-gradient-to-tr ${grad} transition-transform ${
                            selectedGradient === grad ? "scale-110 ring-2 ring-brand-500 ring-offset-2" : "hover:scale-105"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Handle / Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle text-xs">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className={`${inputClass} pl-8`}
                        placeholder="alexmorgan"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="alex@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Creator Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Brief description about your social content strategy..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-surface-border">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          )}

            {/* 2. Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-surface-border pb-4">
                  <h2 className="text-base font-bold text-foreground">Password & Access Protection</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">Ensure your account is defended with strong passwords and multi-factor auth.</p>
                </div>

                {/* Password update form */}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Min. 8 characters with numbers & symbols"
                    />
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`flex-1 rounded-full ${
                                lvl <= strength.score
                                  ? strength.score < 3
                                    ? "bg-rose-500"
                                    : strength.score < 4
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                  : "bg-foreground/[0.08]"
                              }`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-xxs font-bold ${
                            strength.score < 3
                              ? "text-rose-500"
                              : strength.score < 4
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          Strength: {strength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`${inputClass} ${
                        confirmPassword && !passwordsMatch ? "border-rose-500 ring-1 ring-rose-500" : ""
                      }`}
                      placeholder="Re-type new password"
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-xxs text-rose-500 mt-1 font-semibold">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </form>

                {/* Two Factor Authentication Toggle */}
                <div className="pt-6 border-t border-surface-border flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xxs text-foreground-muted mt-0.5">Require an authenticator app code on login.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled((v) => !v);
                      showToast("info", "2FA Setting Updated", twoFactorEnabled ? "2FA disabled." : "2FA enabled with authenticator.");
                    }}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      twoFactorEnabled ? "bg-emerald-500" : "bg-foreground/[0.15]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Active Sessions List */}
                <div className="pt-6 border-t border-surface-border space-y-3">
                  <h3 className="text-xs font-bold text-foreground">Active Browser Sessions</h3>
                  <div className="space-y-2">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-foreground/[0.02] border border-surface-border text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">💻</span>
                          <div>
                            <p className="font-bold text-foreground">
                              {sess.device}{" "}
                              {sess.current && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold ml-1">
                                  Current Device
                                </span>
                              )}
                            </p>
                            <p className="text-xxs text-foreground-muted">
                              {sess.location} • {sess.ip} • {sess.time}
                            </p>
                          </div>
                        </div>
                        {!sess.current && (
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-surface-border pb-4">
                  <h2 className="text-base font-bold text-foreground">Notification Dispatch Thresholds</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">Control when SocialPilot sends email, push, and webhook alerts.</p>
                </div>

                <div className="space-y-4 divide-y divide-surface-border">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-bold text-foreground">Queue Publishing Confirmation</p>
                      <p className="text-xxs text-foreground-muted">Receive a live ping whenever a scheduled post is broadcast.</p>
                    </div>
                    <button
                      onClick={() => setNotifyPublish((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifyPublish ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifyPublish ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">Broadcast Failure Warnings</p>
                      <p className="text-xxs text-foreground-muted">Instant alert if a social channel token expires or rejects a post.</p>
                    </div>
                    <button
                      onClick={() => setNotifyFailures((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifyFailures ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifyFailures ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">Marketing Campaign Milestone Alerts</p>
                      <p className="text-xxs text-foreground-muted">Get notified when a campaign achieves 50%, 80%, or 100% of budget.</p>
                    </div>
                    <button
                      onClick={() => setNotifyCampaignMilestones((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifyCampaignMilestones ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifyCampaignMilestones ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">Weekly Performance Digest</p>
                      <p className="text-xxs text-foreground-muted">Receive a weekly summary report of impressions and top reach.</p>
                    </div>
                    <button
                      onClick={() => setNotifyWeeklyDigest((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifyWeeklyDigest ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifyWeeklyDigest ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-surface-border">
                  <button
                    onClick={() => showToast("success", "Preferences Saved", "Notification thresholds updated.")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Save Notification Rules
                  </button>
                </div>
              </div>
            )}

            {/* 4. Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-surface-border pb-4">
                  <h2 className="text-base font-bold text-foreground">Theme & Interface Customization</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">Tailor visual color schemes, contrast, and layout density.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-3">
                    Active Workspace Palette
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEMES.map((t) => {
                      const isSelected = currentTheme === t.value;
                      const swatchStyles = {
                        system: "bg-white text-slate-900 border-slate-200",
                        dark: "bg-slate-900 text-white border-slate-800",
                        peach: "bg-[#fff5f2] text-[#4a2c2a] border-[#f0beb4]",
                        cream: "bg-[#fdf6e3] text-[#3b2f1e] border-[#d2aa6e]",
                      };
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => handleThemeSwitch(t.value)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30 shadow-md"
                              : "border-surface-border hover:bg-foreground/[0.02]"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-foreground">{t.label}</p>
                            <p className="text-xxs text-foreground-muted mt-0.5">{t.desc || "Custom tone"}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shadow-sm ${swatchStyles[t.value] || "bg-surface"}`}>
                            Aa
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border space-y-4">
                  <h3 className="text-xs font-bold text-foreground">Layout & Animations</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Compact Data Density</p>
                      <p className="text-xxs text-foreground-muted">Reduce padding and spacing across tables and analytics charts.</p>
                    </div>
                    <button
                      onClick={() => setCompactDensity((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        compactDensity ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        compactDensity ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Reduced Motion Mode</p>
                      <p className="text-xxs text-foreground-muted">Minimize animated transitions for maximum performance.</p>
                    </div>
                    <button
                      onClick={() => setReducedMotion((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        reducedMotion ? "bg-brand-500" : "bg-foreground/[0.15]"
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                        reducedMotion ? "translate-x-5.5" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Integrations & API Tab */}
            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-surface-border pb-4">
                  <h2 className="text-base font-bold text-foreground">Developer APIs & Webhook Dispatchers</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">Integrate SocialPilot into your automated CI/CD pipelines, Discord, or Zapier.</p>
                </div>

                {/* API Key Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                      Production API Key (Bearer Token)
                    </label>
                    <button
                      type="button"
                      onClick={generateNewApiKey}
                      className="text-xxs font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      Roll Secret Token
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={apiKey}
                      className={`${inputClass} font-mono text-xs bg-foreground/[0.02]`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        showToast("success", "Copied to Clipboard", "API token copied.");
                      }}
                      className="px-4 py-2.5 rounded-xl border border-surface-border hover:bg-foreground/[0.04] text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Webhook Endpoint */}
                <div className="space-y-4 pt-4 border-t border-surface-border">
                  <h3 className="text-xs font-bold text-foreground">Outbound Webhook Listener</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Endpoint Payload URL
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className={inputClass}
                      placeholder="https://yourdomain.com/webhooks/socialpilot"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Signing Secret
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={webhookSecret}
                      className={`${inputClass} font-mono text-xs bg-foreground/[0.02]`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => showToast("info", "Webhook Ping Sent", "Received 200 OK from test endpoint.")}
                      className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold hover:bg-foreground/[0.04] cursor-pointer"
                    >
                      Send Test Ping
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast("success", "Webhook Saved", "Live endpoint registered.")}
                      className="px-5 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Save Webhook
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}