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
    <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Gluten-Free Korea
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Unified places list (dining + cafe + bakery). Always verify ingredients and cross-contamination on visit.
        </p>

        {!hasPlaces ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              등록된 장소가 아직 없습니다.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {safePlaces.map((place) => {
              const slug = place.slug;
              const displayName = place.name || "이름 미정";
              const displayType = place.type || "정보 준비중";

              return (
                <Link
                  key={slug}
                  href={`/place/${slug}`}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {displayType}
                    {place.location ? ` · ${place.location}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(place.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
