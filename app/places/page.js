import Link from "next/link";
import places from "@/data/places.json";
import PlaceFilter from "@/app/components/PlaceFilter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";
const pageTitle = "Gluten-Free Restaurants & Cafes in Korea";
const pageDescription =
  "A directory of gluten-free restaurants, cafes, and bakeries in Korea. Filter by area and type, with maps, addresses, and safety notes. Always reconfirm ingredients when you visit.";

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "gluten free restaurants korea",
    "gluten free restaurants seoul",
    "gluten free cafe korea",
    "gluten free bakery seoul",
    "korea gluten free directory",
    "글루텐프리 식당",
    "글루텐프리 서울",
    "한국 글루텐프리",
  ],
  alternates: { canonical: "/places" },
  openGraph: {
    type: "website",
    url: "/places",
    title: pageTitle,
    description: pageDescription,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "No Gluten Korea" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
};

export default function PlacesPage() {
  const safePlaces = Array.isArray(places) ? places.filter((p) => p?.slug) : [];
  const hasPlaces = safePlaces.length > 0;
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
            <span className="lang-en">Gluten-Free Places in Korea</span>
            <span className="lang-ko">한국의 글루텐프리 장소</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            <span className="lang-en">
              A directory of gluten-free restaurants, cafes, and bakeries in
              Korea. Always reconfirm ingredients and cross-contamination when you
              visit.
            </span>
            <span className="lang-ko">
              한국에서 글루텐프리 식당, 카페, 베이커리를 한 곳에서 찾을 수 있는
              목록입니다. 방문 시 재료와 교차오염 여부는 항상 다시 확인하세요.
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
