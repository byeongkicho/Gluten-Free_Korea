"use client";

import { useEffect, useState } from "react";

function applyLanguage(nextLang) {
  const root = document.documentElement;
  root.classList.remove("lang-en", "lang-ko");
  root.classList.add(nextLang === "ko" ? "lang-ko" : "lang-en");
  root.setAttribute("lang", nextLang === "ko" ? "ko" : "en");
  document.querySelectorAll(".lang-placeholder").forEach((el) => {
    const key = nextLang === "ko" ? "langPlaceholderKo" : "langPlaceholderEn";
    if (el.dataset[key]) el.placeholder = el.dataset[key];
  });
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
      aria-label="Toggle language"
      className="text-sm text-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {lang === "en" ? "한글" : "EN"}
    </button>
  );
}
