import Link from "next/link";
import { notFound } from "next/navigation";
import places from "@/data/restaurants.json";

function getValidatedPlaces() {
  const rows = Array.isArray(places) ? places : [];
  const seen = new Set();

  for (const place of rows) {
    const slug = place?.slug;
    if (!slug || typeof slug !== "string") continue;
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug found in data/restaurants.json: ${slug}`);
    }
    seen.add(slug);
  }

  return rows;
}

export function generateStaticParams() {
  return getValidatedPlaces()
    .filter((p) => typeof p.slug === "string" && p.slug.trim().length > 0)
    .map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const { slug } = params;
  const place = getValidatedPlaces().find((p) => p.slug === slug);
  const title = place ? `${place.name} | Gluten-Free Korea` : "Place Not Found";
  const description = place?.note || "Gluten-free place detail";
  const path = place ? `/place/${slug}` : `/place/${slug}`;
  const image = "/file.svg";

  return {
    title,
    description,
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: place?.name || "GF Korea place detail",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function PlaceDetailPage({ params }) {
  const { slug } = params;
  const place = getValidatedPlaces().find((p) => p.slug === slug);

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
