// app/food/[slug]/page.js
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import restaurantsJson from "../../../data/restaurants.json";
import slugify from "@/lib/slugify";
import { fetchRestaurants } from "@/lib/fetchContent";

export default async function RestaurantDetailPage({ params }) {
  const { slug } = await params; // ⬅️ await params
  const restaurants = await fetchRestaurants();
  const restaurant = restaurants.find((r) => (r.slug || slugify(r.name)) === slug);

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The restaurant you are looking for does not exist.
          </p>
          <Link
            href="/food"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Food Guide
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/food"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              ← Back to Food Guide
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {restaurant.name}
                    </h1>
                    <p className="text-white text-lg opacity-90">
                      {restaurant.type} • {restaurant.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      ★ {restaurant.rating}
                    </div>
                    <div className="text-white text-sm opacity-80">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    About
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {restaurant.note}
                  </p>

                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(restaurant.tags ?? []).map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Quick Info
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Type:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {restaurant.type}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Location:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {restaurant.location}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Rating:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ★ {restaurant.rating}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Call ahead to confirm gluten-free options</li>
                      <li>• Bring a dining card in Korean</li>
                      <li>• Ask about cross-contamination</li>
                      <li>• Check for updated menu items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Pre-generate static paths (optional but nice with JSON data)
export function generateStaticParams() {
  // Use local JSON for build-time params. Runtime data may come from Supabase.
  return restaurantsJson.map((r) => ({ slug: r.slug || slugify(r.name) }));
}

// Metadata example (also must await params)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const restaurants = await fetchRestaurants();
  const item = restaurants.find((r) => (r.slug || slugify(r.name)) === slug);
  return {
    title: item ? `${item.name} – Gluten-Free Guide` : "Restaurant Not Found",
    description: item?.note ?? "Gluten-free food guide in Korea",
  };
}
