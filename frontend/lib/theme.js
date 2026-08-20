const THEME_KEY = "socialpilot_theme";

export const THEMES = [
  { value: "system", label: "System Glossy" },
  { value: "peach", label: "Peach" },
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

  if (theme === "peach") {
    html.setAttribute("data-theme", "peach");
  } else if (theme === "cream") {
    html.setAttribute("data-theme", "cream");
  }

  localStorage.setItem(THEME_KEY, theme);
}