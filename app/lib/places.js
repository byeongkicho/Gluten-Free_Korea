export const TYPE_MAP = {
  "음식점": "Restaurant",
  "카페": "Cafe",
  "베이커리": "Bakery",
  "제과,베이커리": "Bakery",
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
