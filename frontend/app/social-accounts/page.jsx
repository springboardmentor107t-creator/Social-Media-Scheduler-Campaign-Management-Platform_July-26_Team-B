"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";

const PLATFORMS = ["Twitter", "Instagram", "LinkedIn", "Facebook"];

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
      const response = await api.get("/social-accounts");
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
      await api.post("/social-accounts/connect", { platform });
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
      await api.delete(`/social-accounts/${id}`);
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
      <div className="min-h-screen flex items-center justify-center bg-beige-100">
        <p className="text-beige-700">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 text-center text-beige-900">
          Social Accounts
        </h1>
        <p className="text-center text-beige-600 mb-8 text-sm">
          Connect your social media accounts to manage them here
        </p>

        {error && (
          <p className="bg-beige-200 text-beige-800 text-sm mb-6 text-center py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {PLATFORMS.map((platform) => {
            const connected = isConnected(platform);
            const isBusy = actionLoading === platform || actionLoading === connected?.id;

            return (
              <div
                key={platform}
                className="bg-beige-50 border border-beige-300 rounded-xl p-5 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-medium text-beige-900">{platform}</p>
                  <p className="text-sm text-beige-600">
                    {connected ? `Connected as ${connected.handle || "account"}` : "Not connected"}
                  </p>
                </div>

                {connected ? (
                  <button
                    onClick={() => handleDisconnect(connected.id)}
                    disabled={isBusy}
                    className="px-4 py-2 rounded-lg border border-beige-400 text-beige-800 text-sm font-medium hover:bg-beige-200 transition disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Disconnect"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isBusy}
                    className="px-4 py-2 rounded-lg bg-beige-700 text-white text-sm font-medium hover:bg-beige-800 transition disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Connect"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}