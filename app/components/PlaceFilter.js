"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { TYPE_MAP } from "@/app/lib/places";
import { trackEvent } from "@/app/lib/analytics";
import PlaceCard from "./PlaceCard";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 flex h-[400px] items-center justify-center rounded-2xl border border-rim bg-surface-2 animate-pulse">
      <div className="text-center">
        <svg className="mx-auto h-8 w-8 text-muted animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
        <p className="mt-3 text-sm text-muted">
          <span className="lang-en">Loading map...</span>
          <span className="lang-ko">지도 불러오는 중...</span>
        </p>
      </div>
    </div>
  ),
});

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

function extractDistrict(location) {
  if (!location) return null;
  const after = location.indexOf(",");
  if (after === -1) return null;
  const part = location.slice(after + 1).trim();
  const paren = part.indexOf("(");
  return paren === -1 ? part.trim() : part.slice(0, paren).trim();
}

const RADIUS_OPTIONS = [
  { value: null, labelEn: "All", labelKo: "전체" },
  { value: 1, labelEn: "≤ 1 km", labelKo: "1km 이내" },
  { value: 3, labelEn: "≤ 3 km", labelKo: "3km 이내" },
  { value: 5, labelEn: "≤ 5 km", labelKo: "5km 이내" },
  { value: 10, labelEn: "≤ 10 km", labelKo: "10km 이내" },
];

// Flat, editorial chip styles — no pill shape, intentional hierarchy
const chipActive =
  "px-3 py-1.5 text-sm font-medium bg-fg text-bg rounded transition-colors";
const chipInactive =
  "px-3 py-1.5 text-sm font-medium text-muted rounded hover:text-fg hover:bg-surface-2 transition-colors";

const chipSmActive =
  "px-2.5 py-1 text-xs font-medium bg-fg text-bg rounded transition-colors";
const chipSmInactive =
  "px-2.5 py-1 text-xs font-medium text-muted rounded border border-rim hover:text-fg hover:bg-surface-2 transition-colors";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;

