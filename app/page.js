import Link from "next/link";
import places from "@/data/restaurants.json";
import slugify from "@/lib/slugify";

export const metadata = {
  title: "Gluten-Free Korea",
  description: "A simple guide to gluten-free friendly places in Korea.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Gluten-Free Korea
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Unified places list (dining + cafe + bakery). Always verify ingredients and cross-contamination on visit.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place) => {
            const slug = place.slug || slugify(place.name);
            return (
              <Link
                key={slug}
                href={`/place/${slug}`}
                className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {place.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {place.type}{place.location ? ` · ${place.location}` : ""}
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
      </div>
    </main>
  );
}
