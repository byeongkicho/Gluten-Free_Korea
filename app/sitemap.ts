import type { MetadataRoute } from "next";
import { getPlaceSlugs } from "@/lib/places";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gfkorea.com";

  const staticRoutes = ["/", "/dining", "/cafe", "/about"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  const placeRoutes = getPlaceSlugs().map((slug) => ({
    url: `${base}/place/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...placeRoutes];
}
