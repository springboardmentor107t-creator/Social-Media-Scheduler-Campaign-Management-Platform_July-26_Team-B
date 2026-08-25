"use client";

import { useState, useEffect, useId, useMemo } from "react";
import Link from "next/link";
import { useToast } from "../components/Toast";

// ── Real-Time Mock Stream for Live Dispatches ──────────────────────────────
const INITIAL_LIVE_DISPATCHES = [
  {
    id: 1,
    platform: "twitter",
    handle: "@techpulse_io",
    content: "🚀 Unleashing our AI Engine 2.0 with sub-100ms dispatch latency. #BuildInPublic",
    reach: "+4.2k Impressions",
    time: "2s ago",
    status: "Published",
  },
  {
    id: 2,
    platform: "linkedin",
    handle: "Sarah Lin (Chief Growth)",
    content: "Why asynchronous campaign orchestration beats manual posting by 400%. Full analysis inside 📊",
    reach: "+89 Reshares",
    time: "14s ago",
    status: "Published",
  },
  {
    id: 3,
    platform: "instagram",
    handle: "@horizon_studios",
    content: "Visual storytelling in 2026: Carousel automation breakdown with 9:16 smart-crop. ✨",
    reach: "+1,240 Likes",
    time: "35s ago",
    status: "Published",
  },
  {
    id: 4,
    platform: "tiktok",
    handle: "@creatorflow_lab",
    content: "Viral Hook Formula #4: How we reached 1.2M viewers with zero ad spend 🎬",
    reach: "+18.4k Views",
    time: "1m ago",
    status: "Published",
  },
  {
    id: 5,
    platform: "youtube",
    handle: "VenturePulse Daily",
    content: "Automated Shorts Scheduling: How top media agencies scale to 10 channels effortlessly 📈",
    reach: "+6.8k Views",
    time: "2m ago",
    status: "Published",
  },
];

const PRESETS = [
  {
    id: "launch",
    label: "🚀 Product Launch",
    twitter: "Introducing SocialPilot v2.0: The unified autonomous command center for multi-platform publishing, real-time analytics, and team approval workflows. Experience the speed. 🔥\n\nTry it free: socialpilot.io",
    linkedin: "We are thrilled to announce SocialPilot v2.0!\n\nManaging 10+ social accounts manually is broken. Our new platform brings:\n✅ Multi-Channel Sync\n✅ AI Virality Scoring\n✅ Multi-tier Approval Workflows\n✅ Real-time Audience Heatmaps\n\nScale your brand without scaling the headache. Link in comments.",
    instagram: "Level up your social orchestration 🚀 SocialPilot v2.0 is officially LIVE! Link in bio to start your 14-day Pro access with zero friction.",
    hashtags: ["#ProductLaunch", "#SocialMediaAI", "#GrowthHacking", "#TechInnovations"],
    viralScore: 98,
    bestTime: "18:30 IST / Peak Global Engagement",
  },
  {
    id: "insight",
    label: "💡 Growth Insight",
    twitter: "Consistency is not about posting every 2 hours. It's about showing up at your audience's exact cognitive peak.\n\nOur data across 14M posts shows that timing optimization boosts engagement by 3.4x. 📊",
    linkedin: "The biggest mistake B2B brands make on social media in 2026:\n\nTreating all platforms identically.\n\nHere is how top 1% marketing leaders repurpose a single insight into 4 distinct native formats in under 60 seconds with SocialPilot.",
    instagram: "Stop posting blindly. 🎯 Optimize your schedule with real-time predictive heatmaps.",
    hashtags: ["#MarketingStrategy", "#AnalyticsInsight", "#ContentCreation", "#B2BGrowth"],
    viralScore: 94,
    bestTime: "14:15 IST / High B2B Activity",
  },
  {
    id: "behind",
    label: "🔥 Behind The Scenes",
    twitter: "Building in public day 180: How our engineering team reduced multi-channel API dispatch latency to <80ms. Thread coming soon 🧵⚡",
    linkedin: "Behind every seamless product is months of relentless iteration. Here is what we learned building an enterprise-grade social scheduler that handles 100k posts daily with zero dropped webhooks.",
    instagram: "Behind the scenes at SocialPilot HQ ☕ Building the future of autonomous social growth.",
    hashtags: ["#BuildInPublic", "#EngineeringExcellence", "#SaaSBuilding", "#StartupJourney"],
    viralScore: 91,
    bestTime: "20:00 IST / High Creator Resonance",
  },
];

