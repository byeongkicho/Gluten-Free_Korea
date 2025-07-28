const dummyRestaurants = [
  {
    name: "Sunny Bakery",
    type: "Bakery",
    location: "Seoul, Gangnam",
    note: "Dedicated gluten-free bakery with breads and cakes.",
  },
  {
    name: "Rice & Shine",
    type: "Restaurant",
    location: "Seoul, Itaewon",
    note: "Korean fusion, all rice-based dishes.",
  },
  {
    name: "Green Table",
    type: "Cafe",
    location: "Busan, Haeundae",
    note: "Offers gluten-free desserts and coffee.",
  },
];

const dummyIngredients = [
  {
    name: "Soy Sauce (간장)",
    status: "Avoid",
    note: "Usually contains wheat unless labeled gluten-free.",
  },
  {
    name: "Rice (쌀)",
    status: "Safe",
    note: "Naturally gluten-free and widely available.",
  },
  {
    name: "Barley Tea (보리차)",
    status: "Avoid",
    note: "Made from barley, contains gluten.",
  },
  {
    name: "Sweet Potato Noodles (당면)",
    status: "Safe",
    note: "Made from sweet potato starch, gluten-free.",
  },
];

const dummyTips = [
  "Always ask if soy sauce or wheat flour is used, even in 'gluten-free' dishes.",
  "Look for '글루텐프리' (gluten-free) labels in stores.",
  "Plain grilled meats (구이) and rice dishes are usually safe.",
  "Be cautious with soups and stews—they often use soy sauce or wheat flour as a thickener.",
];

export default function FoodPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">
        Gluten-Free Food in Korea
      </h1>

      {/* Restaurants & Bakeries Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Restaurants & Bakeries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dummyRestaurants.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-5 border border-gray-100"
            >
              <h3 className="text-lg font-bold mb-1">{r.name}</h3>
              <div className="text-sm text-gray-500 mb-2">
                {r.type} · {r.location}
              </div>
              <p className="text-gray-700 text-sm">{r.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredient Guide Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Ingredient Guide
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                  Ingredient
                </th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {dummyIngredients.map((ing, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-2 px-4 text-gray-800">{ing.name}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      ing.status === "Safe" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {ing.status}
                  </td>
                  <td className="py-2 px-4 text-gray-600">{ing.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tips Section */}
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
