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

// Blog posts get a stronger footnote than /guide: a post titled "what to buy"
// implies the author vouches for these products, and we have not bought them.
export const COUPANG_FOOTNOTE_UNTESTED = {
  en: "I have not bought or eaten these specific products. They are shopping starting points for the categories described above, not recommendations I can vouch for. Read the 원재료명 and allergen line on the listing itself before buying, and treat any front-of-pack \"gluten-free\" claim as unverified.",
  ko: "이 제품들은 제가 직접 구매·취식한 것이 아닙니다. 위에서 설명한 카테고리의 구매 출발점일 뿐, 제가 보증할 수 있는 추천이 아닙니다. 구매 전 상품 페이지의 원재료명과 알레르기 표시를 직접 확인하시고, 포장 앞면의 \"글루텐프리\" 표기는 검증되지 않은 것으로 간주하세요.",
};

export const COUPANG_HEADING_UNTESTED = {
  en: "🛒 Where to buy (Ad — not personally tested)",
  ko: "🛒 구매처 (광고 — 직접 사용해보지 않은 제품)",
};

const COUPANG_BY_ID = Object.fromEntries(
  COUPANG_PRODUCTS.map((it) => [it.href.split("/a/")[1], it]),
);

// Friendly ids for frontmatter, so posts don't hardcode short-link codes.
const COUPANG_ALIASES = {
  gochujang: "eaen1b",
  tamari: "eaer76",
  ssamjang: "eaeybC",
  "gf-pasta": "eaes9G",
};

// Coupang short links carry the partner id inside the code, but they also
// forward a ?subId= through the 302 — which is how a click gets attributed to
// the post that produced it rather than being pooled with /guide.
function withSubId(href, subId) {
  if (!subId) return href;
  return `${href}${href.includes("?") ? "&" : "?"}subId=${encodeURIComponent(subId)}`;
}

// Resolves a post's `affiliate:` frontmatter into AffiliateBox props.
// Throws on anything unrecognized: a silent drop here means the box vanishes
// from a published page while the build stays green.
export function resolveAffiliate(spec, slug) {
  if (!spec || typeof spec !== "object") {
    throw new Error(`[affiliate] ${slug}: "affiliate" must be an object`);
  }
  if (spec.program !== "coupang") {
    throw new Error(`[affiliate] ${slug}: unknown program "${spec.program}"`);
  }
  if (!Array.isArray(spec.items) || spec.items.length === 0) {
    throw new Error(`[affiliate] ${slug}: "items" must be a non-empty array`);
  }

  // Default the sub-id to the slug so attribution follows the post even if the
  // slug changes during drafting.
  const subId = spec.subId || slug;

  const items = spec.items.map((id) => {
    const item = COUPANG_BY_ID[COUPANG_ALIASES[id] ?? id];
    if (!item) {
      const known = Object.keys(COUPANG_ALIASES).join(", ");
      throw new Error(`[affiliate] ${slug}: unknown item "${id}". Known: ${known}`);
    }
    return { ...item, href: withSubId(item.href, subId) };
  });

  return {
    items,
    heading: COUPANG_HEADING_UNTESTED,
    disclosure: COUPANG_DISCLOSURE,
    footnote: COUPANG_FOOTNOTE_UNTESTED,
  };
}
