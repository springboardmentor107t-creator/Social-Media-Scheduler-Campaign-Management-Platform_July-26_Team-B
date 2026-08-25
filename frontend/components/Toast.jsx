"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type, title, message = "") => {
      const id = `${Date.now()}_${Math.random()}`;
      const newToast = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeStyles = {
            success: {
              border: "border-emerald-500/30",
              bg: "bg-emerald-950/80",
              iconBg: "bg-emerald-500/20 text-emerald-400",
              icon: "✓",
            },
            error: {
              border: "border-rose-500/30",
              bg: "bg-rose-950/80",
              iconBg: "bg-rose-500/20 text-rose-400",
              icon: "✕",
            },
            info: {
              border: "border-sky-500/30",
              bg: "bg-slate-900/80",
              iconBg: "bg-sky-500/20 text-sky-400",
              icon: "ℹ",
            },
            warning: {
              border: "border-amber-500/30",
              bg: "bg-amber-950/80",
              iconBg: "bg-amber-500/20 text-amber-400",
              icon: "⚠",
            },
          };

          const style = typeStyles[toast.type] || typeStyles.info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${style.border} backdrop-blur-xl bg-surface shadow-2xl text-foreground animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${style.iconBg}`}
              >
                {style.icon}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-bold text-foreground">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xxs text-foreground-muted mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-foreground-subtle hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