export default function Home() {
  const { addToast } = useToast();
  
  // Real-time live follower counter & posts counter simulation
  const [liveFollowers, setLiveFollowers] = useState(24819420);
  const [livePostsToday, setLivePostsToday] = useState(148924);
  const [followerIncrement, setFollowerIncrement] = useState(14);
  const [liveStreamPaused, setLiveStreamPaused] = useState(false);
  const [streamFilter, setStreamFilter] = useState("all");
  const [dispatches, setDispatches] = useState(INITIAL_LIVE_DISPATCHES);

  // Interactive Composer Sandbox State
  const [selectedPreset, setSelectedPreset] = useState("launch");
  const [activePlatform, setActivePlatform] = useState("twitter");
  const [customText, setCustomText] = useState(PRESETS[0].twitter);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Interactive ROI Calculator State
  const [accountsCount, setAccountsCount] = useState(6);
  const [postsPerWeek, setPostsPerWeek] = useState(24);

  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Interactive Testimonial Filter State
  const [testimonialFilter, setTestimonialFilter] = useState("all");

  // Email Lead Sandbox
  const [inviteEmail, setInviteEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Sync composer text when preset or platform changes
  const activePresetObj = useMemo(() => {
    return PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
  }, [selectedPreset]);

  useEffect(() => {
    if (activePlatform === "twitter") {
      setCustomText(activePresetObj.twitter);
    } else if (activePlatform === "linkedin") {
      setCustomText(activePresetObj.linkedin);
    } else {
      setCustomText(activePresetObj.instagram);
    }
  }, [selectedPreset, activePlatform, activePresetObj]);

  // Live ticking counter effects
  useEffect(() => {
    const timer = setInterval(() => {
      const inc = Math.floor(Math.random() * 9) + 4;
      setFollowerIncrement(inc);
      setLiveFollowers((prev) => prev + inc);
      setLivePostsToday((prev) => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  // Live dispatch stream generator
  useEffect(() => {
    if (liveStreamPaused) return;

    const streamInterval = setInterval(() => {
      const handles = ["@growth_forge", "@sam_media", "Elena Rostova", "@vibe_agency", "Nexus AI Hub", "@solocreator"];
      const platforms = ["twitter", "linkedin", "instagram", "tiktok", "youtube"];
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      const randomHandle = handles[Math.floor(Math.random() * handles.length)];
      const reachList = ["+2.1k Reach", "+540 Reshares", "+3.8k Views", "+890 Likes", "+14.2k Impressions"];

      const newDispatch = {
        id: Date.now(),
        platform: randomPlatform,
        handle: randomHandle,
        content: `Autonomous campaign batch #${Math.floor(Math.random() * 900 + 100)} synced across global channels seamlessly. 🚀`,
        reach: reachList[Math.floor(Math.random() * reachList.length)],
        time: "Just now",
        status: "Published",
      };

      setDispatches((prev) => [newDispatch, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(streamInterval);
  }, [liveStreamPaused]);

  // Dynamic ROI Calculations
  const calculatedSavings = useMemo(() => {
    const hoursSavedPerMonth = ((accountsCount * postsPerWeek * 0.45 * 4.33)).toFixed(1);
    const estimatedReachBoost = Math.min(650, Math.round(accountsCount * 22 + postsPerWeek * 5.5));
    const moneySaved = Math.round(Number(hoursSavedPerMonth) * 48);
    return {
      hours: hoursSavedPerMonth,
      reachBoost: estimatedReachBoost,
      costSavings: moneySaved,
    };
  }, [accountsCount, postsPerWeek]);

  // Handle schedule simulator
  const handleSimulateSchedule = () => {
    setScheduledCount((c) => c + 1);
    addToast(
      `🎉 Post scheduled successfully to ${activePlatform.toUpperCase()}! Queue slot: ${activePresetObj.bestTime.split('/')[0]}`,
      "success"
    );
  };

  // Handle newsletter lead
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      addToast("Please enter a valid email address.", "error");
      return;
    }
    setSubscribed(true);
    addToast("🌟 Welcome to the VIP Early Access cohort! Access link dispatched.", "success");
    setInviteEmail("");
  };

  // Append hashtag helper
  const handleAddHashtag = (tag) => {
    if (!customText.includes(tag)) {
      setCustomText((prev) => `${prev} ${tag}`);
      addToast(`Added ${tag} to your draft`, "info");
    }
  };

  // Testimonials Data
  const TESTIMONIALS = [
    {
      name: "Marcus Vance",
      role: "Head of Growth, ScaleVenture",
      avatar: "MV",
      type: "saas",
      stat: "+380% Reach in 60 Days",
      text: "SocialPilot eliminated our manual scheduling chaos. We orchestrate 18 brand accounts with zero missed slots and automated approval safeguards.",
    },
    {
      name: "Aria Chen",
      role: "Solo Creator & Tech Podcaster",
      avatar: "AC",
      type: "creator",
      stat: "1.4M Organic Impressions",
      text: "The AI Virality score and instant 1-to-N repurposing saved me 15 hours a week. It feels like having a senior marketing team in my pocket.",
    },
    {
      name: "Devon Reynolds",
      role: "Founder, Apex Media Agency",
      avatar: "DR",
      type: "agency",
      stat: "42 Client Workspaces Managed",
      text: "Role-based approvals and client reviewer links made client sign-offs 5x faster. The interface is breathtakingly fast and reliable.",
    },
    {
      name: "Sophia Martinez",
      role: "VP Marketing, NovaCloud AI",
      avatar: "SM",
      type: "saas",
      stat: "12,000+ Clicks Tracked",
      text: "The predictive heatmap accurately flags when our B2B audience is active. Our LinkedIn engagement jumped 4.2x in our first quarter.",
    },
  ];

  const filteredTestimonials = useMemo(() => {
    if (testimonialFilter === "all") return TESTIMONIALS;
    return TESTIMONIALS.filter((t) => t.type === testimonialFilter);
  }, [testimonialFilter]);

  // FAQ Data
  const FAQS = [
    {
      q: "How does SocialPilot automate multi-platform scheduling?",
      a: "SocialPilot connects seamlessly with X (Twitter), LinkedIn, Instagram, TikTok, YouTube, and Facebook via official enterprise APIs. You can compose once, adjust platform-specific nuances with AI suggestions, and schedule to automated queue time slots optimized for your unique audience timezone.",
    },
    {
      q: "Can I manage team roles, client reviews, and approval workflows?",
      a: "Yes! SocialPilot includes built-in multi-tier role management (Admin, Manager, Content Creator, Client Reviewer). Creators can submit drafts which trigger real-time notifications for managers to approve or request changes before any post goes live.",
    },
    {
      q: "How accurate is the Live Follower and Predictive Analytics engine?",
      a: "Our predictive engine aggregates rolling engagement velocity across your connected social channels, calculating optimal posting windows, engagement virality metrics, and sentiment trends in sub-second queries.",
    },
    {
      q: "Is there a free trial or free tier available?",
      a: "Absolutely. You can get started immediately with our full-featured 14-day Pro trial with no credit card required. After the trial, you can stay on our generous Free tier or upgrade to Pro/Enterprise anytime.",
    },
    {
      q: "How does SocialPilot keep my social media accounts safe?",
      a: "All tokens are encrypted using AES-256 and OAuth2 protocols with zero plaintext storage. We adhere to official platform rate limits and API guidelines to safeguard your accounts 24/7.",
    },
  ];

  const filteredDispatches = useMemo(() => {
    if (streamFilter === "all") return dispatches;
    return dispatches.filter((d) => d.platform === streamFilter);
  }, [dispatches, streamFilter]);

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative overflow-hidden font-sans select-none">
      {/* ── AMBIENT BACKGROUND GLOW & GRID OVERLAY ───────────────────────── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-brand-500/10 via-purple-500/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-16 md:pb-24 flex flex-col items-center text-center">
        
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 mb-8 backdrop-blur-md shadow-sm transition-all hover:border-brand-500/50 hover:bg-brand-500/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-radar-wave absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">Social Engine v2.4 Active</span>
          <span className="text-foreground-subtle">|</span>
          <span className="hidden sm:inline text-foreground-muted font-normal">99.98% Autonomous Dispatch Accuracy</span>
        </div>

        {/* Dynamic Holographic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.08] max-w-5xl mx-auto mb-6">
          Orchestrate, Schedule & <br className="hidden sm:inline" />
          <span className="text-gradient drop-shadow-sm">Scale Your Social Universe</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          The next-generation command center engineered for high-growth creators, marketing agencies, and brands. 
          Auto-schedule across 6+ networks, predict viral timing, and streamline team approvals in one unified, silky-smooth workspace.
        </p>

        {/* CTA Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-12">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-brand text-white font-semibold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 group"
          >
            <span>Start Free Orchestration</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <a
            href="#live-sandbox"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel font-medium text-foreground text-base hover:bg-surface-raised transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <span className="text-brand-500 font-bold">⚡</span>
            <span>Live Interactive Demo</span>
          </a>
        </div>

        {/* Social Proof & Rating Badge */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 pb-2 text-xs sm:text-sm text-foreground-subtle border-t border-divider/60 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-flex h-7 w-7 rounded-full ring-2 ring-background bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-[10px] font-bold text-white">MK</span>
              <span className="inline-flex h-7 w-7 rounded-full ring-2 ring-background bg-gradient-to-br from-pink-500 to-rose-600 items-center justify-center text-[10px] font-bold text-white">AL</span>
              <span className="inline-flex h-7 w-7 rounded-full ring-2 ring-background bg-gradient-to-br from-amber-500 to-orange-600 items-center justify-center text-[10px] font-bold text-white">JD</span>
              <span className="inline-flex h-7 w-7 rounded-full ring-2 ring-background bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center text-[10px] font-bold text-white">SL</span>
            </div>
            <span className="font-semibold text-foreground">24,000+ Brands & Creators</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-500">
            <span>★★★★★</span>
            <span className="font-bold text-foreground ml-1">4.98 / 5</span>
            <span className="text-foreground-subtle">(1,840+ reviews)</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>No Credit Card Required</span>
          </div>
        </div>

      </section>

      {/* ── LIVE REAL-TIME METRICS & FOLLOWER PULSE BAR ──────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-border shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            
            {/* Metric 1: Live Follower Growth Stream */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-foreground-subtle">Audience Reached</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  +{followerIncrement}/s
                </span>
              </div>
              <div suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {liveFollowers.toLocaleString("en-US")}
              </div>
              <p className="text-xs text-foreground-subtle">Live real-time follower impressions</p>
            </div>

            {/* Metric 2: Posts Dispatched */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-foreground-subtle">Dispatched Today</span>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">100% On-Time</span>
              </div>
              <div suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {livePostsToday.toLocaleString("en-US")}
              </div>
              <p className="text-xs text-foreground-subtle">Automated cross-network posts</p>
            </div>

            {/* Metric 3: Reach Acceleration */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-foreground-subtle">Reach Multiplier</span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">AI Timing</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                +348% <span className="text-base text-foreground-muted font-medium">Avg</span>
              </div>
              <p className="text-xs text-foreground-subtle">Engagement surge via predictive queue</p>
            </div>

            {/* Metric 4: Platform Sync Latency */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-foreground-subtle">Dispatch Latency</span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Global Edge</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                &lt; 92ms
              </div>
              <p className="text-xs text-foreground-subtle">Multi-channel OAuth sync speed</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── REAL-TIME SOCIAL RADAR (LIVE PUBLISHING STREAM) ─────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase tracking-wider font-bold text-brand-600 dark:text-brand-400">Global Publishing Stream</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Live Social Network Activity Radar
            </h2>
          </div>

          {/* Controls: Pause & Filter */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl glass-panel text-xs font-medium">
              {["all", "twitter", "linkedin", "instagram", "tiktok"].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setStreamFilter(plat)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    streamFilter === plat
                      ? "bg-brand-500 text-white font-semibold shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLiveStreamPaused(!liveStreamPaused)}
              title={liveStreamPaused ? "Resume Live Feed" : "Pause Live Feed"}
              className="p-2 rounded-xl glass-panel text-foreground-muted hover:text-foreground text-xs flex items-center gap-1.5 transition-colors"
            >
              {liveStreamPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
        </div>

        {/* Live Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDispatches.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-2xl border border-surface-border hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    item.platform === "twitter" ? "bg-black dark:bg-neutral-800" :
                    item.platform === "linkedin" ? "bg-blue-600" :
                    item.platform === "instagram" ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" :
                    item.platform === "tiktok" ? "bg-neutral-900" : "bg-red-600"
                  }`}>
                    {item.platform === "twitter" ? "𝕏" :
                     item.platform === "linkedin" ? "in" :
                     item.platform === "instagram" ? "📸" :
                     item.platform === "tiktok" ? "🎵" : "▶"}
                  </span>
                  <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{item.handle}</span>
                </div>
                <span className="text-[10px] text-foreground-subtle font-medium">{item.time}</span>
              </div>

              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-divider text-[11px]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.reach}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-foreground-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE LIVE COMPOSER & AI OPTIMIZER SANDBOX ─────────────── */}
      <section id="live-sandbox" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
            <span>✨ Interactive Studio Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Test The Autonomous Studio Live
          </h2>
          <p className="text-foreground-muted mt-3 text-base sm:text-lg">
            Experience how SocialPilot auto-formats content, calculates virality potential, and simulates live multi-platform dispatch in real time.
          </p>
        </div>

        {/* Sandbox Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl relative">
          
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-divider mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">Preset Samples:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedPreset === preset.id
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                        : "glass-panel text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground-subtle">Simulated Scheduled:</span>
              <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-xs">
                {scheduledCount} Queued
              </span>
            </div>
          </div>

          {/* Grid Layout: Editor on Left, Live Mockup on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Platform Selector & Smart Composer */}
            <div className="lg:col-span-7 flex flex-col space-y-5">
              
              {/* Platform Switcher */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-surface-border">
                {[
                  { id: "twitter", name: "X / Twitter", icon: "𝕏", maxChars: 280 },
                  { id: "linkedin", name: "LinkedIn", icon: "in", maxChars: 3000 },
                  { id: "instagram", name: "Instagram", icon: "📸", maxChars: 2200 },
                ].map((plat) => (
                  <button
                    key={plat.id}
                    onClick={() => setActivePlatform(plat.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      activePlatform === plat.id
                        ? "bg-gradient-brand text-white shadow-md"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface/50"
                    }`}
                  >
                    <span>{plat.icon}</span>
                    <span>{plat.name}</span>
                  </button>
                ))}
              </div>

              {/* Textarea Area */}
              <div className="relative">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={6}
                  placeholder="Compose your post or tweak the preset..."
                  className="w-full p-4 rounded-2xl surface-field text-foreground text-sm leading-relaxed resize-none focus:outline-none border border-surface-border"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-foreground-subtle">
                  <span>
                    Characters: <strong className="text-foreground">{customText.length}</strong> /{" "}
                    {activePlatform === "twitter" ? 280 : 3000}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Safe for publishing</span>
                </div>
              </div>

              {/* Smart Hashtag Injector */}
              <div>
                <span className="text-xs font-semibold text-foreground-subtle block mb-2">
                  AI Suggested High-Velocity Hashtags (Click to inject):
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePresetObj.hashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddHashtag(tag)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 transition-all hover:scale-105"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSimulateSchedule}
                  className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🚀 Simulate Queue Dispatch</span>
                </button>
                <button
                  onClick={() => addToast("✨ AI Copilot refined tone for maximal audience engagement!", "info")}
                  className="px-4 py-3 rounded-xl glass-panel text-foreground text-xs font-semibold hover:bg-surface-raised transition-all flex items-center gap-1.5"
                >
                  <span>🪄 AI Polish Tone</span>
                </button>
              </div>

            </div>

            {/* Right Column: Authentic Live Mockup & AI Virality Meter */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              
              {/* AI Virality Radar Meter */}
              <div className="p-4 rounded-2xl glass-panel border border-brand-500/20 bg-brand-500/[0.03]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">AI Virality Index</span>
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                    {activePresetObj.viralScore} / 100
                  </span>
                </div>
                <div className="w-full bg-divider h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${activePresetObj.viralScore}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <span className="text-amber-500 font-bold">⏰ Recommended:</span>
                  <span>{activePresetObj.bestTime}</span>
                </div>
              </div>

              {/* Realistic Live Social Mockup Frame */}
              <div className="p-5 rounded-2xl glass-panel border border-surface-border shadow-md relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white text-xs">
                      SP
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground">SocialPilot Official</span>
                        <span className="text-brand-500 text-[10px]">✓</span>
                      </div>
                      <span className="text-[10px] text-foreground-subtle">
                        {activePlatform === "twitter" ? "@socialpilot_app" : "Company • Marketing Tech"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-foreground-subtle font-mono">Mock Preview</span>
                </div>

                <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed py-2 font-normal">
                  {customText}
                </div>

                {/* Platform Action Bar */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-divider text-foreground-subtle text-xs">
                  <div className="flex items-center gap-4">
                    <span className="hover:text-foreground transition-colors cursor-pointer">💬 34</span>
                    <span className="hover:text-foreground transition-colors cursor-pointer">🔁 128</span>
                    <span className="hover:text-foreground transition-colors cursor-pointer">❤️ 892</span>
                    <span className="hover:text-foreground transition-colors cursor-pointer">📊 14.8k</span>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">Preview Mode</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── BENTO-GRID INNOVATION SHOWCASE ──────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
            <span>⚡ Next-Gen Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Engineered for Modern Social Domination
          </h2>
          <p className="text-foreground-muted mt-3 text-base sm:text-lg">
            Everything your brand or agency needs to orchestrate hyper-engaging campaigns across the digital landscape.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          
          {/* Bento 1: Autonomous Multi-Channel Queue Matrix */}
          <div className="glass-glow-card p-8 rounded-3xl flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-6">
                📅
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3">
                Autonomous Multi-Platform Time-Warp Queue
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Define recurring evergreen time slots per timezone. SocialPilot automatically pulls top-performing drafts and distributes them at calculated audience wake-up and peak engagement intervals.
              </p>
            </div>

            {/* Interactive Timeline Mock */}
            <div className="p-4 rounded-2xl bg-surface-raised border border-surface-border grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block mb-1">09:15 AM (Morning Spike)</span>
                <span className="font-semibold text-foreground">𝕏 Daily Industry Take</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block mb-1">02:30 PM (Midday B2B)</span>
                <span className="font-semibold text-foreground">💼 LinkedIn Carousel</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mb-1">08:00 PM (Prime Time)</span>
                <span className="font-semibold text-foreground">📸 Instagram Reel</span>
              </div>
            </div>
          </div>

          {/* Bento 2: 1-to-N Repurposing Engine */}
          <div className="glass-glow-card p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-6">
                ⚡
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3">
                1-to-N Auto Repurposing
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Write once. Our contextual AI transforms your core idea into tailored tweets, deep LinkedIn reflections, and Instagram video hooks automatically.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-surface-border text-xs flex items-center justify-between">
              <span className="font-semibold text-foreground">1 Prompt</span>
              <span className="text-brand-500 font-bold">➔</span>
              <span className="font-semibold text-foreground">6 Native Formats</span>
            </div>
          </div>

          {/* Bento 3: Real-Time Predictive Heatmaps */}
          <div className="glass-glow-card p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-6">
                📈
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3">
                Predictive Heatmaps
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Never guess the best time to post again. Heatmaps model when your exact followers open their apps, boosting algorithmic reach by up to 340%.
              </p>
            </div>

            <div className="flex items-center gap-1 justify-between pt-2">
              {[40, 65, 90, 100, 75, 50, 85].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-teal-400"
                    style={{ height: `${val * 0.4}px` }}
                  />
                  <span className="text-[9px] text-foreground-subtle">
                    {["M", "T", "W", "T", "F", "S", "S"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento 4: Enterprise Role Approvals */}
          <div className="glass-glow-card p-8 rounded-3xl flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3">
                Enterprise Multi-Tier Governance & Approvals
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Empower your content creators while locking down your brand safety. Set mandatory approval stages where senior reviewers or clients must sign off before live publishing triggers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-surface-raised border border-surface-border text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 font-semibold">1. Creator Drafts</span>
              <span className="text-foreground-subtle">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-semibold">2. Manager Reviews</span>
              <span className="text-foreground-subtle">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold">3. Auto Dispatched</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── INTERACTIVE ROI & TIME-SAVINGS CALCULATOR ───────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-border shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Sliders */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-2">
                  <span>📊 Interactive ROI Estimator</span>
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">
                  Calculate Your Team's Growth & Savings
                </h2>
                <p className="text-foreground-muted text-sm mt-2">
                  See how much time and agency overhead SocialPilot eliminates each month.
                </p>
              </div>

              {/* Slider 1: Social Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">
                    Connected Social Channels:
                  </label>
                  <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {accountsCount} Channels
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={accountsCount}
                  onChange={(e) => setAccountsCount(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>1 (Solo Creator)</span>
                  <span>20 (Brand)</span>
                  <span>40+ (Agency)</span>
                </div>
              </div>

              {/* Slider 2: Weekly Posts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">
                    Target Posts Scheduled per Week:
                  </label>
                  <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {postsPerWeek} Posts / Wk
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-foreground-subtle">
                  <span>5 Posts</span>
                  <span>50 Posts</span>
                  <span>100+ Posts</span>
                </div>
              </div>

            </div>

            {/* Right: Results Display */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-raised border border-brand-500/20 shadow-inner flex flex-col space-y-6">
              <h3 className="text-lg font-extrabold text-foreground border-b border-divider pb-3">
                Estimated Monthly Impact
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-muted font-medium">⏱️ Time Saved / Month:</span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {calculatedSavings.hours} hrs
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-muted font-medium">🚀 Reach Boost Velocity:</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    +{calculatedSavings.reachBoost}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-muted font-medium">💰 Est. Team Cost Reduction:</span>
                  <span suppressHydrationWarning className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    ${calculatedSavings.costSavings.toLocaleString("en-US")} / mo
                  </span>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-gradient-brand text-white text-center font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Claim Your Free Trial Today ➔
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURE MATRIX COMPARISON (SOCIALPILOT VS TRADITIONAL) ───────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Why High-Growth Teams Choose SocialPilot
          </h2>
          <p className="text-foreground-muted mt-2 text-sm sm:text-base">
            See how SocialPilot outperforms legacy social media schedulers in every category.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse glass-panel rounded-2xl overflow-hidden text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-raised">
                <th className="p-4 sm:p-5 font-bold text-foreground">Capability</th>
                <th className="p-4 sm:p-5 font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/10">
                  ⚡ SocialPilot v2.0
                </th>
                <th className="p-4 sm:p-5 font-medium text-foreground-muted">Legacy Schedulers</th>
                <th className="p-4 sm:p-5 font-medium text-foreground-muted">Manual Posting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Sub-100ms Edge Dispatching</td>
                <td className="p-4 sm:p-5 text-emerald-600 font-bold bg-brand-500/5">✅ Real-Time Webhooks</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">❌ Laggy Cron Jobs</td>
                <td className="p-4 sm:p-5 text-rose-500">❌ High Human Error</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">1-to-N Native AI Repurposing</td>
                <td className="p-4 sm:p-5 text-emerald-600 font-bold bg-brand-500/5">✅ Auto-Formats 6 Networks</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">⚠️ Generic Copy-Paste</td>
                <td className="p-4 sm:p-5 text-rose-500">❌ 45 mins / post</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Multi-Tier Role Approvals</td>
                <td className="p-4 sm:p-5 text-emerald-600 font-bold bg-brand-500/5">✅ Built-in Client Reviewers</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">⚠️ Expensive Enterprise Addon</td>
                <td className="p-4 sm:p-5 text-rose-500">❌ Messy Email Threads</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Predictive Audience Heatmap</td>
                <td className="p-4 sm:p-5 text-emerald-600 font-bold bg-brand-500/5">✅ Machine-Learned Timing</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">❌ Basic Static Timezones</td>
                <td className="p-4 sm:p-5 text-rose-500">❌ Guesswork</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Fluid Dark, Peach & Cream Themes</td>
                <td className="p-4 sm:p-5 text-emerald-600 font-bold bg-brand-500/5">✅ Full Adaptability</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">❌ Fixed Rigid UI</td>
                <td className="p-4 sm:p-5 text-foreground-subtle">N/A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── TESTIMONIALS & CREATOR WALL ─────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-2">
              <span>💬 Real Creator Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Loved by Creators, Agencies & Founders
            </h2>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl glass-panel text-xs font-medium">
            {["all", "creator", "agency", "saas"].map((filter) => (
              <button
                key={filter}
                onClick={() => setTestimonialFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  testimonialFilter === filter
                    ? "bg-brand-500 text-white font-semibold shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {filter === "saas" ? "Founders" : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="glass-glow-card p-6 rounded-3xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-brand text-white font-bold text-xs flex items-center justify-center">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                      <p className="text-[11px] text-foreground-subtle truncate max-w-[130px]">{item.role}</p>
                    </div>
                  </div>
                  <span className="text-amber-500 text-xs">★★★★★</span>
                </div>

                <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                  {item.stat}
                </div>

                <p className="text-xs text-foreground-muted leading-relaxed">
                  "{item.text}"
                </p>
              </div>

              <div className="text-[10px] text-foreground-subtle border-t border-divider pt-2 font-medium">
                Verified SocialPilot Customer
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE FAQ ACCORDION ───────────────────────────────────── */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-foreground-muted mt-2 text-sm sm:text-base">
            Everything you need to know about getting started with SocialPilot.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-surface-border overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-foreground text-sm sm:text-base hover:bg-surface-raised/40 transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-brand-500 font-bold transition-transform duration-300 ${
                  openFaq === idx ? "rotate-180" : ""
                }`}>
                  ▼
                </span>
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-foreground-muted leading-relaxed border-t border-divider/60 pt-3 animate-in fade-in duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSING CALL TO ACTION & NEWSLETTER SANDBOX ──────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-14 text-center border border-brand-500/30 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              Ready to Master Your <br />
              <span className="text-gradient">Social Media Reach?</span>
            </h2>

            <p className="text-foreground-muted text-sm sm:text-base max-w-2xl mx-auto">
              Join thousands of growth marketers, solo creators, and forward-thinking agencies who automate their social pipelines with SocialPilot.
            </p>

            {/* Newsletter / Early VIP Lead Form */}
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter your work email..."
                disabled={subscribed}
                className="w-full sm:flex-1 px-5 py-3.5 rounded-full surface-field text-foreground text-sm border border-surface-border focus:outline-none"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-brand text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                {subscribed ? "✓ Access Granted" : "Get 14-Day Pro Free"}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-foreground-subtle font-medium">
              <span>⚡ Instant 60-Second Setup</span>
              <span>🔒 256-Bit OAuth Encryption</span>
              <span>🟢 100% Platform Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODERN FOOTER ────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-divider bg-surface/30 backdrop-blur-md pt-12 pb-8 text-xs text-foreground-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-left">
            
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
                  SP
                </span>
                <span className="text-base font-extrabold text-foreground tracking-tight">SocialPilot</span>
              </div>
              <p className="text-xs text-foreground-muted max-w-sm leading-relaxed">
                Autonomous Multi-Channel Social Media Scheduling, Campaign Management & Analytics Platform.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Systems Operational
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/posts" className="hover:text-foreground transition-colors">Post Composer</Link></li>
                <li><Link href="/calendar" className="hover:text-foreground transition-colors">Unified Calendar</Link></li>
                <li><Link href="/queue" className="hover:text-foreground transition-colors">Automated Queue</Link></li>
                <li><Link href="/analytics" className="hover:text-foreground transition-colors">Analytics Engine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link></li>
                <li><Link href="/social-accounts" className="hover:text-foreground transition-colors">Channel OAuth</Link></li>
                <li><Link href="/reports" className="hover:text-foreground transition-colors">PDF / CSV Reports</Link></li>
                <li><Link href="/admin" className="hover:text-foreground transition-colors">Team Approvals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Account</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Register Free</Link></li>
                <li><Link href="/billing" className="hover:text-foreground transition-colors">Pricing & Billing</Link></li>
                <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile Settings</Link></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-divider text-[11px]">
            <p>© 2026 SocialPilot Inc. All rights reserved. Crafted with precision for high-growth teams.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Security & Compliance</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
