"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView({ places }) {
  const withCoords = places.filter(
    (p) => typeof p.lat === "number" && typeof p.lng === "number"
  );

  return (
    <div className="mt-4 h-[50vh] overflow-hidden rounded-2xl sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
      <MapContainer
        center={[37.5665, 126.978]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {withCoords.map((place) => (
          <Marker key={place.slug} position={[place.lat, place.lng]}>
            <Popup>
              <strong>
                <span className="lang-en">{place.nameEn || place.name}</span>
                <span className="lang-ko">{place.name}</span>
              </strong>
              <br />
              <span>{place.type}</span>
              <br />
              <Link href={`/place/${place.slug}`}>
                <span className="lang-en">View details →</span>
                <span className="lang-ko">상세보기 →</span>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
