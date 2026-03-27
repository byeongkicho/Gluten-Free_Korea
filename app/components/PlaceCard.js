import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/app/lib/analytics";
import { TYPE_MAP, TAG_MAP, sortTags } from "@/app/lib/places";

function getThumbSrc(src) {
  if (!src) return src;
  const lastSlash = src.lastIndexOf("/");
  if (lastSlash === -1) return src;
  return src.slice(0, lastSlash + 1) + "thumb_" + src.slice(lastSlash + 1);
}

function getCardGradient(tags, type) {
  const isDedicatedGF = tags?.includes("Dedicated GF");
  const isPizza = tags?.includes("Pizza") || type === "Pizza";
  const isCafe = type === "Cafe" || type === "Bakery" || tags?.includes("Bakery");

  if (isDedicatedGF) return { bg: "from-emerald-500/20 via-green-400/15 to-teal-500/10", emoji: "✨" };
  if (isPizza) return { bg: "from-red-500/20 via-orange-400/15 to-amber-500/10", emoji: "🍕" };
  if (isCafe) return { bg: "from-pink-400/20 via-rose-300/15 to-fuchsia-400/10", emoji: "☕" };
  if (type === "Restaurant") return { bg: "from-amber-500/20 via-orange-400/15 to-yellow-500/10", emoji: "🍽️" };
  return { bg: "from-slate-400/15 via-gray-300/10 to-zinc-400/10", emoji: "📍" };
}

function getTagClass(tag) {
  if (tag === "Dedicated GF") {
    return "rounded px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-300/50 dark:ring-emerald-600/40";
  }
  return "rounded px-2 py-0.5 text-[11px] border border-rim text-muted";
}

function formatDistance(distanceKm) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

export default function PlaceCard({ place, priority = false }) {
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

  const gradient = getCardGradient(place.tags, place.type);
  const hasImage = place.images?.length > 0;

  const gfBadge = place.tags?.includes("Dedicated GF") ? (
    <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
      <span className="lang-en">✨ Dedicated GF</span>
      <span className="lang-ko">✨ 전문점</span>
    </span>
  ) : null;

  return (
    <Link
      href={`/place/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-rim bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-rim-strong hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={`${place.nameEn || place.name || slug} — view details`}
      onClick={() =>
        trackEvent("view_place_detail", {
          place_slug: slug,
          place_name: place.nameEn || place.name || slug,
          place_type: place.type || "unknown",
        })
      }
    >
      {/* Visual header */}
      {hasImage ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={getThumbSrc(place.images[0])}
            alt={place.nameEn || place.name || "Place photo"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading={priority ? undefined : "lazy"}
            priority={priority}
          />
          {/* Bottom gradient for readability */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40" />
          {gfBadge}
        </div>
      ) : (
        <div className={`relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${gradient.bg}`}>
          <span className="text-5xl opacity-50 transition-transform group-hover:scale-110">{gradient.emoji}</span>
          {gfBadge}
        </div>
      )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent("click_external_link", {
                      link_type: "kakao_map_directions",
                      place_slug: slug,
                      place_name: place.nameEn || place.name || slug,
                    });
                  }}
                  className="relative z-10 text-xs text-accent underline underline-offset-2 transition-opacity hover:opacity-70"
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
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            <span className="lang-en">{noteEn}</span>
            <span className="lang-ko">{noteKo}</span>
          </p>
        ) : null}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {sortTags(place.tags).slice(0, 3).map((tag) => (
            <span key={tag} className={getTagClass(tag)}>
              <span className="lang-en">{tag}</span>
              <span className="lang-ko">{TAG_MAP[tag] || tag}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Card footer */}
      <div className="border-t border-rim px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between">
          <span className="text-sm font-medium text-fg transition-opacity group-hover:opacity-70">
            <span className="lang-en">View details</span>
            <span className="lang-ko">상세 보기</span>
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
          {place.naverMapUrl ? (
            <a
              href={place.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackEvent("click_external_link", {
                  link_type: "naver_map",
                  place_slug: slug,
                  place_name: place.nameEn || place.name || slug,
                });
              }}
              className="relative z-10 text-xs text-muted underline underline-offset-2 transition-colors hover:text-fg"
            >
              Naver Map
            </a>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
