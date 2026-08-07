const THEME_KEY = "socialpilot_theme";

export const THEMES = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "cream", label: "Light Cream" },
];

export function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(THEME_KEY) || "system";
}

export function applyTheme(theme) {
  if (typeof window === "undefined") return;
  const html = document.documentElement;

  html.classList.remove("dark");
  html.removeAttribute("data-theme");

  if (theme === "dark") {
    html.classList.add("dark");
  } else if (theme === "cream") {
    html.setAttribute("data-theme", "cream");
  } else {
    // system: follow OS preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) html.classList.add("dark");
  }

  localStorage.setItem(THEME_KEY, theme);
}