const guideTitle = "Gluten-Free Safety Guide for Korea | No Gluten Korea";
const guideDescription = "Learn essential gluten-free survival tips for Korea: hidden gluten in Korean food, key Korean phrases, and safer grocery product suggestions.";

export const metadata = {
  title: guideTitle,
  description: guideDescription,
  keywords: [
    "gluten free korea guide",
    "korea gluten free guide",
    "gluten free korean food",
    "korean gluten free phrases",
    "글루텐프리 한국 가이드",
    "한국 글루텐프리 가이드",
  ],
  alternates: { canonical: "/guide" },
  openGraph: {
    type: "article",
    url: "/guide",
    title: guideTitle,
    description: guideDescription,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Gluten-Free Korea Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: guideTitle,
    description: guideDescription,
    images: ["/og-default.png"],
  },
};

import CopyButton from "@/app/components/CopyButton";

export default function GuidePage() {
  const guideJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guideTitle,
    description: guideDescription,
    inLanguage: ["en", "ko"],
    url: "https://noglutenkorea.com/guide",
    author: {
      "@type": "Organization",
      name: "No Gluten Korea",
    },
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          <span className="lang-en">Safety Guide</span>
          <span className="lang-ko">안전 가이드</span>
        </h1>

        {/* Table of contents */}
        <nav className="mt-5 rounded-2xl border border-rim bg-surface p-4 sm:p-5" aria-label="Table of contents">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            <span className="lang-en">On this page</span>
            <span className="lang-ko">목차</span>
          </p>
          <ol className="mt-2.5 space-y-1.5 text-sm">
            <li><a href="#checklist" className="text-muted transition-colors hover:text-fg"><span className="lang-en">Safety Checklist</span><span className="lang-ko">안전 체크리스트</span></a></li>
            <li><a href="#hidden-gluten" className="text-muted transition-colors hover:text-fg"><span className="lang-en">Hidden Gluten</span><span className="lang-ko">숨겨진 글루텐</span></a></li>
            <li><a href="#rice-bread" className="text-muted transition-colors hover:text-fg"><span className="lang-en">Rice Bread Warning</span><span className="lang-ko">쌀빵 주의</span></a></li>
            <li><a href="#phrases" className="text-muted transition-colors hover:text-fg"><span className="lang-en">Korean Phrases</span><span className="lang-ko">한국어 표현</span></a></li>
            <li><a href="#products" className="text-muted transition-colors hover:text-fg"><span className="lang-en">Recommended Products</span><span className="lang-ko">추천 제품</span></a></li>
          </ol>
        </nav>

        <div id="checklist" className="mt-6 scroll-mt-20 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="lang-en">
                Clearly ask whether wheat, barley, or rye is included.
              </span>
              <span className="lang-ko">밀, 보리, 호밀 포함 여부를 직원에게 명확히 확인하세요.</span>
            </li>
            <li>
              <span className="lang-en">
                Ask if fryers, oil, or prep tools are shared.
              </span>
              <span className="lang-ko">튀김기/기름/조리도구를 함께 쓰는지 반드시 물어보세요.</span>
            </li>
            <li>
              <span className="lang-en">
                If uncertain, choose dishes with simple ingredients.
              </span>
              <span className="lang-ko">확신이 없으면 원재료가 단순한 메뉴를 선택하세요.</span>
            </li>
            <li>
              <span className="lang-en">Reconfirm every visit, even at the same place.</span>
              <span className="lang-ko">같은 매장이라도 방문할 때마다 다시 확인하세요.</span>
            </li>
          </ul>
        </div>
        <section id="hidden-gluten" className="mt-5 scroll-mt-20 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-fg">
            <span className="lang-en">Hidden Gluten in Korean Food</span>
            <span className="lang-ko">한국 음식 속 숨겨진 글루텐</span>
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="lang-en">Soy sauce, gochujang, doenjang — most contain wheat</span>
              <span className="lang-ko">간장, 고추장, 된장 — 대부분 밀 함유</span>
            </li>
            <li>
              <span className="lang-en">Fried foods — shared fryer oil is common</span>
              <span className="lang-ko">튀김류 — 같은 기름을 공유하는 경우가 많음</span>
            </li>
            <li>
              <span className="lang-en">Tteok (rice cakes) — usually safe, but confirm</span>
              <span className="lang-ko">떡 — 보통 안전하지만 반드시 확인</span>
            </li>
            <li>
              <span className="lang-en">Ramyeon broth — typically contains wheat</span>
              <span className="lang-ko">라면 육수 — 대부분 밀 함유</span>
            </li>
            <li>
              <span className="lang-en">Mandu — dumpling wrappers contain wheat flour</span>
              <span className="lang-ko">만두 — 만두피에 밀가루 함유</span>
            </li>
          </ul>
        </section>
        <section id="rice-bread" className="mt-5 scroll-mt-20 rounded-2xl border border-amber-rim bg-amber-bg p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-amber-fg">
            <span className="lang-en">⚠️ Rice Bread ≠ Gluten-Free</span>
            <span className="lang-ko">⚠️ 쌀빵 = 글루텐프리가 아닙니다</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-amber-fg">
            <span className="lang-en">
              In Korea, products sold as &apos;rice bread&apos; (쌀빵) are not always gluten-free.
              Some use a mix of rice flour and wheat flour (e.g. 90% rice, 10% wheat).
              Always check the label or ask staff directly before purchasing.
            </span>
            <span className="lang-ko">
              한국에서 &apos;쌀빵&apos;으로 판매되는 제품이 항상 글루텐프리인 것은 아닙니다.
              쌀가루와 밀가루를 혼합해 만드는 경우가 있습니다 (예: 쌀가루 90% + 밀가루 10%).
              구매 전 반드시 라벨을 확인하거나 직원에게 밀가루 포함 여부를 직접 물어보세요.
            </span>
          </p>
        </section>
        <section id="phrases" className="mt-5 scroll-mt-20 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-fg">
            <span className="lang-en">Useful Korean Phrases</span>
            <span className="lang-ko">유용한 한국어 표현</span>
          </h2>
          <ul className="mt-4 space-y-4">
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">밀가루 들어가나요?</p>
                <p className="text-xs text-muted">Does this contain wheat flour?</p>
              </div>
              <CopyButton text="밀가루 들어가나요?" ariaLabel="Copy phrase" className="mt-0.5" />
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">글루텐프리 메뉴 있나요?</p>
                <p className="text-xs text-muted">Do you have a gluten-free menu?</p>
              </div>
              <CopyButton text="글루텐프리 메뉴 있나요?" ariaLabel="Copy phrase" className="mt-0.5" />
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">밀, 보리, 호밀 없이 만들 수 있나요?</p>
                <p className="text-xs text-muted">Can you make it without wheat, barley, or rye?</p>
              </div>
              <CopyButton text="밀, 보리, 호밀 없이 만들 수 있나요?" ariaLabel="Copy phrase" className="mt-0.5" />
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">조리도구를 따로 써주실 수 있나요?</p>
                <p className="text-xs text-muted">Can you use separate utensils?</p>
              </div>
              <CopyButton text="조리도구를 따로 써주실 수 있나요?" ariaLabel="Copy phrase" className="mt-0.5" />
            </li>
          </ul>
        </section>
        <section id="products" className="mt-5 scroll-mt-20 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-fg">
            <span className="lang-en">🛒 Recommended Products (Ad)</span>
            <span className="lang-ko">🛒 추천 제품 (광고)</span>
          </h2>
          <div className="mt-3 rounded-xl border border-amber-rim bg-amber-bg p-3">
            <p className="text-xs leading-relaxed text-amber-fg">
              <span className="lang-en">
                Ad disclosure: This section includes affiliate links from Coupang Partners. We may receive a commission if you purchase through these links. Please re-check ingredients, allergy information, and labeling on the product page before buying.
              </span>
              <span className="lang-ko">
                광고 안내: 이 섹션에는 쿠팡 파트너스 제휴 링크가 포함되어 있으며, 구매가 발생할 경우 일정액의 수수료를 제공받을 수 있습니다. 구매 전 상품 페이지에서 원재료, 알레르기 정보, 표시사항을 다시 확인하세요.
              </span>
            </p>
          </div>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed">
            <li>
              <a
                href="https://link.coupang.com/a/eaen1b"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                <span className="lang-en">[Ad] Gluten-Free Gochujang (Red Pepper Paste)</span>
                <span className="lang-ko">[광고] 글루텐프리 고추장</span>
              </a>
              <p className="mt-0.5 text-xs text-muted">
                <span className="lang-en">Essential Korean condiment — look for wheat-free versions made with rice</span>
                <span className="lang-ko">쌀로 만든 밀가루 무첨가 고추장</span>
              </p>
            </li>
            <li>
              <a
                href="https://link.coupang.com/a/eaer76"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                <span className="lang-en">[Ad] Gluten-Free Soy Sauce / Tamari</span>
                <span className="lang-ko">[광고] 글루텐프리 간장 (타마리)</span>
              </a>
              <p className="mt-0.5 text-xs text-muted">
                <span className="lang-en">Tamari-style soy sauce brewed without wheat — safe for most GF diets</span>
                <span className="lang-ko">밀 없이 양조된 타마리 간장 — 대부분의 글루텐프리 식단에 적합</span>
              </p>
            </li>
            <li>
              <a
                href="https://link.coupang.com/a/eaeybC"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                <span className="lang-en">[Ad] Gluten-Free Ssamjang (BBQ Dipping Sauce)</span>
                <span className="lang-ko">[광고] 글루텐프리 쌈장</span>
              </a>
              <p className="mt-0.5 text-xs text-muted">
                <span className="lang-en">Dipping sauce for Korean BBQ wraps — check label for wheat-free certification</span>
                <span className="lang-ko">한국 바비큐 쌈용 소스 — 밀가루 무첨가 인증 확인</span>
              </p>
            </li>
            <li>
              <a
                href="https://link.coupang.com/a/eaes9G"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                <span className="lang-en">[Ad] Gluten-Free Penne Pasta (Rice/Corn)</span>
                <span className="lang-ko">[광고] 글루텐프리 펜네 파스타 (쌀/옥수수)</span>
              </a>
              <p className="mt-0.5 text-xs text-muted">
                <span className="lang-en">Rice or corn-based pasta — great for cooking GF Italian dishes at home</span>
                <span className="lang-ko">쌀 또는 옥수수 원료 파스타 — 집에서 글루텐프리 이탈리안 요리에 적합</span>
              </p>
            </li>
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
            <span className="lang-en">
              Product suitability may vary by ingredients and manufacturing process. Always verify the latest product details yourself.
            </span>
            <span className="lang-ko">
              제품 적합성은 원재료와 제조 공정에 따라 달라질 수 있으므로, 최신 상품 상세 정보를 직접 확인하세요.
            </span>
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-amber-rim bg-amber-bg p-5">
          <p className="text-sm text-amber-fg">
            <span className="lang-en">
              This guide is for general reference only. Menus and preparation methods
              change — always verify with restaurant staff on the day of your visit.
            </span>
            <span className="lang-ko">
              이 가이드는 일반적인 참고용입니다. 메뉴와 조리 방식은 달라질 수
              있으므로 방문 당일 반드시 직원에게 직접 확인하세요.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
