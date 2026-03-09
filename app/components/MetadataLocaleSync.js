"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.setAttribute("content", value);
}

function getPlaceTitleFromPage() {
  const heading = document.querySelector("main h1");
  if (!heading) return null;
  return heading.textContent?.trim() || null;
}

export default function MetadataLocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    function apply() {
      const lang = localStorage.getItem("lang") === "ko" ? "ko" : "en";

      let title = "GF Korea";
      let description = "A guide to gluten-free living and safe eats in Korea.";

      if (pathname === "/guide") {
        title = lang === "ko" ? "안전 가이드 | Gluten-Free Korea" : "Safety Guide | Gluten-Free Korea";
        description =
          lang === "ko"
            ? "한국에서 글루텐프리 식사를 위한 기본 안전 가이드입니다."
            : "Basic gluten-free safety guide for Korea.";
      } else if (pathname === "/") {
        title = "Gluten-Free Korea";
        description =
          lang === "ko"
            ? "한국의 글루텐프리 식당, 카페, 베이커리 목록입니다."
            : "A simple guide to gluten-free friendly places in Korea.";
      } else if (pathname.startsWith("/place/")) {
        const placeName = getPlaceTitleFromPage();
        if (placeName) {
          title =
            lang === "ko"
              ? `${placeName} | 글루텐프리 코리아`
              : `${placeName} | Gluten-Free Korea`;
        }
        description =
          lang === "ko"
            ? "방문 전 재료와 교차오염 여부를 다시 확인하세요."
            : "Always reconfirm ingredients and cross-contamination before visit.";
      }

      document.title = title;
      setMeta("meta[name='description']", description);
      setMeta("meta[property='og:title']", title);
      setMeta("meta[property='og:description']", description);
      setMeta("meta[name='twitter:title']", title);
      setMeta("meta[name='twitter:description']", description);
      setMeta("meta[property='og:locale']", lang === "ko" ? "ko_KR" : "en_US");
    }

    apply();
    window.addEventListener("app-lang-change", apply);
    return () => window.removeEventListener("app-lang-change", apply);
  }, [pathname]);

  return null;
}
