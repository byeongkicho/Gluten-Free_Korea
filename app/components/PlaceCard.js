import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

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

export default function PlaceCard({ place }) {
  return (
    <Card>
      <div className="relative h-32 w-full bg-gray-50 dark:bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl">{place.category === "DINING" ? "🍽️" : "☕️"}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {place.name_ko}
          </h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {place.area || ""}
        </div>

        {place.short_review ? (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {place.short_review}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={place.category === "DINING" ? "blue" : "purple"}>
            {place.category}
          </Badge>
          <Badge variant="outline">{gfLabel(place.gf_level)}</Badge>
        </div>
      </div>
    </Card>
  );
}
