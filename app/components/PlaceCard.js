import Link from "next/link";
import { TYPE_MAP, sortTags } from "@/app/lib/places";

function getTagClass(tag) {
  if (tag === "Dedicated GF") {
    return "rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300";
  }

  return "rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300";
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
    <div className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100/70 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200/70 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-gray-700 sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-emerald-50/90 to-transparent dark:from-emerald-950/20" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          <span className="lang-en">{displayTypeEn}</span>
          <span className="lang-ko">{displayType}</span>
        </p>
        <span className="rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-400">
          <span className="lang-en">Details</span>
          <span className="lang-ko">상세</span>
        </span>
      </div>
      {distanceLabel ? (
        <div className="relative z-10 mt-3 flex items-center gap-2">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <span className="lang-en">{distanceLabel} away</span>
            <span className="lang-ko">{distanceLabel} 거리</span>
          </p>
          {place.lat && place.lng ? (
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name || place.nameEn || "목적지")},${place.lat},${place.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              title="Open transit directions in Kakao Map"
            >
              🚌
              <span className="lang-en">Directions</span>
              <span className="lang-ko">길찾기</span>
            </a>
          ) : null}
        </div>
      ) : null}
      <h2 className="relative z-10 mt-3 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-xl">
        <span className="lang-en">{primaryNameEn}</span>
        <span className="lang-ko">{primaryNameKo}</span>
      </h2>
      {secondaryNameEn || secondaryNameKo ? (
        <h3 className="relative z-10 mt-1 line-clamp-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span className="lang-en">{secondaryNameEn || primaryNameEn}</span>
          <span className="lang-ko">{secondaryNameKo || primaryNameKo}</span>
        </h3>
      ) : null}
      <p className="relative z-10 mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        <span className="lang-en">{place.location || place.address || "Location coming soon"}</span>
        <span className="lang-ko">{place.address || place.location || "위치 정보 준비중"}</span>
      </p>
      {noteEn || noteKo ? (
        <p className="relative z-10 mt-3 line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          <span className="lang-en">{noteEn}</span>
          <span className="lang-ko">{noteKo}</span>
        </p>
      ) : null}
      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {sortTags(place.tags).slice(0, 3).map((tag) => (
          <span key={tag} className={getTagClass(tag)}>
            {tag}
          </span>
        ))}
      </div>
      <div className="relative z-10 mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/place/${slug}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 sm:w-auto"
            aria-label={`View details for ${place.nameEn || place.name || slug}`}
          >
            <span className="lang-en">View details</span>
            <span className="lang-ko">상세 보기</span>
            <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
          </Link>
          {place.naverMapUrl ? (
            <a
              href={place.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto sm:text-xs"
            >
              Naver Map
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
