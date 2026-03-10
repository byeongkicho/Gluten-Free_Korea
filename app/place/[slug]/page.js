import Link from "next/link";
import { notFound } from "next/navigation";
import places from "@/data/places.json";

const TYPE_MAP = {
  "음식점": "Restaurant",
  "카페": "Cafe",
  "베이커리": "Bakery",
  "제과,베이커리": "Bakery",
};

const TAG_PRIORITY = [
  "Dedicated GF",
  "Restaurant",
  "Cafe",
  "Bakery",
  "Pizza",
  "Bread",
  "Dessert",
];

function sortTags(tags) {
  if (!Array.isArray(tags)) return [];
  const priority = new Map(TAG_PRIORITY.map((tag, index) => [tag, index]));
  return [...tags].sort((a, b) => {
    const ai = priority.has(a) ? priority.get(a) : Number.MAX_SAFE_INTEGER;
    const bi = priority.has(b) ? priority.get(b) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return String(a).localeCompare(String(b));
  });
}

function getValidatedPlaces() {
  const rows = Array.isArray(places) ? places : [];
  const seen = new Set();

  for (const place of rows) {
    const slug = place?.slug;
    if (!slug || typeof slug !== "string") continue;
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug found in data/places.json: ${slug}`);
    }
    seen.add(slug);
  }

  return rows;
}

const validatedPlaces = getValidatedPlaces();

function getPlaceBySlug(slug) {
  return validatedPlaces.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return validatedPlaces
    .filter((p) => typeof p.slug === "string" && p.slug.trim().length > 0)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  const title = place
    ? `${place.name} – Gluten-Free Options in Korea | Gluten-Free Korea`
    : "Place Not Found";
  const fallbackParts = [
    place?.type,
    place?.location || place?.address,
    "Verify ingredients and cross-contamination on visit.",
  ].filter(Boolean);
  const description = place?.note || fallbackParts.join(" · ") || "Gluten-free place detail";
  const path = `/place/${slug}`;
  const image = "/og-default.png";

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

export default async function PlaceDetailPage({ params }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const displayType = place.type || "Place";
  const displayTypeEn = TYPE_MAP[place.type] || place.type || "Place";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: place.name,
    description: place.note || undefined,
    address: place.address
      ? { "@type": "PostalAddress", streetAddress: place.address }
      : undefined,
    url: place.website || `${siteUrl}/place/${slug}`,
    servesCuisine: "Gluten-Free",
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="lang-en">← Back to list</span>
          <span className="lang-ko">← 목록으로 돌아가기</span>
        </Link>

        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            <span className="lang-en">{displayTypeEn}</span>
            <span className="lang-ko">{displayType}</span>
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-3xl">
            <span className="lang-en">{place.nameEn || place.name}</span>
            <span className="lang-ko">{place.name}</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {place.location || (
              <>
                <span className="lang-en">Location coming soon</span>
                <span className="lang-ko">위치 정보 준비중</span>
              </>
            )}
          </p>
          {place.address || place.addressEn ? (
            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="lang-en">Address (show to taxi driver)</span>
                <span className="lang-ko">주소 (택시 기사님께 보여주세요)</span>
              </p>
              {place.address ? (
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {place.address}
                </p>
              ) : null}
              {place.addressEn ? (
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                  {place.addressEn}
                </p>
              ) : null}
            </div>
          ) : null}

          {place.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {sortTags(place.tags).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {place.note ? (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Notes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {place.note}
            </p>
          </section>
        ) : null}

        {(place.website || place.naverMapUrl) && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Links
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {place.website ? (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Website
                </a>
              ) : null}
              {place.naverMapUrl ? (
                <a
                  href={place.naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Naver Map
                </a>
              ) : null}
            </div>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <span className="lang-en">
              Safety note: always reconfirm ingredients and cross-contamination
              with staff.
            </span>
            <span className="lang-ko">
              안전 안내: 재료와 조리도구 교차오염 여부를 방문 시점에 꼭 다시 확인하세요.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
