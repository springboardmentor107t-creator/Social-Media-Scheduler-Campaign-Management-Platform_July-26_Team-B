"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getUser } from "../../../lib/auth";
import api from "../../../lib/api";
import { createPost } from "../../../lib/posts";
import DashboardShell from "../../../components/DashboardShell";
import RoleBadge from "../../../components/RoleBadge";
import PlatformPreviews from "../../../components/previews/PlatformPreviews";

const PLATFORM_CONFIG = {
  twitter: {
    label: "X (Twitter)",
    badgeColor: "bg-black text-white dark:bg-zinc-800",
    limit: 280,
    icon: "𝕏",
    desc: "280 characters, punchy hooks",
  },
  instagram: {
    label: "Instagram",
    badgeColor: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white",
    limit: 2200,
    icon: "📸",
    desc: "Visual feed, carousels, hashtags",
  },
  linkedin: {
    label: "LinkedIn",
    badgeColor: "bg-blue-700 text-white",
    limit: 3000,
    icon: "💼",
    desc: "Professional insights, long-form",
  },
  facebook: {
    label: "Facebook",
    badgeColor: "bg-blue-600 text-white",
    limit: 63206,
    icon: "📘",
    desc: "Broad community reach",
  },
  youtube: {
    label: "YouTube",
    badgeColor: "bg-red-600 text-white",
    limit: 5000,
    icon: "▶️",
    desc: "Community tab & short descriptions",
  },
  pinterest: {
    label: "Pinterest",
    badgeColor: "bg-red-500 text-white",
    limit: 500,
    icon: "📌",
    desc: "Visual inspiration & boards",
  },
};

const SUGGESTED_HASHTAGS = [
  "#SocialPilot",
  "#DigitalMarketing",
  "#GrowthHacking",
  "#ContentStrategy",
  "#SaaSMarketing",
  "#BrandBuilding",
  "#SocialMediaManager",
  "#AnalyticsFirst",
];

const AI_TONE_TEMPLATES = {
  professional: "Rewrite in a formal, executive tone with industry terminology.",
  engaging: "Make it exciting, conversational, and add a question at the end to drive comments.",
  punchy: "Condense into a short, high-impact bulleted hook suitable for X/Twitter.",
  promotional: "Add a compelling call-to-action urging the audience to click the link or signup.",
};

