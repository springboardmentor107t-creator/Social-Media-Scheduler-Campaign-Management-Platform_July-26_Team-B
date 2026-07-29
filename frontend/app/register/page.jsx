"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      router.push("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-beige-50 p-10 rounded-2xl shadow-lg border border-beige-300 w-full max-w-md"
      >
        <h1 className="text-3xl font-semibold mb-2 text-center text-beige-900">
          Create Account
        </h1>
        <p className="text-center text-beige-600 mb-8 text-sm">
          Sign up to get started
        </p>

        {error && (
          <p className="bg-beige-200 text-beige-800 text-sm mb-4 text-center py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="mb-5">
          <label className="block mb-1.5 text-sm font-medium text-beige-800">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-sm font-medium text-beige-800">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-sm font-medium text-beige-800">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1.5 text-sm font-medium text-beige-800">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-beige-700 text-white py-2.5 rounded-lg font-medium hover:bg-beige-800 active:scale-[0.98] transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-beige-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-beige-800 font-medium hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}