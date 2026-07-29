"use client";

import PlaceCard from "./PlaceCard";

// Client boundary so PlaceCard's interactive handlers (analytics onClick) work
// when embedded on a server-rendered page like the homepage.
export default function FeaturedPlaces({ places }) {
  const list = Array.isArray(places) ? places : [];
  if (list.length === 0) return null;
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((place, index) => (
        <PlaceCard key={place.slug} place={place} priority={index < 3} />
      ))}
    </div>
  );
}
