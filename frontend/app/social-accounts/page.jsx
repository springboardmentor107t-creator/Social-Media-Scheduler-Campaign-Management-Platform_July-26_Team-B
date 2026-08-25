"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { SkeletonCard } from "../../components/skeletons";

const PLATFORM_CONFIG = {
  twitter: {
    label: "X (formerly Twitter)",
    color: "bg-sky-500",
    gradient: "from-sky-500 to-blue-600",
    icon: "𝕏",
    scope: "Tweet, read, and manage direct messages",
  },
  instagram: {
    label: "Instagram Business",
    color: "bg-pink-600",
    gradient: "from-yellow-400 via-pink-500 to-purple-600",
    icon: "📸",
    scope: "Publish feed photos, reels, and stories",
  },
  linkedin: {
    label: "LinkedIn Company / Profile",
    color: "bg-blue-700",
    gradient: "from-blue-700 to-cyan-600",
    icon: "💼",
    scope: "Share posts, articles, and monitor analytics",
  },
  facebook: {
    label: "Facebook Pages",
    color: "bg-blue-600",
    gradient: "from-blue-600 to-indigo-600",
    icon: "📘",
    scope: "Manage page feed, comments, and insights",
  },
  youtube: {
    label: "YouTube Community",
    color: "bg-red-600",
    gradient: "from-red-600 to-rose-700",
    icon: "▶️",
    scope: "Upload videos and publish community posts",
  },
  pinterest: {
    label: "Pinterest Business",
    color: "bg-red-500",
    gradient: "from-red-500 to-pink-600",
    icon: "📌",
    scope: "Create pins and manage promotional boards",
  },
};

export default function SocialAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Connect Modal State
  const [connectModalPlatform, setConnectModalPlatform] = useState(null);
  const [customHandle, setCustomHandle] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/v1/social-accounts");
      setAccounts(response.data || []);
    } catch (err) {
      setError(
        err.friendlyMessage || "Could not load connected social media accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(platform, handle = "") {
    setActionLoading(platform);
    setError("");
    setSuccess("");
    try {
      const accountName = handle.trim()
        ? handle.trim().replace(/^@/, "")
        : `${platform}_official`;

      await api.post("/api/v1/social-accounts/connect", {
        platform,
        account_name: `@${accountName}`,
        platform_user_id: `auth_${platform}_${Date.now()}`,
        access_token: `token_${platform}_${Math.random().toString(36).substring(7)}`,
      });

      setConnectModalPlatform(null);
      setCustomHandle("");
      setSuccess(`Successfully connected ${PLATFORM_CONFIG[platform]?.label || platform}!`);
      await fetchAccounts();
    } catch (err) {
      setError(err.friendlyMessage || `Could not connect ${platform}.`);
    } finally {
      setActionLoading("");
    }
  }

  async function handleDisconnect(id, platformName) {
    if (!confirm(`Are you sure you want to disconnect ${platformName}? Scheduled posts for this platform may be paused.`)) return;

    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/v1/social-accounts/${id}`);
      setSuccess(`Disconnected ${platformName}.`);
      await fetchAccounts();
    } catch (err) {
      setError(err.friendlyMessage || "Could not disconnect account.");
    } finally {
      setActionLoading("");
    }
  }

  function getConnectedAccount(platform) {
    return accounts.find((a) => a.platform === platform);
  }

  const connectedCount = accounts.length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Social Media Channels & Integrations
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Link your brand accounts via OAuth to enable multi-channel publishing and live analytics tracking.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 font-bold text-xs">
              {connectedCount} / {Object.keys(PLATFORM_CONFIG).length} Channels Active
            </span>
          </div>
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
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm py-3 px-4 rounded-xl flex items-center gap-2 animate-in fade-in">
            <span>✓</span> {success}
          </div>
        )}

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <SkeletonCard count={6} />
          ) : (
            Object.entries(PLATFORM_CONFIG).map(([platformKey, meta]) => {
              const connected = getConnectedAccount(platformKey);
              const isBusy =
                actionLoading === platformKey ||
                actionLoading === connected?.id;

              return (
                <div
                  key={platformKey}
                  className={`card-surface p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    connected
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : "hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Channel Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${meta.gradient} text-white flex items-center justify-center font-bold text-base shadow-sm`}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">
                            {meta.label}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                connected
                                  ? "bg-emerald-500 animate-pulse"
                                  : "bg-foreground/20"
                              }`}
                            />
                            <span className="text-xxs font-semibold text-foreground-subtle">
                              {connected ? "Connected & Active" : "Not Linked"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Details or Permissions info */}
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-surface-border mb-4">
                      {connected ? (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-foreground truncate">
                            {connected.account_name}
                          </p>
                          <p className="text-xxs text-foreground-subtle font-mono truncate">
                            ID: {connected.platform_user_id}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xxs text-foreground-muted leading-relaxed">
                          {meta.scope}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {connected ? (
                      <button
                        onClick={() =>
                          handleDisconnect(connected.id, meta.label)
                        }
                        disabled={isBusy}
                        className="w-full py-2.5 rounded-xl border border-surface-border text-foreground hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold hover:bg-rose-500/5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy ? "Disconnecting..." : "Disconnect Channel"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setConnectModalPlatform(platformKey);
                          setCustomHandle("");
                        }}
                        disabled={isBusy}
                        className="w-full py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy ? "Linking..." : "+ Connect Account"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Connect Social Account Simulation */}
        {connectModalPlatform && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setConnectModalPlatform(null)}
          >
            <div
              className="card-surface w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setConnectModalPlatform(null)}
                className="absolute top-5 right-5 text-foreground-subtle hover:text-foreground text-lg"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${
                    PLATFORM_CONFIG[connectModalPlatform]?.gradient
                  } text-white flex items-center justify-center font-bold text-base shadow-sm`}
                >
                  {PLATFORM_CONFIG[connectModalPlatform]?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    Connect {PLATFORM_CONFIG[connectModalPlatform]?.label}
                  </h2>
                  <p className="text-xxs text-foreground-muted">
                    Authorize SocialPilot OAuth 2.0 Integration
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-surface-border mb-5 text-xs text-foreground-muted space-y-2">
                <p className="font-semibold text-foreground">
                  Permissions to be granted:
                </p>
                <ul className="list-disc list-inside text-xxs space-y-1 text-foreground-subtle">
                  <li>Publish scheduled text, image, and video updates</li>
                  <li>Fetch post impressions, reach, and engagement data</li>
                  <li>Synchronize audience analytics metrics</li>
                </ul>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect(connectModalPlatform, customHandle);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Account Handle / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value)}
                    placeholder={`e.g. @${connectModalPlatform}_brand`}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm text-foreground"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConnectModalPlatform(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-foreground-muted hover:bg-foreground/[0.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-brand text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Authorize & Connect
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