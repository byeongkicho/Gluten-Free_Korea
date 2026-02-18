import placesRaw from "@/content/places.json";
import { cache } from "react";

export type PlaceCategory = "DINING" | "CAFE";
export type GFLevel = "DEDICATED_GF" | "GF_OPTIONS" | "UNCERTAIN";

export type Place = {
  slug: string;
  name_ko: string;
  name_en?: string;

  category: PlaceCategory;
  gf_level: GFLevel;

  area?: string;
  address?: string;
  naver_map_url?: string;
  website?: string;

  short_review?: string;
  review?: string;

  tags?: string[];
  photos?: string[];
  sources?: string[];
  updated_at?: string;
};

function isPlaceCategory(v: unknown): v is PlaceCategory {
  return v === "DINING" || v === "CAFE";
}

function isGFLevel(v: unknown): v is GFLevel {
  return v === "DEDICATED_GF" || v === "GF_OPTIONS" || v === "UNCERTAIN";
}

function normalizeAndValidate(raw: unknown): Place[] {
  if (!Array.isArray(raw)) {
    throw new Error("content/places.json must be an array");
  }

  const seen = new Set<string>();

  const places: Place[] = raw.map((p: any, idx: number) => {
    const where = `places.json[${idx}]`;

    if (!p || typeof p !== "object") throw new Error(`${where} must be an object`);

    if (!p.slug || typeof p.slug !== "string") {
      throw new Error(`${where}.slug is required (string)`);
    }
    if (!p.name_ko || typeof p.name_ko !== "string") {
      throw new Error(`${where}.name_ko is required (string)`);
    }
    if (!isPlaceCategory(p.category)) {
      throw new Error(`${where}.category must be DINING|CAFE`);
    }
    if (!isGFLevel(p.gf_level)) {
      throw new Error(`${where}.gf_level must be DEDICATED_GF|GF_OPTIONS|UNCERTAIN`);
    }

    if (seen.has(p.slug)) {
      throw new Error(`${where}.slug duplicated: ${p.slug}`);
    }
    seen.add(p.slug);

    const place: Place = {
      slug: p.slug,
      name_ko: p.name_ko,
      name_en: typeof p.name_en === "string" ? p.name_en : undefined,
      category: p.category,
      gf_level: p.gf_level,
      area: typeof p.area === "string" ? p.area : undefined,
      address: typeof p.address === "string" ? p.address : undefined,
      naver_map_url: typeof p.naver_map_url === "string" ? p.naver_map_url : undefined,
      website: typeof p.website === "string" ? p.website : undefined,
      short_review: typeof p.short_review === "string" ? p.short_review : undefined,
      review: typeof p.review === "string" ? p.review : undefined,
      tags: Array.isArray(p.tags) ? p.tags.filter((t: any) => typeof t === "string") : undefined,
      photos: Array.isArray(p.photos)
        ? p.photos.filter((t: any) => typeof t === "string")
        : undefined,
      sources: Array.isArray(p.sources)
        ? p.sources.filter((t: any) => typeof t === "string")
        : undefined,
      updated_at: typeof p.updated_at === "string" ? p.updated_at : undefined,
    };

    return place;
  });

  return places;
}

function sortPlaces(a: Place, b: Place) {
  // category fixed order, then name
  const catOrder: Record<PlaceCategory, number> = { DINING: 0, CAFE: 1 };
  const c = catOrder[a.category] - catOrder[b.category];
  if (c !== 0) return c;
  return a.name_ko.localeCompare(b.name_ko, "ko");
}

export const getAllPlaces = cache((): Place[] => {
  const places = normalizeAndValidate(placesRaw);
  return [...places].sort(sortPlaces);
});

export const getPlacesByCategory = cache((category: PlaceCategory): Place[] => {
  return getAllPlaces().filter((p) => p.category === category);
});

export const getPlaceBySlug = cache((slug: string): Place | null => {
  return getAllPlaces().find((p) => p.slug === slug) ?? null;
});

export const getPlaceSlugs = cache((): string[] => {
  return getAllPlaces().map((p) => p.slug);
});
