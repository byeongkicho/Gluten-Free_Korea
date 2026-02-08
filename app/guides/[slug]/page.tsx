import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuideBySlug } from "@/lib/guides";
import GuideBody from "@/app/guides/GuideBody";

type PageProps = {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: `${guide.meta.title} — GF Korea`,
    description: guide.meta.description,
    // Canonical: skip until you set a real domain.
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const Updated = formatDate(guide.meta.updated || guide.meta.date);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/guides"
              className="hover:text-gray-900 dark:hover:text-white"
            >
              Guides
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 dark:text-white truncate">
              {guide.meta.title}
            </span>
          </nav>

          <header className="mt-6">
            <p className="text-xs tracking-[0.22em] uppercase text-gray-500 dark:text-gray-400">
              Guide
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {guide.meta.title}
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              {guide.meta.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
              {Updated ? <span>Last updated: {Updated}</span> : null}
              {typeof guide.readingMinutes === "number" ? (
                <span>{guide.readingMinutes} min read</span>
              ) : null}
            </div>

            <div className="mt-6">
              <Link
                href="/guides"
                className="inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white hover:underline"
              >
                ← Back to Guides
              </Link>
            </div>
          </header>

          <article className="mt-10 prose prose-zinc dark:prose-invert max-w-none prose-a:font-semibold prose-a:underline-offset-4 prose-a:text-blue-700 dark:prose-a:text-blue-300">
            <GuideBody guide={guide} />
          </article>
        </div>
      </section>
    </main>
  );
}
