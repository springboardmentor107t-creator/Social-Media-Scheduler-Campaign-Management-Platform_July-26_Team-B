"use client";

import { useState, useEffect, useRef } from "react";
import { THEMES, getStoredTheme, applyTheme } from "../lib/theme";

const ICONS = {
 system: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
 ),
 peach: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
 ),
 cream: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
 ),
};

export default function ThemeToggle() {
 const [theme, setTheme] = useState("system");
 const [open, setOpen] = useState(false);
 const ref = useRef(null);

 useEffect(() => {
 const stored = getStoredTheme();
 setTheme(stored);
 applyTheme(stored);
 }, []);

 useEffect(() => {
 function handleClickOutside(e) {
 if (ref.current && !ref.current.contains(e.target)) setOpen(false);
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 function selectTheme(value) {
 setTheme(value);
 applyTheme(value);
 setOpen(false);
 }

 return (
 <div className="relative" ref={ref}>
 <button
 onClick={() => setOpen((v) => !v)}
 className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-background-secondary transition-colors"
 title="Change theme"
 >
 <svg className="w-4.5 h-4.5 text-foreground-subtle " fill="none" viewBox="0 0 24 24" stroke="currentColor">
 {ICONS[theme]}
 </svg>
 </button>

 {open && (
 <div className="absolute right-0 mt-2 w-44 glass-panel rounded-2xl p-1.5 z-30 shadow-xl">
 {THEMES.map((t) => (
 <button
 key={t.value}
 onClick={() => selectTheme(t.value)}
 className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
 theme === t.value
 ? "bg-brand-500/10 text-brand-600 "
 : "text-foreground-subtle hover:bg-background-secondary "
 }`}
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 {ICONS[t.value]}
 </svg>
 {t.label}
 {theme === t.value && (
 <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 )}
 </button>
 ))}
 </div>
 )}
 </div>
 );
}