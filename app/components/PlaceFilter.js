"use client";

import Link from "next/link";
import { useState } from "react";
import { TYPE_MAP, sortTags } from "@/app/lib/places";

function getTypeLabel(type) {
  const korean = TYPE_MAP[type] || type;

  if (type === "All") {
    return (
      <>
        <span className="lang-en">All</span>
        <span className="lang-ko">전체</span>
      </>
    );
  }

  return (
    <>
      <span className="lang-en">{type}</span>
      <span className="lang-ko">{korean}</span>
    </>
  );
}

function getTagClass(tag) {
  if (tag === "Dedicated GF") {
    return "rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300";
  }

  return "rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300";
}

function getDistanceKm(from, to) {
  if (!from || !to) return null;

  const lat1 = Number(from.lat);
  const lng1 = Number(from.lng);
  const lat2 = Number(to.lat);
  const lng2 = Number(to.lng);

  if ([lat1, lng1, lat2, lng2].some((value) => Number.isNaN(value))) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

export default function PlaceFilter({ places }) {
  const safePlaces = Array.isArray(places) ? places : [];
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const [sortMode, setSortMode] = useState("default");
  const [userLocation, setUserLocation] = useState(null);
  const [locationState, setLocationState] = useState("idle");
  const types = [...new Set(safePlaces.map((place) => place?.type).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );

  function extractDistrict(location) {
    if (!location) return null;
    const after = location.indexOf(",");
    if (after === -1) return null;
    const part = location.slice(after + 1).trim();
    const paren = part.indexOf("(");
    return paren === -1 ? part.trim() : part.slice(0, paren).trim();
  }

  const districts = [...new Set(safePlaces.map((p) => extractDistrict(p.location)).filter(Boolean))].sort();

  const q = query.trim().toLowerCase();
  const afterSearch = q
    ? safePlaces.filter((p) =>
        [p.name, p.nameEn, p.address, p.addressEn, p.location].some(
          (field) => field && field.toLowerCase().includes(q)
        )
      )
    : safePlaces;
  const afterDistrict =
    district === "All"
      ? afterSearch
      : afterSearch.filter((p) => extractDistrict(p.location) === district);
  const afterType =
    active === "All"
      ? afterDistrict
      : afterDistrict.filter((place) => place?.type === active);
  const withDistance = afterType.map((place) => ({
    ...place,
    distanceKm: getDistanceKm(userLocation, place),
  }));
  const visiblePlaces =
    sortMode === "nearest" && userLocation
      ? [...withDistance].sort((a, b) => {
          const aDistance = typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_SAFE_INTEGER;
          const bDistance = typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_SAFE_INTEGER;
          return aDistance - bDistance;
        })
      : withDistance;
  const activeDistrictLabel = district === "All" ? "All areas" : district;
  const activeTypeLabel = active === "All" ? "All types" : active;
  const hasLocation = Boolean(userLocation);
  const canRetryLocation = locationState === "denied" || locationState === "error";
  const showSettingsHint = locationState === "denied";

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortMode("nearest");
        setLocationState("ready");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
          return;
        }

        setLocationState("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function resetNearby() {
    setSortMode("default");
  }

  function renderLocationStatus() {
    if (locationState === "ready") {
      return (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
          <span className="lang-en">Nearby places are now sorted by distance. You can switch back to Recommended anytime.</span>
          <span className="lang-ko">이제 가까운 순으로 정렬됩니다. 원하면 언제든 추천순으로 다시 바꿀 수 있습니다.</span>
        </p>
      );
    }

    if (locationState === "loading") {
      return (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
          <span className="lang-en">Checking your location now…</span>
          <span className="lang-ko">현재 위치를 확인하는 중입니다…</span>
        </p>
      );
    }

    if (locationState === "unsupported") {
      return (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300" aria-live="polite">
          <span className="lang-en">Location is not supported on this device or browser.</span>
          <span className="lang-ko">이 기기 또는 브라우저에서는 위치 기능을 지원하지 않습니다.</span>
        </p>
      );
    }

    if (locationState === "denied") {
      return (
        <div className="mt-2 space-y-2" aria-live="polite">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="lang-en">Location permission was denied. Nearby sorting stays off until you allow location and try again.</span>
            <span className="lang-ko">위치 권한이 거부되었습니다. 브라우저에서 위치 권한을 허용한 뒤 다시 시도해야 가까운 순 정렬이 켜집니다.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="lang-en">Tip: if you blocked it earlier, open your browser site settings for this page, allow location, then tap Try again.</span>
            <span className="lang-ko">팁: 이전에 차단했다면 이 페이지의 브라우저 사이트 설정에서 위치를 허용한 뒤 다시 시도하세요.</span>
          </p>
        </div>
      );
    }

    if (locationState === "error") {
      return (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300" aria-live="polite">
          <span className="lang-en">We couldn’t get your location. Please try again in a moment.</span>
          <span className="lang-ko">현재 위치를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.</span>
        </p>
      );
    }

    return (
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        <span className="lang-en">Turn on location to sort places by distance and show how far each one is.</span>
        <span className="lang-ko">위치를 켜면 가까운 순으로 정렬되고 각 장소까지의 거리가 표시됩니다.</span>
      </p>
    );
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              <span className="lang-en">Find a place</span>
              <span className="lang-ko">장소 찾기</span>
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="lang-en">{visiblePlaces.length} places shown</span>
              <span className="lang-ko">{visiblePlaces.length}곳 표시 중</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
              <span className="lang-en">{activeDistrictLabel}</span>
              <span className="lang-ko">{district === "All" ? "전체 지역" : district}</span>
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
              <span className="lang-en">{activeTypeLabel}</span>
              <span className="lang-ko">{active === "All" ? "전체 유형" : TYPE_MAP[active] || active}</span>
            </span>
          </div>
        </div>

        <label className="relative mt-4 block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M14.167 14.167 17.5 17.5M16.667 9.167a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
          />
        </label>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span className="lang-en">Nearby</span>
            <span className="lang-ko">내 주변</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetNearby}
              className={
                sortMode === "default"
                  ? "rounded-full px-3.5 py-2 text-sm font-medium transition bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500"
                  : "rounded-full px-3.5 py-2 text-sm font-medium transition border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              }
            >
              <span className="lang-en">Recommended</span>
              <span className="lang-ko">추천순</span>
            </button>
            {hasLocation ? (
              <button
                type="button"
                onClick={() => setSortMode("nearest")}
                className={
                  sortMode === "nearest"
                    ? "rounded-full px-3.5 py-2 text-sm font-medium transition bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500"
                    : "rounded-full px-3.5 py-2 text-sm font-medium transition border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                }
              >
                <span className="lang-en">Nearest</span>
                <span className="lang-ko">가까운 순</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={requestLocation}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
            >
              <span className="lang-en">
                {locationState === "loading"
                  ? "Checking location..."
                  : canRetryLocation
                    ? "Try again"
                    : hasLocation
                      ? "Update my location"
                      : "Turn on location"}
              </span>
              <span className="lang-ko">
                {locationState === "loading"
                  ? "위치 확인 중..."
                  : canRetryLocation
                    ? "다시 시도"
                    : hasLocation
                      ? "내 위치 업데이트"
                      : "위치 켜기"}
              </span>
            </button>
          </div>
          {renderLocationStatus()}
          {showSettingsHint ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestLocation}
                className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-900/30"
              >
                <span className="lang-en">Try location again</span>
                <span className="lang-ko">위치 다시 시도</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span className="lang-en">Area</span>
            <span className="lang-ko">지역</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {["All", ...districts].map((d) => {
              const isActive = district === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistrict(d)}
                  className={
                    isActive
                      ? "rounded-full px-3.5 py-2 text-sm font-medium transition bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500"
                      : "rounded-full px-3.5 py-2 text-sm font-medium transition border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                  }
                >
                  {d === "All" ? (
                    <>
                      <span className="lang-en">All Areas</span>
                      <span className="lang-ko">전체 지역</span>
                    </>
                  ) : (
                    <>
                      <span className="lang-en">{d}</span>
                      <span className="lang-ko">{d}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span className="lang-en">Type</span>
            <span className="lang-ko">유형</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {["All", ...types].map((type) => {
              const isActive = active === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActive(type)}
                  className={
                    isActive
                      ? "rounded-full px-3.5 py-2 text-sm font-medium transition bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500"
                      : "rounded-full px-3.5 py-2 text-sm font-medium transition border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                  }
                >
                  {getTypeLabel(type)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {visiblePlaces.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <span className="lang-en">No places match your filters.</span>
          <span className="lang-ko">조건에 맞는 장소가 없습니다.</span>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>div:last-child:nth-child(odd)]:sm:col-span-2 [&>div:last-child:nth-child(odd)]:sm:w-full [&>div:last-child:nth-child(odd)]:lg:col-span-1">
          {visiblePlaces.map((place) => {
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
              <div
                key={slug}
                className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100/70 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200/70 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-gray-700 sm:p-5"
              >
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
          })}
        </div>
      )}
    </section>
  );
}
