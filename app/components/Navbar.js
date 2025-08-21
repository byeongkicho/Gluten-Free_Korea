import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav
      className="px-6 py-4 flex items-center justify-between"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center space-x-8 w-full justify-between">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight cursor-pointer">
            GF Korea
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex space-x-6">
            <Link href="/">
              <span className="text-lg font-semibold cursor-pointer">Home</span>
            </Link>
            <Link href="/food">
              <span className="text-lg font-semibold cursor-pointer">Food</span>
            </Link>
            <Link href="/shop">
              <span className="text-lg font-semibold cursor-pointer">Shop</span>
            </Link>
            <Link href="/about">
              <span className="text-lg font-semibold cursor-pointer">
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
