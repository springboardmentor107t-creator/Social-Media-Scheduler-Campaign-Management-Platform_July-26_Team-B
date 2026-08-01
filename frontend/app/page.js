import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans w-full max-w-5xl mx-auto px-6 py-20 text-center">
      
      {/* Hero Section */}
      <div className="space-y-6 max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-600 dark:text-brand-300 mb-4">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2"></span>
          SocialPilot v1.0 is Live
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Master Your <br className="hidden sm:block" />
          <span className="text-gradient">Social Presence</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one scheduler and campaign management platform designed to automate your workflows, analyze engagement, and scale your audience effortlessly.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 text-white font-medium transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:scale-95"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full sm:w-auto items-center justify-center rounded-full glass-panel px-8 font-medium transition-all hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="glass-panel p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 text-2xl">
            📅
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            Plan, create, and schedule your content across all major platforms from a unified calendar interface.
          </p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 text-2xl">
            📈
          </div>
          <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            Track engagement, monitor audience growth, and measure the true ROI of your social campaigns.
          </p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 text-2xl">
            ⚡
          </div>
          <h3 className="text-xl font-bold mb-2">Automated Workflows</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            Set up approval processes and team roles to keep your brand's voice consistent and secure.
          </p>
        </div>
      </div>

    </div>
  );
}
