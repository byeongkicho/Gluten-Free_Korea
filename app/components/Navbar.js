import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 w-full border-b border-rim bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-base font-semibold tracking-tight text-fg sm:text-lg">
          <span className="lang-en">No Gluten Korea</span>
          <span className="lang-ko">노글루텐코리아</span>
        </Link>

        <div className="flex items-center gap-5 text-sm sm:gap-6">
          <Link href="/" className="text-muted transition-colors hover:text-fg">
            <span className="lang-en">Places</span>
            <span className="lang-ko">장소</span>
          </Link>
          <Link href="/guide" className="text-muted transition-colors hover:text-fg">
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
