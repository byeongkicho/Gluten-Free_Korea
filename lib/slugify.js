export default function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
<<<<<<< HEAD
    // Handle Korean characters and special characters
    .replace(/[^a-z0-9가-힣\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/[가-힣]/g, (match) => {
      // Simple Korean to English mapping for common words
      const koreanMap = {
        '카페': 'cafe',
        '레스토랑': 'restaurant',
        '베이커리': 'bakery',
        '디저트': 'dessert',
        '피자': 'pizza',
        '커피': 'coffee',
        '차': 'tea',
        '음식': 'food',
        '식당': 'restaurant',
        '호프': 'pub',
        '바': 'bar'
      };
      return koreanMap[match] || match;
    })
    .replace(/^-+|-+$/g, "");
}

// Alternative function for creating display-friendly slugs
export function createDisplaySlug(name, type) {
  const baseSlug = slugify(name);
  const typeSlug = slugify(type);
  
  // Create a more readable slug
  return `${baseSlug}-${typeSlug}`;
}

// Function to generate a clean URL-friendly slug
export function generateCleanSlug(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]+/g, "")
    .replace(/\s+/g, "-")
=======
    .replace(/[^a-z0-9]+/g, "-")
>>>>>>> 678372c912866381be375b08499fe3105d52ba9d
    .replace(/^-+|-+$/g, "");
}
