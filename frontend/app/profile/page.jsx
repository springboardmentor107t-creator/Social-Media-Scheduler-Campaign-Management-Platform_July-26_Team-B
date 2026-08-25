"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import RoleBadge from "../../components/RoleBadge";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
      setUser(response.data);
      setName(response.data.full_name || response.data.username || "");
      setEmail(response.data.email || "");
    } catch (err) {
      setError(err.friendlyMessage || "Could not load user profile.");
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
      setMessage("Profile details saved successfully.");
    } catch (err) {
      setError(err.friendlyMessage || "Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-foreground-subtle text-sm text-foreground";

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Account Profile & Identity
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Manage your personal credentials, contact email, and workspace permissions.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between animate-in fade-in">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2 animate-in fade-in">
            <span>✓</span> {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Identity summary card (4 cols) */}
          <div className="md:col-span-4 card-surface p-6 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4">
            {typeof window !== "undefined" && (localStorage.getItem(`socialpilot_avatar_${user?.id || user?.email}`) || localStorage.getItem("socialpilot_current_avatar")) ? (
              (() => {
                const av = JSON.parse(localStorage.getItem(`socialpilot_avatar_${user?.id || user?.email}`) || localStorage.getItem("socialpilot_current_avatar"));
                return (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500/50 shadow-xl relative bg-surface">
                    <img
                      src={av.src}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${av.zoom || 1}) translate(${av.panX || 0}px, ${av.panY || 0}px) rotate(${av.rotation || 0}deg)`,
                        filter: av.filter || "none",
                      }}
                    />
                  </div>
                );
              })()
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-brand text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-md shadow-brand-500/20">
                {(name || user?.username || "U")[0]}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="px-3 py-1 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 text-xxs font-bold transition-all flex items-center gap-1.5"
            >
              <span>📷</span> Adjust Photo in Settings
            </button>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {name || user?.username || "User"}
              </h2>
              <p className="text-xs text-foreground-muted">{email}</p>
            </div>
            {user?.role && <RoleBadge role={user.role} />}

            <div className="w-full pt-4 border-t border-surface-border text-xs text-foreground-subtle space-y-2">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono font-bold text-foreground">
                  #{user?.id || "1"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-500 font-semibold">Active</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer mt-2"
            >
              Sign Out of Session
            </button>
          </div>

          {/* Edit form (8 cols) */}
          <div className="md:col-span-8 card-surface p-6 sm:p-8 rounded-3xl border">
            <h3 className="text-base font-bold text-foreground mb-4">
              Edit Account Information
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Full Name / Username
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Primary Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Assigned Platform Role
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.role?.toUpperCase() || "CREATOR"}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-surface-border text-foreground-subtle text-sm font-semibold cursor-not-allowed"
                />
                <p className="text-xxs text-foreground-subtle mt-1">
                  Roles and permissions are governed by workspace administrators.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}