const QUICK_TIME_PRESETS = [
  { label: "Tomorrow Peak (9:00 AM)", offsetDays: 1, time: "09:00" },
  { label: "Tomorrow Afternoon (2:30 PM)", offsetDays: 1, time: "14:30" },
  { label: "Weekend Engagement (Saturday 11:00 AM)", offsetDays: 2, time: "11:00" },
];

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || "";

  const [currentUser, setCurrentUser] = useState(null);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["twitter", "linkedin"]);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState("twitter");

  // Post Schedule Mode
  const [mode, setMode] = useState(initialDate ? "schedule" : "draft");
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [endDate, setEndDate] = useState("");

  // UTM Parameters
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("");

  // AI Assistant Drawer
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    const user = getUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  async function fetchData() {
    setLoadingAccounts(true);
    try {
      const [accRes, campRes] = await Promise.allSettled([
        api.get("/api/v1/social-accounts"),
        api.get("/api/v1/campaigns"),
      ]);

      if (accRes.status === "fulfilled") {
        setAccounts(accRes.value.data || []);
        if (accRes.value.data && accRes.value.data.length > 0) {
          const connected = accRes.value.data.map((a) => a.platform);
          setSelectedPlatforms(connected.slice(0, 2));
          setActivePreviewPlatform(connected[0] || "twitter");
        }
      }

      if (campRes.status === "fulfilled") {
        setCampaigns(campRes.value.data || []);
      }
    } catch (err) {
      console.error("Error loading accounts/campaigns", err);
    } finally {
      setLoadingAccounts(false);
    }
  }

  // Handle Media Upload Simulation
  function handleMediaUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newMedia = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    setMediaFiles((prev) => [...prev, ...newMedia]);
  }

  function removeMedia(index) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function togglePlatform(platformKey) {
    setSelectedPlatforms((prev) => {
      let updated;
      if (prev.includes(platformKey)) {
        if (prev.length === 1) return prev; // Keep at least one
        updated = prev.filter((p) => p !== platformKey);
      } else {
        updated = [...prev, platformKey];
      }
      if (!updated.includes(activePreviewPlatform)) {
        setActivePreviewPlatform(updated[0] || "twitter");
      }
      return updated;
    });
  }

  function applyHashtag(tag) {
    if (!content.includes(tag)) {
      setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  }

  function applyPresetTime(preset) {
    const target = new Date();
    target.setDate(target.getDate() + preset.offsetDays);
    const dateStr = target.toISOString().split("T")[0];
    setScheduledDate(dateStr);
    setScheduledTime(preset.time);
    setMode("schedule");
  }

  // Simulated AI Tone Optimizer
  async function handleAiTone(tone) {
    if (!content.trim()) {
      setError("Please write some initial draft text first to optimize with AI.");
      return;
    }
    setAiLoading(true);
    setError("");
    setAiFeedback(`Applying ${tone} tone tuning...`);

    setTimeout(() => {
      let enhanced = content;
      if (tone === "professional") {
        enhanced = `Executive Summary: ${content.trim()}\n\nKey Strategic Takeaway: Aligning cross-functional initiatives for measurable business outcomes.`;
      } else if (tone === "engaging") {
        enhanced = `🚀 Big news! ${content.trim()}\n\n👇 What are your thoughts on this? Drop a comment below!`;
      } else if (tone === "punchy") {
        enhanced = `⚡ Hook: ${content.trim()}\n\n• Point 1: Maximum impact\n• Point 2: Rapid execution\n• Point 3: Scale faster`;
      } else if (tone === "promotional") {
        enhanced = `${content.trim()}\n\n🔥 Limited time access — explore today via the link in our bio!`;
      }
      setContent(enhanced);
      setAiLoading(false);
      setAiFeedback(`✨ AI adjusted text to ${tone} style!`);
      setTimeout(() => setAiFeedback(""), 3500);
    }, 600);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!content.trim() && mediaFiles.length === 0) {
      setError("Please enter caption text or attach at least one media item.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one social media channel.");
      return;
    }

    let finalScheduledAt = null;
    let finalStatus = "draft";

    if (mode === "schedule") {
      if (!scheduledDate) {
        setError("Please choose a schedule date.");
        return;
      }
      if (!scheduledTime) {
        setError("Please choose a schedule time.");
        return;
      }
      finalScheduledAt = `${scheduledDate}T${scheduledTime}:00`;
      finalStatus = "scheduled";
    } else if (mode === "now") {
      finalStatus = "scheduled";
      finalScheduledAt = new Date().toISOString();
    }

    // Append UTM tags if configured
    let finalContent = content;
    if (showUtmBuilder && utmCampaign) {
      const utmString = `?utm_source=${utmSource || "social"}&utm_medium=${utmMedium}&utm_campaign=${encodeURIComponent(
        utmCampaign
      )}`;
      finalContent = `${content}\n\n[Campaign Tracking: ${utmString}]`;
    }

    const payload = {
      content: finalContent,
      platforms: selectedPlatforms,
      status: finalStatus,
      scheduledAt: finalScheduledAt,
      campaign_id: selectedCampaignId ? parseInt(selectedCampaignId) : null,
      recurrence: recurring
        ? {
            frequency,
            end_date: endDate || null,
          }
        : null,
      media_urls: mediaFiles.map((m) => m.preview || m.name),
    };

    setSubmitting(true);
    try {
      await createPost(payload);
      setSuccess(
        mode === "schedule"
          ? "🎉 Post successfully queued & scheduled!"
          : mode === "now"
          ? "🚀 Publishing dispatched immediately!"
          : "💾 Draft saved to Post Library!"
      );
      setTimeout(() => {
        router.push("/posts");
      }, 1200);
    } catch (err) {
      setError(err?.friendlyMessage || "Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeLimit = PLATFORM_CONFIG[activePreviewPlatform]?.limit || 280;
  const currentChars = content.length;
  const charPercent = Math.min(100, Math.round((currentChars / activeLimit) * 100));

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Omnichannel Content Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
              Pro Composer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Author once, fine-tune across 6 networks, and preview live before scheduling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/posts"
            className="px-4 py-2 rounded-xl border border-surface-border text-xs sm:text-sm font-semibold hover:bg-foreground/[0.04] transition-colors"
          >
            ← View Post Library
          </Link>
        </div>
      </div>

      {/* Main Studio Grid: 2 Columns (Editor vs. Live Omnichannel Preview) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Composer Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* 1. Target Channels Selection */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                1. Select Target Social Channels
              </label>
              <span className="text-xs text-brand-500 font-semibold">
                {selectedPlatforms.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(PLATFORM_CONFIG).map(([key, info]) => {
                const isSelected = selectedPlatforms.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePlatform(key)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-500 bg-brand-500/10 text-foreground shadow-sm scale-[1.01]"
                        : "border-surface-border bg-surface hover:border-foreground/20 text-foreground-muted"
                    }`}
                  >
                    <span className="text-xl">{info.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{info.label}</p>
                      <p className="text-[10px] text-foreground-muted truncate">
                        Max {info.limit} chars
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Content Studio Editor & AI Assist */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                2. Post Caption & Copy
              </label>
              {/* Character Limit Ring */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold ${
                    currentChars > activeLimit ? "text-rose-500" : "text-foreground-muted"
                  }`}
                >
                  {currentChars} / {activeLimit}
                </span>
                <div className="w-12 h-2 rounded-full bg-foreground/[0.08] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      charPercent > 90 ? "bg-rose-500" : "bg-brand-500"
                    }`}
                    style={{ width: `${charPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Assistant Quick Bar */}
            <div className="p-3 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-brand-500">
                  <span>✨</span> AI Tone Assistant:
                </span>
                {aiFeedback && (
                  <span className="text-[11px] font-semibold text-emerald-500 animate-pulse">
                    {aiFeedback}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(AI_TONE_TEMPLATES).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleAiTone(tone)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-surface border border-surface-border hover:border-brand-500 hover:text-brand-500 transition-all capitalize"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to publish? Write a compelling hook or story..."
                rows={6}
                className="w-full p-4 rounded-2xl bg-surface border border-surface-border text-foreground placeholder:text-foreground-muted/60 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y transition-all"
              />
            </div>

            {/* Suggested Hashtags */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                Trending Hashtags (Click to Add):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyHashtag(tag)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-foreground/[0.04] hover:bg-brand-500/10 hover:text-brand-500 border border-surface-border transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Media Upload & Asset Attachment */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                3. Media Assets & Visuals
              </label>
              <span className="text-xs text-foreground-muted font-medium">
                Supports JPG, PNG, MP4, WebM (Max 50MB)
              </span>
            </div>

            {/* Drag & Drop Canvas */}
            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-500/50 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all cursor-pointer">
              <svg
                className="w-8 h-8 text-brand-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs font-bold text-foreground">
                Click to upload or drag & drop media assets
              </p>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Aspect ratios: 1:1 (Square), 4:5 (Portrait), 16:9 (Landscape)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>

            {/* Media Previews List */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {mediaFiles.map((media, i) => (
                  <div
                    key={i}
                    className="relative group rounded-2xl overflow-hidden border border-surface-border bg-surface aspect-square"
                  >
                    <img
                      src={media.preview}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2">
                      <span className="text-[10px] text-white font-mono truncate w-full">
                        {media.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-transform hover:scale-110"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Campaign Attribution & UTM Parameters */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                4. Strategic Campaign & Tracking
              </label>
              <button
                type="button"
                onClick={() => setShowUtmBuilder(!showUtmBuilder)}
                className="text-xs text-brand-500 font-semibold hover:underline"
              >
                {showUtmBuilder ? "Hide UTM Tags" : "+ Add UTM Campaign Tags"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                  Link to Active Campaign (Optional):
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">No Campaign Assigned</option>
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.name} ({camp.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showUtmBuilder && (
              <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    UTM Source
                  </label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="e.g. twitter, linkedin"
                    className="w-full p-2.5 rounded-lg bg-surface border border-surface-border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    UTM Medium
                  </label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="e.g. social, organic"
                    className="w-full p-2.5 rounded-lg bg-surface border border-surface-border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    UTM Campaign Name
                  </label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="e.g. summer_launch_2026"
                    className="w-full p-2.5 rounded-lg bg-surface border border-surface-border text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Scheduling Cadence & Dispatch Engine */}
          <div className="card-surface p-5 rounded-3xl border border-surface-border space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              5. Publishing Cadence & Schedule
            </label>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-foreground/[0.04] border border-surface-border">
              <button
                type="button"
                onClick={() => setMode("schedule")}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === "schedule"
                    ? "bg-surface text-brand-500 shadow-md scale-[1.01]"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                📅 Schedule for Later
              </button>
              <button
                type="button"
                onClick={() => setMode("draft")}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === "draft"
                    ? "bg-surface text-brand-500 shadow-md scale-[1.01]"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                💾 Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setMode("now")}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === "now"
                    ? "bg-surface text-brand-500 shadow-md scale-[1.01]"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                🚀 Publish Immediately
              </button>
            </div>

            {/* Quick Best Time Chips */}
            {mode === "schedule" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                    Recommended Peak Times:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TIME_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPresetTime(preset)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-brand-500/10 text-brand-500 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                      Schedule Date:
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                      Schedule Time:
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                {/* Recurring Evergreen Content Switch */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Evergreen Recurring Repost</p>
                      <p className="text-[11px] text-foreground-muted">
                        Automatically repost this content on a recurring cadence
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                    />
                  </div>

                  {recurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                          Frequency:
                        </label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-surface border border-surface-border text-xs"
                        >
                          <option value="daily">Every Day</option>
                          <option value="weekly">Every Week</option>
                          <option value="biweekly">Every 2 Weeks</option>
                          <option value="monthly">Every Month</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                          Repeat Until:
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-surface border border-surface-border text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error / Success Feedback */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                {success}
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="pt-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? "Processing Dispatch..."
                  : mode === "schedule"
                  ? `📅 Confirm & Schedule for ${selectedPlatforms.length} Channels`
                  : mode === "now"
                  ? "🚀 Publish Post Immediately"
                  : "💾 Save Content as Draft"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Omnichannel Preview Screen (5 cols) */}
        <div className="xl:col-span-5">
          <div className="card-surface p-6 rounded-3xl border border-surface-border sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Live Feed Simulator</h3>
                <p className="text-xxs text-foreground-muted">Pixel-accurate network fidelity</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live Interactive
              </span>
            </div>

            {/* Channel Preview Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-foreground/[0.04] border border-surface-border overflow-x-auto scrollbar-none">
              {selectedPlatforms.map((platformKey) => {
                const info = PLATFORM_CONFIG[platformKey];
                const isActive = activePreviewPlatform === platformKey;
                return (
                  <button
                    key={platformKey}
                    type="button"
                    onClick={() => setActivePreviewPlatform(platformKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-surface text-brand-500 shadow-sm scale-[1.02]"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span>{info?.icon}</span>
                    <span>{info?.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Preview Render Box */}
            <div className="min-h-[460px] flex items-center justify-center p-2 rounded-2xl bg-foreground/[0.01] border border-surface-border/60">
              <PlatformPreviews
                platform={activePreviewPlatform}
                content={content}
                mediaFiles={mediaFiles}
                user={currentUser}
                account={accounts.find((a) => a.platform === activePreviewPlatform)}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-semibold text-foreground-muted">
          Loading Content Studio...
        </div>
      }
    >
      <CreatePostContent />
    </Suspense>
  );
}