import Image from "next/image";
import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import { fetchProducts } from "@/lib/fetchContent";
import slugify from "@/lib/slugify";

export default async function ShopPage() {
  const products = await fetchProducts();

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
        Shop Gluten-Free Essentials
      </h1>
      <p className="mb-8 text-sm text-gray-700 dark:text-gray-300">
        Some links may be affiliate links. If you purchase through them, we may
        earn a small commission at no extra cost to you. Thank you for
        supporting GF Korea!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, idx) => {
          const slug = p.slug || slugify(p.name);
          return (
            <Link key={idx} href={`/shop/${slug}`}>
              <Card>
                <div className="relative h-36 w-full bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain p-6"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {p.name}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {p.vendor} {p.price ? `· ${p.price}` : ""}
                  </div>
                  {p.note ? (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                      {p.note}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(p.tags || []).map((t, i) => (
                      <Badge key={i}>{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button>View Details →</Button>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
