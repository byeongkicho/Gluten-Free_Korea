import placesData from "@/data/places.json";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const places = Array.isArray(placesData) ? placesData.filter((p) => p?.slug) : [];

  const staticRoutes = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const placeRoutes = places.map((p) => ({
    url: `${base}/place/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...placeRoutes];
}
