"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import RoleBadge from "../../../components/RoleBadge";
import EmptyState from "../../../components/EmptyState";
import { SkeletonCard, SkeletonTable } from "../../../components/skeletons";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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
      setError(
        err.friendlyMessage || "Could not load platform users from database."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥" },
    {
      label: "Admins & Managers",
      value: users.filter((u) => u.role === "admin" || u.role === "manager")
        .length,
      icon: "🛡️",
    },
    {
      label: "Creators & Schedulers",
      value: users.filter((u) => u.role === "creator" || u.role === "scheduler")
        .length,
      icon: "✏️",
    },
    {
      label: "Analysts & Viewers",
      value: users.filter((u) => u.role === "analyst" || u.role === "viewer")
        .length,
      icon: "📊",
    },
  ];

  if (checkingAccess) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-foreground-muted">
            <svg
              className="animate-spin h-6 w-6 text-brand-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-semibold text-sm">
              Verifying Administrator Access...
            </span>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              User Management & Access Control
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Supervise member permissions, assigned roles, and workspace account status.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            type="button"
            className="p-2.5 rounded-xl border border-surface-border text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04] transition-all cursor-pointer self-start sm:self-auto"
            title="Refresh Users"
          >
            <svg
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm py-3 px-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchUsers}
              className="underline text-xs font-semibold hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <SkeletonCard count={4} />
          ) : (
            stats.map((s) => (
              <div key={s.label} className="card-surface p-5 rounded-2xl border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    {s.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-foreground/[0.04] border border-foreground/10 flex items-center justify-center text-base">
                    {s.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-0.5">
                  {s.value}
                </p>
                <p className="text-xs text-foreground-subtle">
                  Registered in system
                </p>
              </div>
            ))
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all placeholder:text-foreground-subtle"
            />
            <svg
              className="w-4 h-4 text-foreground-subtle absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="creator">Creator</option>
            <option value="scheduler">Scheduler</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Users Table / Responsive Card List */}
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            type="search"
            title="No users found"
            description="No system users match your search criteria or role filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
          />
        ) : (
          <div className="card-surface rounded-2xl border overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-foreground/[0.02]">
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      User
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Email
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      Role & Permissions
                    </th>
                    <th className="py-3.5 px-6 font-bold uppercase tracking-wider text-xs text-foreground-muted">
                      User ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-xs uppercase">
                            {(u.username || "U")[0]}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-foreground-muted">
                        {u.email}
                      </td>
                      <td className="py-4 px-6">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-foreground-subtle">
                        #{u.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (<768px) */}
            <div className="md:hidden divide-y divide-surface-border">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-xs uppercase">
                        {(u.username || "U")[0]}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {u.username}
                        </p>
                        <p className="text-xs text-foreground-muted">{u.email}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-foreground-subtle">
                      #{u.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-foreground-subtle">Role:</span>
                    <RoleBadge role={u.role} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}