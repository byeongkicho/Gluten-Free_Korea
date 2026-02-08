import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata = {
  title: "Guides — GF Korea",
  description:
    "Editorial, safety-first guides for gluten-free living and safe eating in Korea.",
};

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs tracking-[0.22em] uppercase text-gray-500 dark:text-gray-400">
              Guides
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Safety-first, Korea-specific.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-700 dark:text-gray-300">
              Practical checklists and phrases you can actually use, written for
              celiac disease and gluten sensitivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((g) => {
              const updated = formatDate(g.meta.updated || g.meta.date);
              return (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-900">
                        {g.meta.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {g.meta.description}
                      </p>
                    </div>
                    <span className="shrink-0 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      →
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                    {updated ? <span>Updated {updated}</span> : null}
                    {typeof g.readingMinutes === "number" ? (
                      <span>{g.readingMinutes} min read</span>
                    ) : null}
                    {(g.meta.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-gray-200 dark:border-gray-700 px-2 py-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                    Read guide
                    <span className="ml-2 text-gray-500 dark:text-gray-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-7">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Start here
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              New to Korea? Read the Getting Started guide first.
            </p>
            <div className="mt-4">
              <Link
                href="/guides/getting-started"
                className="inline-flex items-center rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Open Getting Started →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
