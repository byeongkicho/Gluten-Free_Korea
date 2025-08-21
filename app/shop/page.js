import Image from "next/image";
import Link from "next/link";
import products from "../../data/products.json";

export default function ShopPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1
        className="text-3xl font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        Shop Gluten-Free Essentials
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--foreground)" }}>
        Some links may be affiliate links. If you purchase through them, we may
        earn a small commission at no extra cost to you. Thank you for
        supporting GF Korea!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, idx) => {
          const slug = p.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
          return (
            <Link key={idx} href={`/shop/${slug}`}>
              <div
                className="rounded-xl shadow border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                style={{
                  background: "var(--background)",
                  color: "var(--foreground)",
                  borderColor: "var(--border)",
                  borderWidth: 1,
                }}
              >
                <div
                  className="relative h-36 w-full"
                  style={{ background: "rgba(0,0,0,0.02)" }}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain p-6"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="text-sm opacity-70 mt-1">
                    {p.vendor} · {p.price}
                  </div>
                  <p className="text-gray-700 text-sm mt-2 opacity-90">
                    {p.note}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags?.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full ring-1"
                        style={{
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: "#2563eb",
                        color: "white",
                      }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
