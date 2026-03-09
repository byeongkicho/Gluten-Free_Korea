import Link from "next/link";
import { notFound } from "next/navigation";
import places from "@/data/restaurants.json";
import slugify from "@/lib/slugify";

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug || slugify(p.name) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const place = places.find((p) => (p.slug || slugify(p.name)) === slug);
  return {
    title: place ? `${place.name} | Gluten-Free Korea` : "Place Not Found",
    description: place?.note || "Gluten-free place detail",
  };
}

export default async function PlaceDetailPage({ params }) {
  const { slug } = await params;
  const place = places.find((p) => (p.slug || slugify(p.name)) === slug);

  if (!place) notFound();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to list
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          {place.name}
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {place.type}{place.location ? ` · ${place.location}` : ""}
        </p>

        {place.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {place.note ? (
          <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Notes</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
              {place.note}
            </p>
          </section>
        ) : null}

        <section className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Safety reminder: always confirm ingredients and cross-contamination with staff.
          </p>
        </section>
      </div>
    </main>
  );
}
