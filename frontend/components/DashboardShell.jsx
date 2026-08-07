"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "../lib/auth";
import api from "../lib/api";
import Link from "next/link";
import { roleConfig } from "../lib/roleConfig";
import RoleBadge from "./RoleBadge";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const response = await api.get("/api/v1/auth/me");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user in DashboardShell", err);
      // If unauthorized, could force logout here
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="font-medium text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect or fail gracefully
  }

  const role = user.role || "creator";
  const config = roleConfig[role] || roleConfig.creator;

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-6 md:px-10 md:py-10 animate-in fade-in duration-500">
      
      {/* Dashboard Header / Landing View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.landingTitle}
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {config.landingDesc}
          </p>
        </div>
        <button
          onClick={() => router.push("/posts/create")}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all"
        >
          {config.primaryAction}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <div className="sidebar-surface rounded-2xl border p-3 space-y-1 sticky top-24">
            <p className="text-xs font-bold uppercase tracking-widest px-3 py-2 text-subtle">
              Menu
            </p>
            {config.navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link block px-3 py-2.5 rounded-xl text-sm ${
                    isActive ? "sidebar-link-active" : ""
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
