"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../../lib/auth";
import api from "../../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await api.get("/users/me");
      setName(response.data.name || "");
      setEmail(response.data.email || "");
    } catch (err) {
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.put("/users/me", { name, email });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-100">
        <p className="text-beige-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100 px-4">
      <div className="bg-beige-50 p-10 rounded-2xl shadow-lg border border-beige-300 w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-2 text-center text-beige-900">
          My Profile
        </h1>
        <p className="text-center text-beige-600 mb-8 text-sm">
          Manage your account details
        </p>

        {error && (
          <p className="bg-beige-200 text-beige-800 text-sm mb-4 text-center py-2 px-3 rounded-lg">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-beige-300 text-beige-900 text-sm mb-4 text-center py-2 px-3 rounded-lg">
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate}>
          <div className="mb-5">
            <label className="block mb-1.5 text-sm font-medium text-beige-800">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1.5 text-sm font-medium text-beige-800">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-beige-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-beige-700 text-white py-2.5 rounded-lg font-medium hover:bg-beige-800 active:scale-[0.98] transition disabled:opacity-50 mb-3"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-transparent border border-beige-400 text-beige-800 py-2.5 rounded-lg font-medium hover:bg-beige-200 transition"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}