import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <section className="relative py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Gluten-Free Korea
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
            MVP: Gluten-free places in Korea (Dining / Cafe)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dining">
              <span className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 bg-blue-600 text-white hover:bg-blue-700">
                Dining →
              </span>
            </Link>
            <Link href="/cafe">
              <span className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 bg-purple-600 text-white hover:bg-purple-700">
                Cafe →
              </span>
            </Link>
            <Link href="/about">
              <span className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                About →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
