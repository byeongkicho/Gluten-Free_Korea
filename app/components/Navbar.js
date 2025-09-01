import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-8 w-full justify-between">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white cursor-pointer">
            GF Korea
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex space-x-6">
            <Link href="/">
              <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/shop">
              <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
                Shop
              </span>
            </Link>
            <Link href="/dining">
              <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
                Dining
              </span>
            </Link>
            <Link href="/about">
              <span className="text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 cursor-pointer">
                About
              </span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
