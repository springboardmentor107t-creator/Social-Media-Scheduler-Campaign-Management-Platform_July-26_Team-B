"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
import api from "../../../lib/api";
import { createPost } from "../../../lib/posts";
import DashboardShell from "../../../components/DashboardShell";

const PLATFORM_META = {
  facebook: { label: "Facebook", color: "bg-blue-600", limit: 63206 },
  instagram: { label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600", limit: 2200 },
  linkedin: { label: "LinkedIn", color: "bg-blue-700", limit: 3000 },
  twitter: { label: "X (Twitter)", color: "bg-sky-500", limit: 280 },
  youtube: { label: "YouTube", color: "bg-red-600", limit: 5000 },
  pinterest: { label: "Pinterest", color: "bg-red-500", limit: 500 },
};

const MODES = [
  { value: "draft", label: "Save as Draft" },
  { value: "now", label: "Publish Now" },
  { value: "schedule", label: "Schedule for Later" },
];

export default function CreatePostPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [mode, setMode] = useState("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [endDate, setEndDate] = useState("");

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await api.get("/api/v1/social-accounts/");
      setAccounts(response.data || []);
    } catch (err) {
      setError("Could not load connected accounts.");
    } finally {
      setLoadingAccounts(false);
    }
  }
  function handleMediaUpload(e) {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
  }

  function removeMedia(index) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function togglePlatform(platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  function isConnected(platform) {
    return accounts.some((a) => a.platform === platform);
  }

  const shortestLimit =
    selectedPlatforms.length > 0
      ? Math.min(...selectedPlatforms.map((p) => PLATFORM_META[p]?.limit || 9999))
      : null;

  const submitLabel =
    mode === "draft" ? "Save Draft" : mode === "now" ? "Publish Now" : "Schedule Post";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one platform.");
      return;
    }
    if (mode === "schedule" && (!scheduledDate || !scheduledTime)) {
      setError("Choose a date and time to schedule this post.");
      return;
    }

    let scheduledAt = null;
    if (mode === "schedule") {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    const status = mode === "draft" ? "draft" : mode === "now" ? "published" : "scheduled";

    const recurrence =
      mode === "schedule" && recurring
        ? { frequency, end_date: endDate || null }
        : null;

    setSubmitting(true);
    try {
      await createPost({
        content,
        platforms: selectedPlatforms,
        status,
        scheduledAt,
        recurrence,
      });
      setSuccess(
        mode === "draft"
          ? "Draft saved successfully."
          : mode === "now"
          ? "Post published successfully."
          : "Post scheduled successfully."
      );
      setTimeout(() => {
        router.push(mode === "draft" ? "/drafts" : "/queue");
      }, 1000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "surface-field w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 tracking-tight">Create Post</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Write your content, pick your platforms, and choose when it goes live.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm py-3 px-4 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm py-3 px-4 rounded-xl">
                {success}
              </div>
            )}

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Content
                </label>
                {shortestLimit && (
                  <span
                    className={`text-xs font-medium ${
                      content.length > shortestLimit ? "text-red-500" : "text-slate-400"
                    }`}
                  >
                    {content.length} / {shortestLimit}
                  </span>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="What do you want to share?"
                className={inputClass + " resize-none"}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Media
              </label>
              <div className="flex flex-wrap gap-3">
                {mediaFiles.map((media, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                    {media.type === "image" ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-slate-400 mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Platforms
              </label>
              {loadingAccounts ? (
                <p className="text-sm text-slate-400">Loading connected accounts...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PLATFORM_META).map(([key, meta]) => {
                    const connected = isConnected(key);
                    const selected = selectedPlatforms.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!connected}
                        onClick={() => togglePlatform(key)}
                        title={!connected ? "Connect this account first" : ""}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
                          !connected
                            ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800"
                            : selected
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${meta.color}`} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mode selector */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Publishing
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-slate-800">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === m.value
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-600 dark:text-brand-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule fields */}
            {mode === "schedule" && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Repeat this post
                  </span>
                </label>

                {recurring && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Frequency
                      </label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className={inputClass}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-brand text-white py-3.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </form>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl sticky top-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
              Preview
            </h2>
            {selectedPlatforms.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-600">
                Select a platform to see a preview.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedPlatforms.map((p) => (
                  <div
                    key={p}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full ${PLATFORM_META[p].color}`} />
                      <span className="text-sm font-semibold">{PLATFORM_META[p].label}</span>
                    </div>
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {mediaFiles.map((media, i) =>
                          media.type === "image" ? (
                            <img key={i} src={media.url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          ) : (
                            <video key={i} src={media.url} className="w-full h-20 object-cover rounded-lg" />
                          )
                        )}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {content || "Your post content will appear here..."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}