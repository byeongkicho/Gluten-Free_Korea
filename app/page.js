import Link from "next/link";
import places from "@/data/places.json";
import { getPublishedPosts } from "@/app/lib/blog";
import { listablePlaces } from "@/app/lib/places";
import FeaturedPlaces from "@/app/components/FeaturedPlaces";

import { SITE_NAME } from "@/app/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";
const homeTitle = `${SITE_NAME} | Gluten-Free Living in Korea — Cooking, Ingredients & Dining`;
const homeDescription =
  "How to live gluten-free in Korea: home cooking, ingredient sourcing, label-reading, and a directory of gluten-free restaurants. Bilingual Korean/English guides and kitchen notes.";

export const metadata = {
  // 홈만 브랜드-선행 형식이라 layout의 template(`%s | ...`)을 타지 않는다.
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "gluten free korea",
    "gluten-free korea",
    "korea gluten free",
    "gluten free seoul",
    "gluten free korean food",
    "gluten free cooking korea",
    "글루텐프리 코리아",
    "글루텐프리 서울",
    "한국 글루텐프리",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: homeTitle,
    description: homeDescription,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "No Gluten Korea" }],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: ["/og-default.png"],
  },
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HomePage() {
  const safePlaces = listablePlaces(places).filter((p) => p?.slug);
  const posts = getPublishedPosts().slice(0, 6);

  // Featured restaurants: lead with Dedicated GF spots (the most differentiated),
  // then fill with the rest, up to 6. Full directory lives at /places.
  const dedicated = safePlaces.filter(
    (p) => Array.isArray(p.tags) && p.tags.includes("Dedicated GF")
  );
  const featured = [
    ...dedicated,
    ...safePlaces.filter((p) => !dedicated.includes(p)),
  ].slice(0, 6);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "No Gluten Korea",
    url: siteUrl,
    inLanguage: ["en", "ko"],
    description: homeDescription,
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <div className="mx-auto max-w-6xl">
        {/* Hero — positioning: cook · source · dine */}
        <section className="rounded-2xl border border-rim bg-surface p-5 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <span className="lang-en">Cook · Source · Dine</span>
            <span className="lang-ko">요리 · 식재료 · 외식</span>
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-4xl">
            <span className="lang-en">Gluten-Free Living in Korea</span>
            <span className="lang-ko">한국에서 글루텐프리로 살기</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            <span className="lang-en">
              Practical, first-hand guides to eating gluten-free in Korea —
              cooking at home, sourcing safe ingredients, reading labels, and
              finding restaurants you can trust.
            </span>
            <span className="lang-ko">
              한국에서 글루텐프리로 먹고사는 법을 직접 경험으로 정리합니다 —
              집밥 요리, 안전한 식재료 소싱, 라벨 읽기, 믿을 만한 식당 찾기까지.
            </span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/guide" className="text-sm font-medium text-accent transition-opacity hover:opacity-70">
              <span className="lang-en">Read the safety guide →</span>
              <span className="lang-ko">안전 가이드 보기 →</span>
            </Link>
            <span className="hidden text-rim sm:inline">|</span>
            <Link href="/blog" className="text-sm font-medium text-accent transition-opacity hover:opacity-70">
              <span className="lang-en">Latest guides &amp; kitchen notes →</span>
              <span className="lang-ko">최신 가이드·요리 노트 →</span>
            </Link>
          </div>
        </section>

        {/* Section 1 — Latest from the blog (text cards, no images: fast) */}
        {posts.length > 0 && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
                <span className="lang-en">Latest from the blog</span>
                <span className="lang-ko">최신 블로그</span>
              </h2>
              <Link href="/blog" className="text-sm font-medium text-accent transition-opacity hover:opacity-70">
                <span className="lang-en">View all →</span>
                <span className="lang-ko">전체 보기 →</span>
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-rim bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <h3 className="font-semibold leading-snug text-fg group-hover:text-accent">
                    {post.title}
                  </h3>
                  {post.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {post.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-faint">{fmtDate(post.date)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 2 — Browse restaurants (featured; full grid at /places) */}
        {featured.length > 0 && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
                <span className="lang-en">Browse restaurants</span>
                <span className="lang-ko">식당 둘러보기</span>
              </h2>
              <Link href="/places" className="text-sm font-medium text-accent transition-opacity hover:opacity-70">
                <span className="lang-en">All {safePlaces.length} places →</span>
                <span className="lang-ko">전체 {safePlaces.length}곳 →</span>
              </Link>
            </div>
            <FeaturedPlaces places={featured} />
          </section>
        )}
      </div>
    </main>
  );
}
