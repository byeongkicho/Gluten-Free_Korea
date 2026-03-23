"use client";

import { useEffect, useState } from "react";

function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved ? saved === "dark" : prefersDark;
      setDark(isDark);
      applyTheme(isDark);
    } catch (_e) {}
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_e) {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={mounted ? (dark ? "Switch to light mode" : "Switch to dark mode") : "Toggle dark mode"}
      className="text-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {mounted && dark ? "☀︎" : "☾"}
    </button>
  );
}
