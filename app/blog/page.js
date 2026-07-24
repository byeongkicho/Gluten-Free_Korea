import Link from "next/link";
import { getPublishedPosts, getUpcomingPosts } from "@/app/lib/blog";

export const metadata = {
  title: "Blog | Gluten-Free Korea",
  description:
    "Personal field notes on gluten-free dining and travel in Korea — restaurants, phrases, label-reading hacks, convenience-store survival.",
  alternates: { canonical: "/blog" },
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtShortDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const published = getPublishedPosts();
  const upcoming = getUpcomingPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-fraunces text-3xl font-bold text-fg">
        <span className="lang-en">Blog</span>
        <span className="lang-ko">블로그</span>
      </h1>
      <p className="mt-3 text-sm text-muted">
        <span className="lang-en">
          Field notes on gluten-free dining and travel in Korea.
        </span>
        <span className="lang-ko">한국에서의 글루텐프리 외식·여행 현장 기록.</span>
      </p>

      {published.length > 0 && (
        <section className="mt-10 space-y-8">
          {published.map((post) => (
            <article key={post.slug} className="border-b border-rim pb-6">
              <h2 className="text-xl font-semibold text-fg leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {post.description}
              </p>
              <p className="mt-2 text-xs text-faint">{fmtDate(post.date)}</p>
            </article>
          ))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="lang-en">Coming soon</span>
            <span className="lang-ko">발행 예정</span>
          </h2>
          {/* Titles only, not links — the stub pages are noindex'd and we
              don't want to feed crawlers an internal path to thin content. */}
          <ul className="mt-4 space-y-2 text-sm">
            {upcoming.map((post) => (
              <li key={post.slug} className="text-muted">
                {post.title}
                <span className="ml-2 text-xs text-faint">
                  — {fmtShortDate(post.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
