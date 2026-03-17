import places from "@/data/places.json";
import PlaceFilter from "@/app/components/PlaceFilter";

export const metadata = {
  title: "Gluten-Free Korea",
  description: "A simple guide to gluten-free friendly places in Korea.",
};

export default function HomePage() {
  const safePlaces = Array.isArray(places) ? places.filter((p) => p?.slug) : [];
  const hasPlaces = safePlaces.length > 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: safePlaces.map((place, index) => ({
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
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 sm:p-7 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            <span className="lang-en">Gluten-Free Directory</span>
            <span className="lang-ko">글루텐프리 디렉토리</span>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
            Gluten-Free Korea
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
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
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span className="lang-en">Listed places: {safePlaces.length}</span>
            <span className="lang-ko">현재 등록 장소 {safePlaces.length}곳</span>
          </p>
        </section>

        {!hasPlaces ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700 sm:p-10">
            <p className="text-sm text-gray-700 dark:text-gray-300">
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
