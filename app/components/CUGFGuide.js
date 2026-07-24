"use client";

import { useState } from "react";
import Image from "next/image";

const LEVEL_CONFIG = {
  possible: { labelEn: "Possibly GF", labelKo: "GF 가능", color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300", icon: "✅" },
  check: { labelEn: "Check Label", labelKo: "라벨 확인", color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300", icon: "❓" },
  risky: { labelEn: "Likely Gluten", labelKo: "글루텐 가능성", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300", icon: "⚠️" },
  gluten: { labelEn: "Contains Gluten", labelKo: "글루텐 포함", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300", icon: "❌" },
};

export default function CUGFGuide({ data }) {
  const [filter, setFilter] = useState("possible");

  const products = data.products || [];
  const filtered = products.filter(p => p.gfLevel === filter);

  return (
    <div className="mt-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => {
          const count = products.filter(p => p.gfLevel === level).length;
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === level ? cfg.color + " ring-1 ring-current" : "text-muted border border-rim hover:bg-surface-2"}`}
            >
              {cfg.icon}{" "}
              <span className="lang-en">{cfg.labelEn} ({count})</span>
              <span className="lang-ko">{cfg.labelKo} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-3 rounded-lg border border-amber-rim bg-amber-bg p-2.5">
        <p className="text-[11px] leading-relaxed text-amber-fg">
          <span className="lang-en">
            Classification is based on product names only — not verified ingredients. Always check the label on the actual product before purchasing.
          </span>
          <span className="lang-ko">
            제품명 기반 추정 분류입니다 — 성분 검증이 아닙니다. 구매 전 반드시 실제 제품의 성분표를 확인하세요.
          </span>
        </p>
      </div>

      {/* Products */}
      <div className="mt-3 space-y-2">
        {filtered.map((p, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-rim bg-surface p-2.5">
            {p.image && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-2">
                <Image src={p.image} alt={p.name} width={48} height={48} className="h-full w-full object-contain" unoptimized />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg truncate">{p.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${LEVEL_CONFIG[p.gfLevel].color}`}>
                  <span className="lang-en">{LEVEL_CONFIG[p.gfLevel].labelEn}</span>
                  <span className="lang-ko">{LEVEL_CONFIG[p.gfLevel].labelKo}</span>
                </span>
                <span className="text-xs text-muted">{p.price}
                  <span className="lang-en">won</span>
                  <span className="lang-ko">원</span>
                </span>
                <span className="text-[10px] text-faint">
                  <span className="lang-en">{p.catEn}</span>
                  <span className="lang-ko">{p.catKo}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted">
          <span className="lang-en">No products in this category</span>
          <span className="lang-ko">해당 분류에 제품이 없습니다</span>
        </p>
      )}
    </div>
  );
}
