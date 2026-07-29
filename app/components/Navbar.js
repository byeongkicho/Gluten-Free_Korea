"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGuide = pathname === "/guide";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isPlaces =
    pathname === "/places" || pathname.startsWith("/place/") || pathname.startsWith("/area/");

  return (
    <nav className="sticky top-0 z-20 w-full border-b border-rim bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-base font-semibold tracking-tight text-fg sm:text-lg">
          <span className="lang-en">No Gluten Korea</span>
          <span className="lang-ko">노글루텐코리아</span>
        </Link>

        <div className="flex items-center gap-5 text-sm sm:gap-6">
          <Link href="/" className={`transition-colors hover:text-fg ${isHome ? "font-medium text-fg" : "text-muted"}`}>
            <span className="lang-en">Home</span>
            <span className="lang-ko">홈</span>
          </Link>
          <Link href="/blog" className={`transition-colors hover:text-fg ${isBlog ? "font-medium text-fg" : "text-muted"}`}>
            <span className="lang-en">Blog</span>
            <span className="lang-ko">블로그</span>
          </Link>
          <Link href="/places" className={`transition-colors hover:text-fg ${isPlaces ? "font-medium text-fg" : "text-muted"}`}>
            <span className="lang-en">Restaurants</span>
            <span className="lang-ko">식당</span>
          </Link>
          <Link href="/guide" className={`transition-colors hover:text-fg ${isGuide ? "font-medium text-fg" : "text-muted"}`}>
            <span className="lang-en">Guide</span>
            <span className="lang-ko">가이드</span>
          </Link>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
