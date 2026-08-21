export const TYPE_MAP = {
  Restaurant: "음식점",
  Cafe: "카페",
  Bakery: "베이커리",
};

export const TAG_PRIORITY = [
  "Dedicated GF",
  "Restaurant",
  "Cafe",
  "Bakery",
  "Pizza",
  "Bread",
  "Dessert",
];

export const TAG_MAP = {
  "Dedicated GF": "전문점",
  Restaurant: "음식점",
  Cafe: "카페",
  Bakery: "베이커리",
  Pizza: "피자",
  Bread: "빵",
  Dessert: "디저트",
  Italian: "이탈리안",
  Korean: "한식",
  "Fried Chicken": "치킨",
};

export function sortTags(tags) {
  if (!Array.isArray(tags)) return [];
  const priority = new Map(TAG_PRIORITY.map((tag, index) => [tag, index]));
  return [...tags].sort((a, b) => {
    const ai = priority.has(a) ? priority.get(a) : Number.MAX_SAFE_INTEGER;
    const bi = priority.has(b) ? priority.get(b) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return String(a).localeCompare(String(b));
  });
}

// 매장 운영 상태. 상세 페이지는 항상 남기되(외부 링크·기존 유입이 깨지지 않게)
// 목록·추천·지역 페이지에서는 빼서 방문을 유도하지 않는다.
//   closed     — 영업 종료가 확인된 곳
//   unverified — 위치·상호·글루텐프리 취급 여부 중 하나 이상이 미확인인 곳
// 판단 근거는 overrides.json 의 statusNote 에 기록한다.
export function isClosed(place) {
  return place?.status === "closed";
}

export function isUnverified(place) {
  return place?.status === "unverified";
}

export function listablePlaces(list) {
  return Array.isArray(list)
    ? list.filter((place) => !isClosed(place) && !isUnverified(place))
    : [];
}
