"use client";

import { useEffect, useState } from "react";

function applyLanguage(nextLang) {
  const root = document.documentElement;
  root.classList.remove("lang-en", "lang-ko");
  root.classList.add(nextLang === "ko" ? "lang-ko" : "lang-en");
  root.setAttribute("lang", nextLang === "ko" ? "ko" : "en");
}

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      const initial = saved === "ko" ? "ko" : "en";
      setLang(initial);
      applyLanguage(initial);
    } catch (_e) {
      applyLanguage("en");
    }
  }, []);

  function toggleLanguage() {
    const next = lang === "en" ? "ko" : "en";
    setLang(next);
    try {
      localStorage.setItem("lang", next);
    } catch (_e) {}
    applyLanguage(next);
    window.dispatchEvent(new Event("app-lang-change"));
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:text-sm"
      aria-label="Toggle language"
    >
      {lang === "en" ? "한글" : "EN"}
    </button>
  );
}
