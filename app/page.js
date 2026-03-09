import Link from "next/link";
import places from "@/data/restaurants.json";

export const metadata = {
  title: "Gluten-Free Korea",
  description: "A simple guide to gluten-free friendly places in Korea.",
};

export default function HomePage() {
  const safePlaces = Array.isArray(places) ? places.filter((p) => p?.slug) : [];
  const hasPlaces = safePlaces.length > 0;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
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
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {safePlaces.map((place) => {
              const slug = place.slug;
              const displayName = place.name || "이름 미정";
              const displayType = place.type || "정보 준비중";

              return (
                <Link
                  key={slug}
                  href={`/place/${slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {displayType}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg">
                    {displayName}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {place.location || (
                      <>
                        <span className="lang-en">Location coming soon</span>
                        <span className="lang-ko">위치 정보 준비중</span>
                      </>
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(place.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="lang-en">View details</span>
                    <span className="lang-ko">상세 보기</span>{" "}
                    <span className="inline-block transition group-hover:translate-x-0.5">→</span>
                  </p>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
