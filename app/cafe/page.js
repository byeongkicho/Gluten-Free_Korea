import Link from "next/link";
import PlaceCard from "@/app/components/PlaceCard";
import { getPlacesByCategory } from "@/lib/places";

export default async function CafePage() {
  const places = getPlacesByCategory("CAFE");

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Cafe</h1>

      {places.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No cafes found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <Link key={place.slug} href={`/place/${place.slug}`}>
            <PlaceCard place={place} />
          </Link>
        ))}
      </div>

      {places.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {places.length} {places.length === 1 ? "place" : "places"}
          </p>
        </div>
      )}
    </main>
  );
}
