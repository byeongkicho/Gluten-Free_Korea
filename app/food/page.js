import Image from "next/image";
import Link from "next/link";
import restaurants from "../../data/restaurants.json";
import ingredients from "../../data/ingredients.json";

const dummyTips = [
  "Ask: '밀가루 들어갔나요?' (Does this contain flour?)",
  "Request: '간장 대신 소금으로 해주세요.' (Please use salt instead of soy sauce.)",
  "Plain rice, grilled meats (구이), and steamed dishes are generally safe.",
  "Watch for hidden gluten in soups/stews and marinated dishes.",
  "Look for '글루텐프리' labels. Imported items often have English labels too.",
  "Carry a dining card explaining celiac/gluten intolerance in Korean.",
  "Street foods often use batter; choose roasted nuts, fruits, or skewers instead.",
  "When in doubt, choose simple dishes with minimal sauces.",
];

function statusClasses(status) {
  if (status === "Safe")
    return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (status === "Avoid") return "bg-red-50 text-red-600 ring-1 ring-red-200";
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export default function FoodPage() {
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
            const slug = r.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
            return (
              <Link key={i} href={`/food/${slug}`}>
                <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <div className="relative h-32 w-full bg-gray-50">
                    <Image
                      src={r.image}
                      alt={r.name}
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold">{r.name}</h3>
                      <div className="text-sm text-yellow-600 font-semibold">
                        ★ {r.rating}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {r.type} · {r.location}
                    </div>
                    <p className="text-gray-700 text-sm mt-2">{r.note}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Ingredient
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-gray-800">{ing.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusClasses(
                        ing.status
                      )}`}
                    >
                      {ing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{ing.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Tips</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {dummyTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
