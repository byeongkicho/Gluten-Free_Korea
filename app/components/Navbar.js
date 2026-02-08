"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:bg-zinc-900/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Gluten-Free Korea
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              Home
            </span>
          </Link>

          <Link href="/food">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              Food
            </span>
          </Link>

          <Link href="/dining">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              Dining
            </span>
          </Link>

          <Link href="/shop">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              Shop
            </span>
          </Link>

          <Link href="/guides">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              Guides
            </span>
          </Link>

          <Link href="/about">
            <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
              About
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
