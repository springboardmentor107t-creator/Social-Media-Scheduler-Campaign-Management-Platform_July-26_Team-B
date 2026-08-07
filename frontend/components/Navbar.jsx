"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, logout } from "../lib/auth";
import api from "../lib/api";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    if (!isLoggedIn()) {
      setUser(null);
      setChecked(true);
      return;
    }
    try {
      const response = await api.get("/api/v1/auth/me");
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setChecked(true);
    }
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="nav-surface sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Social<span className="text-brand-500">Pilot</span>
          </span>
        </Link>

        {!checked ? (
          <div className="w-8 h-8" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                {user.full_name}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-1.5 z-20 shadow-xl">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/social-accounts"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Connected Accounts
                  </Link>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1.5" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        ) : (
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/login"
              className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full transition-all shadow-md shadow-brand-500/20 active:scale-95"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}