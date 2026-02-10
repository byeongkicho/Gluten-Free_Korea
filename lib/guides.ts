export type GuideMeta = {
  title: string;
  description: string;
  date?: string;
  updated?: string;
  tags?: string[];
};

export type Guide = {
  slug: string;
  meta: GuideMeta;
  // Lightweight heuristic: store minutes directly to avoid heavy parsing deps.
  readingMinutes?: number;
};

export const guides: Guide[] = [
  {
    slug: "getting-started",
    meta: {
      title: "Gluten-Free in Korea: Getting Started (2026)",
      description:
        "A practical, safety-first starter guide for travelers and residents with celiac disease or gluten sensitivity in Korea.",
      date: "2026-02-08",
      updated: "2026-02-08",
      tags: ["Guide", "Korea", "Celiac", "Gluten-Free"],
    },
    readingMinutes: 6,
  },
  {
    slug: "dining-card-korean",
    meta: {
      title: "Celiac Dining Card (Korean): Printable Phrases",
      description:
        "A simple Korean dining card for celiac disease / gluten sensitivity: key phrases to reduce risk and communicate cross-contamination needs.",
      date: "2026-02-08",
      updated: "2026-02-08",
      tags: ["Guide", "Korea", "Celiac", "Dining Card"],
    },
    readingMinutes: 4,
  },
].sort((a, b) => {
  const aUpdated = a.meta.updated || a.meta.date || "";
  const bUpdated = b.meta.updated || b.meta.date || "";
  return bUpdated.localeCompare(aUpdated);
});

export function getGuideBySlug(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}
