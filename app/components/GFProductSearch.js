"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

const CATEGORY_MAP = {
  "과자": "Snacks",
  "포장육": "Packaged Meat",
  "양념육": "Seasoned Meat",
  "조미김": "Seasoned Seaweed",
  "소시지": "Sausage",
  "즉석조리식품": "Ready Meals",
  "어묵": "Fish Cake",
  "김치류": "Kimchi",
  "묵류": "Muk (Jelly)",
  "음료베이스": "Beverage",
  "두부": "Tofu",
  "떡류": "Rice Cake",
  "빙과": "Ice Treats",
  "드레싱": "Dressing",
  "소스": "Sauce",
};

function getCategoryEn(ko) {
  return CATEGORY_MAP[ko] || ko;
}

export default function GFProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [showCount, setShowCount] = useState(12);

  const categories = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const cat = p.category || "기타";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCat !== "All") {
      result = result.filter(p => p.category === selectedCat);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, query, selectedCat]);

  const displayed = filtered.slice(0, showCount);

  return (
    <div className="mt-4">
      {/* Search */}
      <label className="relative block">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" fill="none" viewBox="0 0 20 20">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowCount(12); }}
          placeholder="Search products... / 제품 검색..."
          className="w-full rounded-lg border border-rim bg-surface py-2.5 pl-10 pr-4 text-sm text-fg placeholder-faint outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      {/* Category chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => { setSelectedCat("All"); setShowCount(12); }}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${selectedCat === "All" ? "bg-fg text-bg" : "text-muted border border-rim hover:text-fg hover:bg-surface-2"}`}
        >
          <span className="lang-en">All ({products.length})</span>
          <span className="lang-ko">전체 ({products.length})</span>
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setSelectedCat(cat); setShowCount(12); }}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${selectedCat === cat ? "bg-fg text-bg" : "text-muted border border-rim hover:text-fg hover:bg-surface-2"}`}
          >
            <span className="lang-en">{getCategoryEn(cat)} ({count})</span>
            <span className="lang-ko">{cat} ({count})</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mt-3 text-xs text-faint">
        <span className="lang-en">{filtered.length} gluten-free products found</span>
        <span className="lang-ko">{filtered.length}개 글루텐프리 제품</span>
      </p>

      {/* Product grid */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {displayed.map((p, i) => (
          <div key={p.reportNo || i} className="flex gap-3 rounded-lg border border-rim bg-surface p-3">
            {p.image && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                <Image
                  src={p.image}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg leading-tight truncate">{p.name}</p>
              <p className="mt-0.5 text-[11px] text-muted truncate">{p.manufacturer}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">GF</span>
                <span className="text-[10px] text-faint truncate">
                  <span className="lang-en">{getCategoryEn(p.category)}</span>
                  <span className="lang-ko">{p.category}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {filtered.length > showCount && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowCount(s => s + 12)}
            className="rounded-lg border border-rim px-5 py-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 min-h-[44px]"
          >
            <span className="lang-en">Show more ({filtered.length - showCount} remaining)</span>
            <span className="lang-ko">더 보기 ({filtered.length - showCount}개 남음)</span>
          </button>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-6 text-center text-sm text-muted">
          <span className="lang-en">No products found. Try a different search term.</span>
          <span className="lang-ko">제품을 찾을 수 없습니다. 다른 검색어를 시도해 보세요.</span>
        </div>
      )}
    </div>
  );
}
