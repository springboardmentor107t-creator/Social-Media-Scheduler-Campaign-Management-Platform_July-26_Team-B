"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";

// Placeholder plan/invoice data — structured like a real billing API response.
// Swap for real endpoint (e.g. GET /api/v1/billing) once backend supports it.
const PLAN = {
  name: "Growth",
  price: 49,
  cycle: "month",
  renewsOn: "2026-09-01",
  connectedAccountsLimit: 10,
  postsPerMonthLimit: 500,
};

const USAGE = {
  connectedAccounts: 4,
  postsThisMonth: 128,
};

const INVOICES = [
  { id: "inv_1042", date: "2026-07-01", amount: 49, status: "paid" },
  { id: "inv_1017", date: "2026-06-01", amount: 49, status: "paid" },
  { id: "inv_0991", date: "2026-05-01", amount: 49, status: "paid" },
];

function UsageBar({ label, used, limit }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 85;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isHigh ? "bg-amber-500" : "bg-brand-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const response = await api.get("/api/v1/auth/me");
      const me = response.data;
      setCurrentUser(me);

      if (me.role !== "business" && me.role !== "admin") {
        router.push("/profile");
        return;
      }
      setCheckingAccess(false);
    } catch (err) {
      router.push("/login");
    }
  }

  if (checkingAccess) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="font-medium">Verifying access...</span>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current plan */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Current Plan
                </p>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{PLAN.name}</h1>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    ${PLAN.price}/{PLAN.cycle}
                  </span>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-medium shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all">
                Upgrade Plan
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Renews on{" "}
              {new Date(PLAN.renewsOn).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
              <UsageBar
                label="Connected Accounts"
                used={USAGE.connectedAccounts}
                limit={PLAN.connectedAccountsLimit}
              />
              <UsageBar
                label="Posts This Month"
                used={USAGE.postsThisMonth}
                limit={PLAN.postsPerMonthLimit}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="glass-panel p-8 rounded-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
              Payment Method
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 mb-4">
              <div className="w-10 h-7 rounded bg-slate-800 dark:bg-slate-200 flex items-center justify-center text-white dark:text-slate-900 text-[10px] font-bold">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  •••• •••• •••• 4242
                </p>
                <p className="text-xs text-slate-400">Expires 08/28</p>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Billing history */}
        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 tracking-tight">Billing History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(inv.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 capitalize">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-brand-600 dark:text-brand-400 text-xs font-medium hover:underline">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}