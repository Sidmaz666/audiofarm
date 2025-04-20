// ThemeToggle.js
import { useState, Peachy } from "@peach/component";
import { PersistedAppState } from "@peach/state";
import { initializeTheme } from "@utils/theme";

export default function ThemeToggle() {
  // Reactive persisted state with default "light".
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const system_theme = prefersDark ? "dark" : "light";
  const [theme, setTheme] = useState(null);

  const root = window.document.documentElement;

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      root.classList.remove("light", "dark");
      root.classList.add(PersistedAppState.get("theme") || system_theme);
      setTheme(PersistedAppState.get("theme") || system_theme);
      initializeTheme();
    }, 100);
  });

  const toggleTheme = () => {
    const new_theme = theme === "light" ? "dark" : "light";
    root.classList.remove("light", "dark");
    root.classList.add(new_theme);
    PersistedAppState.set("theme", new_theme);
    setTheme(new_theme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border transition-all hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      )}
    </button>
  );
}
