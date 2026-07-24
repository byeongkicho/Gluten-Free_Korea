import placesData from "@/data/places.json";
import { getAllPosts } from "@/app/lib/blog";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";

export default function sitemap() {
  const places = Array.isArray(placesData) ? placesData.filter((p) => p?.slug) : [];
  // Only expose published posts — "upcoming" stubs are thin content and are
  // also noindex'd at the page level (see app/blog/[slug]/page.js).
  const posts = getAllPosts().filter((p) => p.status === "published");

  // Build time stands in as a freshness signal for hand-authored static pages
  // rather than a hardcoded date that silently goes stale.
  const buildDate = new Date();

  const staticRoutes = [
    {
      url: `${base}/`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/guide`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/about`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/blog`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const placeRoutes = places.map((place) => ({
    url: `${base}/place/${place.slug}`,
    lastModified: place.updatedAt ? new Date(place.updatedAt) : buildDate,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const areaRoutes = ["seoul", "gyeonggi", "cheonan"].map((area) => ({
    url: `${base}/area/${area}`,
    lastModified: buildDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : buildDate,
    changeFrequency: "monthly",
    priority: post.pillar ? 0.95 : 0.85,
  }));

  return [...staticRoutes, ...areaRoutes, ...placeRoutes, ...blogRoutes];
}
