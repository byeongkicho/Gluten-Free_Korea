export const runtime = "edge";

import Image from "next/image";
import Link from "next/link";
import products from "../../../data/products.json";
import slugify from "@/lib/slugify";

export default function ProductDetailPage({ params }) {
  const product = products.find((p) => slugify(p.name) === params.slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The product you are looking for does not exist.
          </p>
          <Link href="/shop">
            <span className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Back to Shop
            </span>
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
            <Link href="/shop">
              <span className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                ← Back to Shop
              </span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-8"
              />
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {product.price}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {product.vendor} • {product.price}
                  </p>

                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Description
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {product.note}
                  </p>

                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
                      Why We Recommend This
                    </h3>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                      <li>• Certified gluten-free product</li>
                      <li>• High-quality ingredients</li>
                      <li>• Perfect for Korean cooking</li>
                      <li>• Reliable supplier</li>
                    </ul>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Product Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Vendor:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.vendor}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Price:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.price}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Category:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.tags[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Purchase
                    </h3>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      View on Store →
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Affiliate link - we may earn a commission
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Shopping Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Check expiration dates</li>
                      <li>• Verify gluten-free certification</li>
                      <li>• Read ingredient labels carefully</li>
                      <li>• Consider shipping costs</li>
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
