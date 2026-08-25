"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { label: "Querying Multi-Channel Performance Metrics...", duration: 500 },
  { label: "Rendering SVG Vector Charts & Engagement Graphs...", duration: 600 },
  { label: "Synthesizing Executive ROI & Campaign Benchmarks...", duration: 500 },
  { label: "Packaging File & Encrypting Export Stream...", duration: 400 },
];

export default function ExportProgressModal({
  isOpen,
  format = "csv",
  onComplete,
  onCancel,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(10);
      return;
    }

    let isMounted = true;

    async function runPipeline() {
      for (let i = 0; i < STEPS.length; i++) {
        if (!isMounted) return;
        setCurrentStep(i);
        setProgress(Math.round(((i + 1) / STEPS.length) * 90));
        await new Promise((res) => setTimeout(res, STEPS[i].duration));
      }
      if (isMounted) {
        setProgress(100);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-border shadow-2xl p-6 backdrop-blur-2xl text-center relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl font-bold mb-4 shadow-sm animate-pulse">
          {format === "pdf" ? "📄" : "📊"}
        </div>

        <h3 className="text-base font-bold text-foreground mb-1">
          Generating {format.toUpperCase()} Executive Report
        </h3>
        <p className="text-xs text-foreground-muted mb-6">
          Aggregating all connected channel statistics & campaign analytics
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-surface-raised rounded-full h-3 p-0.5 border border-surface-border mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-400 transition-all duration-300 shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between text-xxs font-mono text-foreground-subtle mb-6">
          <span className="text-brand-600 dark:text-brand-400 font-bold truncate max-w-[280px] text-left">
            {STEPS[currentStep]?.label || "Finalizing Export..."}
          </span>
          <span className="font-bold">{progress}%</span>
        </div>

        {/* Steps Checklist */}
        <div className="space-y-2 text-left mb-6 bg-surface-raised/40 p-3 rounded-2xl border border-surface-border/50">
          {STEPS.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xxs font-bold ${
                  idx < currentStep
                    ? "bg-emerald-500 text-white"
                    : idx === currentStep
                    ? "bg-brand-500 text-white animate-spin"
                    : "bg-surface-border text-foreground-subtle"
                }`}
              >
                {idx < currentStep ? "✓" : idx === currentStep ? "⟳" : "•"}
              </span>
              <span
                className={
                  idx <= currentStep
                    ? "text-foreground font-medium"
                    : "text-foreground-subtle"
                }
              >
                {s.label.split("...")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-foreground-muted hover:text-foreground hover:underline"
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
}
