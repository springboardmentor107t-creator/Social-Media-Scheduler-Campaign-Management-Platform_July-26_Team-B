"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Guarantee clean state on mount
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/profile");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 w-full animate-in fade-in duration-500">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-8 sm:p-10 rounded-3xl"
          autoComplete="off"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
              Welcome <span className="text-gradient">Back</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Log in to your SocialPilot account
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 text-center py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="off"
                className="surface-field w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                className="surface-field w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-brand text-white py-3.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}