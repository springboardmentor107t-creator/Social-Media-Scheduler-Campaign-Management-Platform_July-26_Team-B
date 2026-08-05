"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";

const PLATFORMS = ["facebook", "instagram", "linkedin", "twitter", "youtube", "pinterest"];

export default function SocialAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await api.get("/api/v1/social-accounts/");
      setAccounts(response.data || []);
    } catch (err) {
      setError("Could not load connected accounts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(platform) {
    setActionLoading(platform);
    try {
      await api.post("/api/v1/social-accounts/connect", {
        platform,
        account_name: `${platform}_account`,
        platform_user_id: `demo_${platform}_id`,
        access_token: "demo_access_token",
      });
      await fetchAccounts();
    } catch (err) {
      setError(`Could not connect ${platform}.`);
    } finally {
      setActionLoading("");
    }
  }

  async function handleDisconnect(id) {
    setActionLoading(id);
    try {
      await api.delete(`/api/v1/social-accounts/${id}`);
      await fetchAccounts();
    } catch (err) {
      setError("Could not disconnect account.");
    } finally {
      setActionLoading("");
    }
  }

  function isConnected(platform) {
    return accounts.find((a) => a.platform === platform);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="font-medium text-lg">Loading accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
        

          <div className="glass-panel p-8 rounded-3xl">
            <h1 className="text-2xl font-bold mb-2 tracking-tight">
              Social Accounts
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Connect your social media accounts to schedule and manage posts.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 py-3 px-4 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {PLATFORMS.map((platform) => {
                const connected = isConnected(platform);
                const isBusy = actionLoading === platform || actionLoading === connected?.id;

                return (
                  <div
                    key={platform}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-zinc-900/30 hover:shadow-md transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold capitalize shadow-sm ${
                        platform === 'facebook' ? 'bg-blue-600' :
                        platform === 'twitter' ? 'bg-sky-500' :
                        platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' :
                        platform === 'linkedin' ? 'bg-blue-700' :
                        platform === 'youtube' ? 'bg-red-600' : 'bg-red-500'
                      }`}>
                        {platform.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white capitalize">{platform}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {connected ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{connected.account_name}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Not connected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {connected ? (
                      <button
                        onClick={() => handleDisconnect(connected.id)}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isBusy ? "Disconnecting..." : "Disconnect"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform)}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                      >
                        {isBusy ? "Connecting..." : "Connect"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
    </DashboardShell>
  );
}