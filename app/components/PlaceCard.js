import Link from "next/link";
import { TYPE_MAP, sortTags } from "@/app/lib/places";

function getTagClass(tag) {
  if (tag === "Dedicated GF") {
    return "rounded px-2 py-0.5 text-[11px] font-medium bg-accent-dim text-accent";
  }
  return "rounded px-2 py-0.5 text-[11px] border border-rim text-muted";
}

function formatDistance(distanceKm) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

export default function PlaceCard({ place }) {
  const slug = place.slug;
  const displayTypeEn = place.type || "Place";
  const displayType = TYPE_MAP[place.type] || place.type || "장소";
  const noteEn = place.note || place.note_ko;
  const noteKo = place.note_ko || place.note;
  const primaryNameEn = place.nameEn || place.name || "Untitled";
  const primaryNameKo = place.name || place.nameEn || "이름 미정";
  const secondaryNameEn = place.name && place.name !== primaryNameEn ? place.name : null;
  const secondaryNameKo = place.nameEn && place.nameEn !== primaryNameKo ? place.nameEn : null;
  const distanceLabel = formatDistance(place.distanceKm);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-rim bg-surface transition-all hover:border-rim-strong hover:shadow-sm">
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Type + distance row */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <span className="lang-en">{displayTypeEn}</span>
            <span className="lang-ko">{displayType}</span>
          </p>
          {distanceLabel ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                <span className="lang-en">{distanceLabel} away</span>
                <span className="lang-ko">{distanceLabel} 거리</span>
              </span>
              {place.lat && place.lng ? (
                <a
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name || place.nameEn || "목적지")},${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent underline underline-offset-2 transition-opacity hover:opacity-70"
                  title="Open transit directions in Kakao Map"
                >
                  <span className="lang-en">Directions</span>
                  <span className="lang-ko">길찾기</span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Name */}
        <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-fg sm:text-2xl">
          <span className="lang-en">{primaryNameEn}</span>
          <span className="lang-ko">{primaryNameKo}</span>
        </h2>

        {/* Secondary name */}
        {secondaryNameEn || secondaryNameKo ? (
          <p className="mt-1 text-sm text-muted">
            <span className="lang-en">{secondaryNameEn || primaryNameEn}</span>
            <span className="lang-ko">{secondaryNameKo || primaryNameKo}</span>
          </p>
        ) : null}

        {/* Location */}
        <p className="mt-2 text-sm text-muted">
          <span className="lang-en">{place.location || place.address || "Location coming soon"}</span>
          <span className="lang-ko">{place.address || place.location || "위치 정보 준비중"}</span>
        </p>

        {/* Note */}
        {noteEn || noteKo ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            <span className="lang-en">{noteEn}</span>
            <span className="lang-ko">{noteKo}</span>
          </p>
        ) : null}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {sortTags(place.tags).slice(0, 3).map((tag) => (
            <span key={tag} className={getTagClass(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card footer */}
      <div className="border-t border-rim px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/place/${slug}`}
            className="text-sm font-medium text-fg transition-opacity hover:opacity-60"
            aria-label={`View details for ${place.nameEn || place.name || slug}`}
          >
            <span className="lang-en">View details</span>
            <span className="lang-ko">상세 보기</span>
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          {place.naverMapUrl ? (
            <a
              href={place.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted underline underline-offset-2 transition-colors hover:text-fg"
            >
              Naver Map
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
