import Link from "next/link";
import Image from "next/image";

const recentUpdates = [
  {
    type: "Restaurant",
    name: "Sunny Bakery",
    location: "Seoul, Gangnam",
    updateDate: "2024-01-15",
    description: "Added new gluten-free cake menu items",
    image: "/globe.svg",
  },
  {
    type: "Product",
    name: "GF Soy Sauce",
    vendor: "Online Market",
    updateDate: "2024-01-12",
    description: "New certified gluten-free soy sauce option",
    image: "/window.svg",
  },
  {
    type: "Ingredient",
    name: "Sweet Potato Noodles",
    status: "Safe",
    updateDate: "2024-01-10",
    description: "Updated cross-contamination information",
    image: "/file.svg",
  },
  {
    type: "Restaurant",
    name: "Rice & Shine",
    location: "Seoul, Itaewon",
    updateDate: "2024-01-08",
    description: "Added new rice-based dessert options",
    image: "/next.svg",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Gluten-Free Korea
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
            Your guide to safe gluten-free dining and shopping in Korea
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/food">
              <span className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 bg-blue-600 text-white hover:bg-blue-700">
                Explore Food Guide →
              </span>
            </Link>
            <Link href="/shop">
              <span className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                Shop Essentials →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Food Guide Card */}
            <div className="rounded-xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-blue-600">
                  <span className="text-white text-xl">🍽️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Food Guide
                </h3>
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Discover gluten-free restaurants, bakeries, and cafes across
                Korea. Learn about safe ingredients and get practical dining
                tips.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Restaurant & bakery directory
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Ingredient safety guide
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Dining tips & phrases
                  </span>
                </div>
              </div>
              <Link href="/food">
                <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Explore Food Guide →
                </span>
              </Link>
            </div>

            {/* Shop Card */}
            <div className="rounded-xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-purple-600">
                  <span className="text-white text-xl">🛒</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Shop Essentials
                </h3>
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Find gluten-free products and ingredients you can order online.
                From pantry staples to specialty items for Korean cooking.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Curated product recommendations
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Affiliate links for convenience
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-200">
                    Korean cooking essentials
                  </span>
                </div>
              </div>
              <Link href="/shop">
                <span className="inline-flex items-center font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  Browse Products →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Updated Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recently Updated
            </h2>
            <Link href="/food">
              <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                View All →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentUpdates.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.type === "Restaurant"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : item.type === "Product"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.updateDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={20}
                      height={20}
                      className="opacity-60"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.location || item.vendor || item.status}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Supporting the Gluten-Free Community in Korea
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                9+
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                Restaurants & Bakeries
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                10+
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                Ingredient Guides
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">
                5+
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                Shop Products
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
