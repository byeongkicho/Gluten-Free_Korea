import placesData from "@/data/places.json";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";

export default function sitemap() {
  const places = Array.isArray(placesData) ? placesData.filter((p) => p?.slug) : [];

  const staticRoutes = [
    {
      url: `${base}/`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/guide`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const placeRoutes = places.map((place) => ({
    url: `${base}/place/${place.slug}`,
    lastModified: place.updatedAt ? new Date(place.updatedAt) : new Date("2026-03-10"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const areaRoutes = ["seoul", "gyeonggi", "cheonan"].map((area) => ({
    url: `${base}/area/${area}`,
    lastModified: new Date("2026-03-26"),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...areaRoutes, ...placeRoutes];
}
