import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { getPlaceBySlug } from "@/lib/places";

function gfLabel(gfLevel) {
  switch (gfLevel) {
    case "DEDICATED_GF":
      return "Dedicated GF";
    case "GF_OPTIONS":
      return "GF options";
    default:
      return "Verify";
  }
}

export default async function PlacePage({ params }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) notFound();

  const backHref = place.category === "DINING" ? "/dining" : "/cafe";
  const backLabel = place.category === "DINING" ? "Dining" : "Cafe";

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={backHref}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {"<- Back to "}{backLabel}
        </Link>
      </div>

      <Card>
        <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">{place.category === "DINING" ? "🍽️" : "☕️"}</div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-3">
                {place.name_ko}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant={place.category === "DINING" ? "blue" : "purple"}>
                  {place.category}
                </Badge>
                <Badge variant="outline">{gfLabel(place.gf_level)}</Badge>
              </div>
              {place.area ? (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {place.area}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {place.review ? (
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-3">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {place.review}
                </p>
              </div>
            ) : null}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Gluten-Free (verify on visit)
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Always confirm cross-contamination practices with staff and check updated menus.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {place.address || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Map</p>
                  {place.naver_map_url ? (
                    <a
                      href={place.naver_map_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Open Naver Map
                    </a>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
