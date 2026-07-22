"use client";

import { useTheme } from "@/components/ThemeProvider";

type DarkModeToggleProps = {
  className?: string;
  size?: "sm" | "md";
};

export function DarkModeToggle({ className = "", size = "md" }: DarkModeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex ${dim} items-center justify-center rounded-xl border border-gita-line/60 bg-white/50 text-gita-earth transition hover:border-gita-saffron/40 hover:text-gita-peacock dark:border-gita-line/80 dark:bg-gita-chariot/80 dark:text-gita-earth dark:hover:border-gita-saffron/50 ${className}`}
    >
      {!mounted ? (
        <span className={`${icon} rounded-full bg-gita-line/40 dark:bg-gita-line/60`} aria-hidden />
      ) : isDark ? (
        <svg className={icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className={icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
