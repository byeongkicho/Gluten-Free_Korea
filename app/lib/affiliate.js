// Coupang Partners affiliate catalog and required disclosures.
//
// Single source of truth: the disclosure text is a compliance requirement, so
// duplicating it across pages risks one copy drifting out of date. Pages import
// from here and pass the result to AffiliateBox.
//
// items: [{ href, program, title: {en, ko}, note?: {en, ko} }]

// Coupang Partners affiliate items (Korea-domestic shipping). Rendered via
// AffiliateBox so clicks are tracked and links carry rel="sponsored".
export const COUPANG_PRODUCTS = [
  {
    href: "https://link.coupang.com/a/eaen1b",
    program: "coupang",
    title: { en: "[Ad] Gluten-Free Gochujang (Red Pepper Paste)", ko: "[광고] 글루텐프리 고추장" },
    note: {
      en: "Essential Korean condiment — look for wheat-free versions made with rice",
      ko: "쌀로 만든 밀가루 무첨가 고추장",
    },
  },
  {
    href: "https://link.coupang.com/a/eaer76",
    program: "coupang",
    title: { en: "[Ad] Gluten-Free Soy Sauce / Tamari", ko: "[광고] 글루텐프리 간장 (타마리)" },
    note: {
      en: "Tamari-style soy sauce brewed without wheat — safe for most GF diets",
      ko: "밀 없이 양조된 타마리 간장 — 대부분의 글루텐프리 식단에 적합",
    },
  },
  {
    href: "https://link.coupang.com/a/eaeybC",
    program: "coupang",
    title: { en: "[Ad] Gluten-Free Ssamjang (BBQ Dipping Sauce)", ko: "[광고] 글루텐프리 쌈장" },
    note: {
      en: "Dipping sauce for Korean BBQ wraps — check label for wheat-free certification",
      ko: "한국 바비큐 쌈용 소스 — 밀가루 무첨가 인증 확인",
    },
  },
  {
    href: "https://link.coupang.com/a/eaes9G",
    program: "coupang",
    title: { en: "[Ad] Gluten-Free Penne Pasta (Rice/Corn)", ko: "[광고] 글루텐프리 펜네 파스타 (쌀/옥수수)" },
    note: {
      en: "Rice or corn-based pasta — great for cooking GF Italian dishes at home",
      ko: "쌀 또는 옥수수 원료 파스타 — 집에서 글루텐프리 이탈리안 요리에 적합",
    },
  },
];

export const COUPANG_DISCLOSURE = {
  en: "Ad disclosure: This section includes affiliate links from Coupang Partners. We may receive a commission if you purchase through these links. Please re-check ingredients, allergy information, and labeling on the product page before buying.",
  ko: "광고 안내: 이 섹션에는 쿠팡 파트너스 제휴 링크가 포함되어 있으며, 구매가 발생할 경우 일정액의 수수료를 제공받을 수 있습니다. 구매 전 상품 페이지에서 원재료, 알레르기 정보, 표시사항을 다시 확인하세요.",
};

export const COUPANG_FOOTNOTE = {
  en: "Product suitability may vary by ingredients and manufacturing process. Always verify the latest product details yourself.",
  ko: "제품 적합성은 원재료와 제조 공정에 따라 달라질 수 있으므로, 최신 상품 상세 정보를 직접 확인하세요.",
};
