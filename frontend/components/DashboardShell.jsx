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

  async function fetchUser() {
    try {
      const response = await api.get("/api/v1/auth/me");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user in DashboardShell", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
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
          <span className="font-semibold text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.role || "creator";
  const config = roleConfig[role] || roleConfig.creator;

  const isDashboardRoot = pathname === "/dashboard";

  const primaryHref =
    role === "admin"
      ? "/admin/users"
      : role === "marketing"
      ? "/campaigns"
      : role === "business"
      ? "/social-accounts"
      : "/posts/create";

  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 animate-in fade-in duration-300">
      {/* Dashboard Top Banner (Only on Root Dashboard) */}
      {isDashboardRoot ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 pb-5 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {config.landingTitle}
              </h1>
              <RoleBadge role={role} />
            </div>
            <p className="text-foreground-muted text-xs sm:text-sm">
              {config.landingDesc}
            </p>
          </div>
          <button
            onClick={() => router.push(primaryHref)}
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all self-start sm:self-auto cursor-pointer"
          >
            {config.primaryAction}
          </button>
        </div>
      ) : (
        /* Subpage Compact Context Bar */
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border text-xs text-foreground-muted">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hover:text-brand-600 font-semibold transition-colors"
            >
              Workspace
            </Link>
            <span>/</span>
            <span className="text-foreground font-bold capitalize">
              {pathname.replace("/", "").replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={role} />
          </div>
        </div>
      )}

      {/* Mobile/Tablet Swipeable Navigation Bar (<1024px) */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl card-surface border w-max">
          {config.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.03]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Desktop Sticky Left Sidebar (>=1024px) */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
          <div className="card-surface p-4 rounded-3xl border sticky top-24 space-y-1">
            <h2 className="text-xxs font-bold uppercase tracking-wider px-3 py-2 text-foreground-muted">
              Workspace Navigation
            </h2>
            <nav className="flex flex-col gap-1">
              {config.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-500/10 text-brand-600 font-bold"
                        : "text-foreground-subtle hover:text-foreground hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 xl:col-span-10 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
