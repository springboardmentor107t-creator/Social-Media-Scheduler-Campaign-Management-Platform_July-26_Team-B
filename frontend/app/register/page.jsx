"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../lib/auth";
import { roleOptions } from "../../lib/roleConfig";
import Link from "next/link";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Guarantee clean state on mount
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setError("");
  }, []);

  const strength = evaluatePasswordStrength(password);
  const passwordMatch = password && password === confirmPassword;
  const canSubmit = strength.score >= 4 && passwordMatch && role;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (strength.score < 4) {
      setError("Please choose a stronger password.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      router.push("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
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
              Create <span className="text-gradient">Account</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Join SocialPilot to automate your workflow
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-6 text-center py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                autoComplete="off"
                className="surface-field w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      role === opt.value
                        ? "border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/30 dark:bg-zinc-900/30"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        role === opt.value
                          ? "border-brand-500 bg-brand-500"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {role === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mt-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full ${
                          level <= strength.score
                            ? strength.score < 3
                              ? "bg-red-500"
                              : strength.score < 4
                              ? "bg-amber-500"
                              : "bg-green-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        } transition-colors`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-xs font-medium">
                    <span
                      className={
                        strength.score < 3
                          ? "text-red-500"
                          : strength.score < 4
                          ? "text-amber-500"
                          : "text-green-500"
                      }
                    >
                      {strength.label}
                    </span>
                    {strength.score < 4 && strength.missing.length > 0 && (
                      <span className="text-slate-500 dark:text-slate-400">
                        Add {strength.missing[0]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
                  confirmPassword && !passwordMatch
                    ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                    : confirmPassword && passwordMatch
                    ? "border-green-500 focus:ring-green-500/50 focus:border-green-500"
                    : "border-slate-200 dark:border-slate-800 focus:ring-brand-500/50 focus:border-brand-500"
                } focus:outline-none focus:ring-2`}
              />
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full bg-gradient-brand text-white py-3.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}