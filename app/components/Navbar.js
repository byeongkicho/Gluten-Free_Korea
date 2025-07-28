import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8 w-full justify-between">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight text-white hover:text-blue-300 transition-colors cursor-pointer">
            GF Korea
          </span>
        </Link>
        <div className="flex space-x-6">
          <Link href="/">
            <span className="text-lg font-semibold text-gray-100 hover:text-blue-300 transition-colors cursor-pointer">
              Home
            </span>
          </Link>
          <Link href="/food">
            <span className="text-lg font-semibold text-gray-100 hover:text-blue-300 transition-colors cursor-pointer">
              Food
            </span>
          </Link>
          <Link href="/about">
            <span className="text-lg font-semibold text-gray-100 hover:text-blue-300 transition-colors cursor-pointer">
              About
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
