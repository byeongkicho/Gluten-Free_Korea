import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Link from "next/link";
import { fetchRestaurants } from "@/lib/fetchContent";
import slugify from "@/lib/slugify";

export default async function DiningPage() {
  // Ship-fast default: works without Supabase env vars (falls back to local JSON).
  const restaurants = await fetchRestaurants();

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">
        Gluten-Free Dining in Korea
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Restaurants & Cafes
        </h2>

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No dining places found.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => {
            const slug = restaurant.slug || slugify(restaurant.name);
            return (
              <Link key={slug} href={`/dining/${slug}`}>
                <Card>
                  <div className="relative h-32 w-full bg-gray-50 dark:bg-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl">🍽️</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {restaurant.name}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {restaurant.type} {restaurant.location ? `· ${restaurant.location}` : ""}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="blue">{restaurant.type}</Badge>
                      <Badge variant="outline">Gluten-Free</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {restaurants.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {restaurants.length} gluten-free{" "}
              {restaurants.length === 1 ? "dining place" : "dining places"}
            </p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Dining Places Directory
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => {
                const slug = restaurant.slug || slugify(restaurant.name);
                return (
                  <tr
                    key={slug}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      <Link
                        href={`/dining/${slug}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {restaurant.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 capitalize">
                      {restaurant.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-50 text-green-700 ring-1 ring-green-200 text-xs px-2 py-1 rounded-full">
                        Gluten-Free
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
