import { getAllPosts } from "@/app/lib/blog";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";

export default function sitemap() {
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
      url: `${base}/places`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
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
    {
      url: `${base}/contact`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 매장 상세는 sitemap에서 뺀다 — 페이지 레벨에서도 noindex다
  // (app/place/[slug]/page.js 참조). 디렉터리 진입점은 /places 와 /area/* 가
  // 맡는다. 매장별 고유 콘텐츠가 충분해지면 둘 다 되돌릴 것.

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

  return [...staticRoutes, ...areaRoutes, ...blogRoutes];
}
