import Link from "next/link";
import places from "@/data/places.json";
import PlaceFilter from "@/app/components/PlaceFilter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";
const homeTitle = "No Gluten Korea | Gluten-Free Restaurants, Cafes & Guide in Korea";
const homeDescription = "Find gluten-free restaurants, cafes, bakeries, and travel tips in Korea. Bilingual Korean/English guide with place details, maps, and safety notes.";

export const metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    "gluten free korea",
    "gluten-free korea",
    "korea gluten free",
    "gluten free seoul",
    "gluten free restaurants korea",
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

export default function HomePage() {
  const safePlaces = Array.isArray(places) ? places.filter((p) => p?.slug) : [];
  const hasPlaces = safePlaces.length > 0;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "No Gluten Korea",
    url: siteUrl,
    inLanguage: ["en", "ko"],
    description: homeDescription,
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Gluten-Free Korea Directory",
    numberOfItems: safePlaces.length,
    itemListElement: safePlaces.slice(0, 8).map((place, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/place/${place.slug}`,
      name: place.name || place.slug,
    })),
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {hasPlaces ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border border-rim bg-surface p-5 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <span className="lang-en">Gluten-Free Directory</span>
            <span className="lang-ko">글루텐프리 디렉토리</span>
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-4xl">
            No Gluten Korea
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            <span className="lang-en">
              A simple directory of gluten-free restaurants, cafes, and bakeries in
              Korea. Always reconfirm ingredients and cross-contamination when you
              visit.
            </span>
            <span className="lang-ko">
              한국에서 글루텐프리 식당, 카페, 베이커리를 한 곳에서 찾을 수 있는
              간단한 목록입니다. 방문 시 재료와 교차오염 여부는 항상 다시 확인하세요.
            </span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-fg">
              <span className="lang-en">{safePlaces.length} verified places</span>
              <span className="lang-ko">검증된 장소 {safePlaces.length}곳</span>
            </p>
            <span className="hidden text-rim sm:inline">|</span>
            <Link href="/guide" className="text-sm font-medium text-accent transition-opacity hover:opacity-70">
              <span className="lang-en">Read safety guide →</span>
              <span className="lang-ko">안전 가이드 보기 →</span>
            </Link>
          </div>
        </section>

        {!hasPlaces ? (
          <div className="mt-8 rounded-2xl border border-dashed border-faint p-8 text-center sm:p-10">
            <p className="text-sm text-muted">
              <span className="lang-en">No places listed yet.</span>
              <span className="lang-ko">등록된 장소가 아직 없습니다.</span>
            </p>
          </div>
        ) : (
          <PlaceFilter places={safePlaces} />
        )}
      </div>
    </main>
  );
}