export default function PlaceFilter({ places }) {
  const safePlaces = Array.isArray(places) ? places : [];
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const [sortMode, setSortMode] = useState("default");
  const [userLocation, setUserLocation] = useState(null);
  const [locationState, setLocationState] = useState("idle");
  const [radiusKm, setRadiusKm] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const types = [...new Set(safePlaces.map((place) => place?.type).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
  const districts = [...new Set(safePlaces.map((p) => extractDistrict(p.location)).filter(Boolean))].sort();

  // --- Filter pipeline ---
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
  const afterRadius =
    radiusKm && userLocation
      ? withDistance.filter(
          (p) => typeof p.distanceKm === "number" && p.distanceKm <= radiusKm
        )
      : withDistance;
  const visiblePlaces =
    sortMode === "nearest" && userLocation
      ? [...afterRadius].sort((a, b) => {
          const aD = typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_SAFE_INTEGER;
          const bD = typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_SAFE_INTEGER;
          return aD - bD;
        })
      : afterRadius;

  const hasLocation = Boolean(userLocation);
  const canRetryLocation = locationState === "denied" || locationState === "error";
  const showSettingsHint = locationState === "denied";
  const displayedPlaces = visiblePlaces.slice(0, visibleCount);
  const hasMorePlaces = viewMode === "list" && visiblePlaces.length > visibleCount;

  function requestLocation() {
    trackEvent("filter_places", {
      filter_kind: "location_request",
      filter_value: hasLocation ? "update_location" : "use_my_location",
    });

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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function resetNearby() {
    setSortMode("default");
    setRadiusKm(null);
    trackEvent("filter_places", {
      filter_kind: "sort_mode",
      filter_value: "default",
    });
  }

  function renderLocationStatus() {
    if (locationState === "ready") {
      return (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          <span className="lang-en">Sorted by distance. Switch back anytime.</span>
          <span className="lang-ko">거리순으로 정렬됩니다. 언제든 추천순으로 바꿀 수 있습니다.</span>
        </p>
      );
    }

    if (locationState === "loading") {
      return (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          <span className="lang-en">Checking your location…</span>
          <span className="lang-ko">현재 위치를 확인하는 중입니다…</span>
        </p>
      );
    }

    if (locationState === "unsupported") {
      return (
        <p className="mt-2 text-xs text-amber-fg" aria-live="polite">
          <span className="lang-en">Location is not supported on this device or browser.</span>
          <span className="lang-ko">이 기기 또는 브라우저에서는 위치 기능을 지원하지 않습니다.</span>
        </p>
      );
    }

    if (locationState === "denied") {
      return (
        <div className="mt-2 space-y-1.5" aria-live="polite">
          <p className="text-xs text-amber-fg">
            <span className="lang-en">Location permission was denied. Allow location in your browser settings and try again.</span>
            <span className="lang-ko">위치 권한이 거부되었습니다. 브라우저 설정에서 허용한 뒤 다시 시도하세요.</span>
          </p>
        </div>
      );
    }

    if (locationState === "error") {
      return (
        <p className="mt-2 text-xs text-amber-fg" aria-live="polite">
          <span className="lang-en">We couldn&apos;t get your location. Please try again.</span>
          <span className="lang-ko">현재 위치를 가져오지 못했습니다. 다시 시도해주세요.</span>
        </p>
      );
    }

    return (
      <p className="mt-2 text-xs text-muted" aria-live="polite">
        <span className="lang-en">Enable location to sort places by distance.</span>
        <span className="lang-ko">위치를 켜면 가까운 순으로 정렬됩니다.</span>
      </p>
    );
  }

  const isFiltered = active !== "All" || district !== "All" || q || (radiusKm && userLocation);

  useEffect(() => {
    if (!q) return undefined;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      trackEvent("search_places", {
        search_term: q,
        results_count: visiblePlaces.length,
      });
    }, 700);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [q, visiblePlaces.length]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [q, active, district, sortMode, radiusKm, userLocation, viewMode]);

  function clearAllFilters() {
    setActive("All");
    setDistrict("All");
    setQuery("");
    setRadiusKm(null);
    setSortMode("default");
    trackEvent("clear_filters", {
      had_search: Boolean(q),
      had_district: district !== "All",
      had_type: active !== "All",
      had_radius: Boolean(radiusKm && userLocation),
    });
  }

  function handleTypeChange(type) {
    setActive(type);
    trackEvent("filter_places", {
      filter_kind: "type",
      filter_value: type,
    });
  }

  function handleDistrictChange(value) {
    setDistrict(value);
    trackEvent("filter_places", {
      filter_kind: "district",
      filter_value: value,
    });
  }

  function handleRadiusChange(value) {
    setRadiusKm(value);
    trackEvent("filter_places", {
      filter_kind: "radius_km",
      filter_value: value ?? "all",
    });
  }

  function handleViewModeChange(nextMode) {
    setViewMode(nextMode);
    trackEvent("filter_places", {
      filter_kind: "view_mode",
      filter_value: nextMode,
    });
  }

  function handleLoadMore() {
    setVisibleCount((count) => count + LOAD_MORE_COUNT);
    trackEvent("view_more_places", {
      previous_count: displayedPlaces.length,
      total_results: visiblePlaces.length,
    });
  }

  return (
    <section>
      {/* Search */}
      <label className="relative mt-8 block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
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
          data-lang-placeholder-en="Search places…"
          data-lang-placeholder-ko="장소 검색…"
          placeholder="Search places…"
          className="lang-placeholder w-full rounded-lg border border-rim bg-surface py-3 pl-11 pr-4 text-sm text-fg placeholder-faint outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      {/* Filter toggle (mobile-friendly) */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
          aria-expanded={filtersOpen}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M3 5h14M5 10h10M7 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="lang-en">Filters</span>
          <span className="lang-ko">필터</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`}>
            <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isFiltered ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-accent transition-opacity hover:opacity-70"
          >
            <span className="lang-en">Clear all</span>
            <span className="lang-ko">초기화</span>
          </button>
        ) : null}
      </div>

      {/* Filter groups */}
      <div
        ref={filterRef}
        className={`mt-4 space-y-5 overflow-hidden transition-all duration-300 ${filtersOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        {/* Nearby */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            <span className="lang-en">Nearby</span>
            <span className="lang-ko">내 주변</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={resetNearby}
              className={sortMode === "default" ? chipActive : chipInactive}
            >
              <span className="lang-en">Recommended</span>
              <span className="lang-ko">추천순</span>
            </button>
            {hasLocation ? (
              <button
                type="button"
                onClick={() => {
                  setSortMode("nearest");
                  trackEvent("filter_places", {
                    filter_kind: "sort_mode",
                    filter_value: "nearest",
                  });
                }}
                className={sortMode === "nearest" ? chipActive : chipInactive}
              >
                <span className="lang-en">Nearest</span>
                <span className="lang-ko">가까운 순</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={requestLocation}
              className={chipInactive}
            >
              <span className="lang-en">
                {locationState === "loading"
                  ? "Checking…"
                  : canRetryLocation
                    ? "Try again"
                    : hasLocation
                      ? "Update location"
                      : "Use my location"}
              </span>
              <span className="lang-ko">
                {locationState === "loading"
                  ? "위치 확인 중…"
                  : canRetryLocation
                    ? "다시 시도"
                    : hasLocation
                      ? "내 위치 업데이트"
                      : "위치 켜기"}
              </span>
            </button>
          </div>

          {/* Radius filter */}
          {hasLocation && sortMode === "nearest" ? (
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                <span className="lang-en">Radius</span>
                <span className="lang-ko">거리 범위</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.labelEn}
                    type="button"
                    onClick={() => handleRadiusChange(opt.value)}
                    className={radiusKm === opt.value ? chipSmActive : chipSmInactive}
                  >
                    <span className="lang-en">{opt.labelEn}</span>
                    <span className="lang-ko">{opt.labelKo}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {renderLocationStatus()}
          {showSettingsHint ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={requestLocation}
                className={chipSmInactive}
              >
                <span className="lang-en">Try location again</span>
                <span className="lang-ko">위치 다시 시도</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* Area */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            <span className="lang-en">Area</span>
            <span className="lang-ko">지역</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...districts].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDistrictChange(d)}
                className={district === d ? chipActive : chipInactive}
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
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            <span className="lang-en">Type</span>
            <span className="lang-ko">유형</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...types].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={active === type ? chipActive : chipInactive}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results bar */}
      <div className="mt-8 flex items-center justify-between border-b border-rim pb-3">
        <p className="text-xs text-muted">
          <span className="lang-en">{visiblePlaces.length} places</span>
          <span className="lang-ko">{visiblePlaces.length}곳</span>
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            className={viewMode === "list" ? chipSmActive : chipSmInactive}
          >
            <span className="lang-en">List</span>
            <span className="lang-ko">목록</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("map")}
            className={viewMode === "map" ? chipSmActive : chipSmInactive}
          >
            <span className="lang-en">Map</span>
            <span className="lang-ko">지도</span>
          </button>
        </div>
      </div>

      {/* Place grid or map */}
      {viewMode === "map" ? (
        <MapView places={visiblePlaces} />
      ) : visiblePlaces.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">
            <span className="lang-en">No places match your filters.</span>
            <span className="lang-ko">조건에 맞는 장소가 없습니다.</span>
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-3 rounded-lg border border-rim px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            >
              <span className="lang-en">Clear all filters</span>
              <span className="lang-ko">필터 초기화</span>
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {displayedPlaces.map((place, index) => (
              <PlaceCard key={place.slug} place={place} priority={index < 2} />
            ))}
          </div>
          {hasMorePlaces ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="rounded-lg border border-rim px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
              >
                <span className="lang-en">Show 6 more</span>
                <span className="lang-ko">6개 더 보기</span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
