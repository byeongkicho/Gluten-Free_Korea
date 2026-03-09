import Link from "next/link";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 w-full border-b border-gray-200/70 bg-white/90 backdrop-blur dark:border-gray-800/70 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white sm:text-base md:text-lg">
          GF Korea
        </Link>

        <div className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/" className="rounded-md px-2 py-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
            <span className="lang-en">Places</span>
            <span className="lang-ko">장소</span>
          </Link>
          <Link
            href="/guide"
            className="rounded-md px-2 py-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
          >
            <span className="lang-en">Guide</span>
            <span className="lang-ko">가이드</span>
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
