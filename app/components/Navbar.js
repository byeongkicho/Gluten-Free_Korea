import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white/80 dark:bg-zinc-900/80">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Gluten-Free Korea
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300">
            Home
          </Link>
          <Link
            href="/guide"
            className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
          >
            Guide
          </Link>
        </div>
      </div>
    </nav>
  );
}
