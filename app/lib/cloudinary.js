const CLOUD_NAME = "dbbreghct";

const PRESETS = {
  webThumb: "w_640,h_480,c_fill,g_auto,f_webp,q_80",
  webFull: "w_1200,q_85,f_webp",
  instaFeed: "w_1080,h_1080,c_fill,g_auto,f_jpg,q_90",
  instaStory: "w_1080,h_1920,c_fill,g_auto,f_jpg,q_90",
  ogImage: "w_1200,h_630,c_fill,g_auto,f_jpg,q_85",
};

/**
 * Build a Cloudinary delivery URL for the given public ID and preset.
 * @param {string} publicId - e.g. "places/my-place/01"
 * @param {keyof PRESETS} preset - e.g. "webThumb"
 * @returns {string} Full Cloudinary URL
 */
export function cloudinaryUrl(publicId, preset) {
  const transformation = PRESETS[preset];
  if (!transformation) {
    throw new Error(`Unknown Cloudinary preset: "${preset}". Available: ${Object.keys(PRESETS).join(", ")}`);
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}
