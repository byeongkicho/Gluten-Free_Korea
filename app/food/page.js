import Image from "next/image";
import Link from "next/link";
import slugify from "@/lib/slugify";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { fetchRestaurants, fetchIngredients } from "@/lib/fetchContent";

function statusClasses(status) {
  if (status === "Safe")
    return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (status === "Avoid") return "bg-red-50 text-red-600 ring-1 ring-red-200";
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export default async function FoodPage() {
  const [restaurants, ingredients] = await Promise.all([
    fetchRestaurants(),
    fetchIngredients(),
  ]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">
        Gluten-Free Food in Korea
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Restaurants & Bakeries
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r, i) => {
            const slug = r.slug || slugify(r.name);
            return (
              <Link key={i} href={`/food/${slug}`}>
                <Card>
                  <div className="relative h-32 w-full bg-gray-50 dark:bg-gray-800">
                    <Image
                      src={r.image}
                      alt={r.name}
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {r.name}
                      </h3>
                      {r.rating ? (
                        <div className="text-sm text-yellow-600 font-semibold">
                          ★ {r.rating}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {r.type} {r.location ? `· ${r.location}` : ""}
                    </div>
                    {r.note ? (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                        {r.note}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(r.tags || []).map((t, idx) => (
                        <Badge key={idx} variant="blue">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Ingredient Guide
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ingredient
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {ing.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusClasses(
                        ing.status
                      )}`}
                    >
                      {ing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {ing.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
