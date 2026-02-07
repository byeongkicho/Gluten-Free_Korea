export const runtime = "edge";

import { notFound } from "next/navigation";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Link from "next/link";
import { fetchRestaurants } from "@/lib/fetchContent";
import slugify from "@/lib/slugify";

export default async function DiningPlacePage({ params }) {
  const restaurants = await fetchRestaurants();
  const slug = params?.slug;

  const restaurant = restaurants.find((r) => {
    const rSlug = r.slug || slugify(r.name);
    return rSlug === slug;
  });

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dining"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {'<- Back to Dining Places'}
        </Link>
      </div>

      <Card>
        <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">Dining</div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-3">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{restaurant.type}</Badge>
                <Badge variant="outline">Gluten-Free</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {restaurant.note ? (
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-3">
                  About this place
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {restaurant.note}
                </p>
              </div>
            ) : null}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Gluten-Free (Verify on visit)
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Always confirm cross-contamination practices with staff and check updated menus.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {restaurant.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {restaurant.location || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
