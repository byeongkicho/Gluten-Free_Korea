"use client";

import Link from "next/link";
import PlaceCard from "@/app/components/PlaceCard";

export default function AreaContent({ area, areaPlaces }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          ← <span className="lang-en">All places</span>
          <span className="lang-ko">전체 목록</span>
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          <span className="lang-en">Gluten-Free {area.nameEn}</span>
          <span className="lang-ko">{area.nameKo} 글루텐프리</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          <span className="lang-en">{area.descEn}</span>
          <span className="lang-ko">{area.descKo}</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          <span className="lang-en">{areaPlaces.length} places found</span>
          <span className="lang-ko">{areaPlaces.length}곳</span>
        </p>

        {areaPlaces.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areaPlaces.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-muted">
            <span className="lang-en">No places found in this area yet.</span>
            <span className="lang-ko">아직 이 지역에 등록된 장소가 없습니다.</span>
          </p>
        )}
      </div>
    </main>
  );
}
