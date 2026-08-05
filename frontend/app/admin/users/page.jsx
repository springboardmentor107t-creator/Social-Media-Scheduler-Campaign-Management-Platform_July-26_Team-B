"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";

const ROLE_BADGE = {
  creator: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  marketing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  business: "bg-green-500/10 text-green-600 dark:text-green-400",
  admin: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" /></td>
      <td className="py-3 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40" /></td>
      <td className="py-3 px-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" /></td>
      <td className="py-3 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    checkAccessAndLoad();
  }, []);

  async function checkAccessAndLoad() {
    try {
      const meResponse = await api.get("/api/v1/auth/me");
      const me = meResponse.data;
      setCurrentUser(me);

      if (me.role !== "admin") {
        router.push("/profile");
        return;
      }
      setCheckingAccess(false);
      fetchUsers();
    } catch (err) {
      router.push("/login");
    }
  }

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/v1/users");
      setUsers(response.data || []);
    } catch (err) {
      setError("Could not load platform users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥" },
    { label: "Content Creators", value: users.filter((u) => u.role === "creator").length, icon: "✏️" },
    { label: "Marketing Team", value: users.filter((u) => u.role === "marketing").length, icon: "📊" },
    { label: "Business Users", value: users.filter((u) => u.role === "business").length, icon: "💼" },
  ];

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
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {s.value}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 tracking-tight">All Users</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage every account across the platform.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 py-3 px-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                        {u.full_name}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-slate-400 font-normal">(you)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            ROLE_BADGE[u.role] || ROLE_BADGE.creator
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}