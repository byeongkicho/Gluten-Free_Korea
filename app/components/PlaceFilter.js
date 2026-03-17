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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleCopy();
      }}
      className="relative z-10 inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
      aria-label="Copy name and address"
    >
      {copied ? (
        <span className="text-emerald-600 dark:text-emerald-400">복사됨 ✓</span>
      ) : (
        <>
          <span className="lang-en">Copy</span>
          <span className="lang-ko">복사</span>
        </>
      )}
    </button>
  );
}

export default function PlaceFilter({ places }) {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const types = [...new Set((Array.isArray(places) ? places : []).map((place) => place?.type).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)));

  function extractDistrict(location) {
    if (!location) return null;
    const after = location.indexOf(",");
    if (after === -1) return null;
    const part = location.slice(after + 1).trim();
    const paren = part.indexOf("(");
    return paren === -1 ? part.trim() : part.slice(0, paren).trim();
  }

  const districts = [...new Set((Array.isArray(places) ? places : []).map((p) => extractDistrict(p.location)).filter(Boolean))].sort();

  const q = query.trim().toLowerCase();
  const afterSearch = q
    ? places.filter((p) =>
      [p.name, p.nameEn, p.address, p.addressEn, p.location]
        .some((f) => f && f.toLowerCase().includes(q))
    )
    : places;
  const afterDistrict =
    district === "All"
      ? afterSearch
      : afterSearch.filter((p) => extractDistrict(p.location) === district);
  const visiblePlaces =
    active === "All"
      ? afterDistrict
      : afterDistrict.filter((place) => place?.type === active);

  return (
    <section className="mt-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places…"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
      />

      <div className="flex flex-wrap gap-2 mb-3 mt-4">
        {["All", ...districts].map((d) => {
          const isActive = district === d;

          return (
            <button
              key={d}
              type="button"
              onClick={() => setDistrict(d)}
              className={
                isActive
                  ? "rounded-full px-3 py-1 text-sm font-medium transition bg-emerald-600 text-white dark:bg-emerald-500"
                  : "rounded-full px-3 py-1 text-sm font-medium transition border border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
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

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...types].map((type) => {
          const isActive = active === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setActive(type)}
              className={
                isActive
                  ? "rounded-full px-3 py-1 text-sm font-medium transition bg-emerald-600 text-white dark:bg-emerald-500"
                  : "rounded-full px-3 py-1 text-sm font-medium transition border border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
              }
            >
              {getTypeLabel(type)}
            </button>
          );
        })}
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

            return (
              <div
                key={slug}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:p-5"
              >
                <Link
                  href={`/place/${slug}`}
                  className="absolute inset-0 z-0 rounded-2xl"
                  aria-label={`View details for ${place.nameEn || place.name || slug}`}
                />
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <span className="lang-en">{displayTypeEn}</span>
                  <span className="lang-ko">{displayType}</span>
                </p>
                <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg">
                  <span className="lang-en">{place.nameEn || place.name || "Untitled"}</span>
                  <span className="lang-ko">{place.name || "이름 미정"}</span>
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="lang-en">
                    {place.location || place.address || "Location coming soon"}
                  </span>
                  <span className="lang-ko">
                    {place.address || place.location || "위치 정보 준비중"}
                  </span>
                </p>
                {noteEn || noteKo ? (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    <span className="lang-en">{noteEn}</span>
                    <span className="lang-ko">{noteKo}</span>
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sortTags(place.tags).slice(0, 3).map((tag) => (
                    <span key={tag} className={getTagClass(tag)}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="relative z-10 mt-auto pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {place.naverMapUrl ? (
                      <a
                        href={place.naverMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Naver Map
                      </a>
                    ) : null}
                    <CopyButton text={`${place.name}  ${place.address}`} />
                  </div>
                  <p className="pt-3 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="lang-en">View details</span>
                    <span className="lang-ko">상세 보기</span>{" "}
                    <span className="inline-block transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
