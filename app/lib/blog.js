import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// There is no markdown lint in this project, so a frontmatter typo is a silent
// failure: `affiliates:` drops the shop box, and `status: Published` drops the
// post from the sitemap, /blog and the homepage while the build stays green.
// Failing the build is the loud version — it blocks the deploy step in CI and
// leaves the previous deploy serving.
//
// Absence is not checked: the four upcoming stubs have no ogImage/pillar/faq.
// Keys we expect to add later are pre-registered so a future session isn't
// blocked by this guard.
const ALLOWED_KEYS = new Set([
  "slug", "title", "description", "date", "author", "keyword",
  "ogImage", "pillar", "status", "affiliate", "faq", "content",
  // pre-registered, not in use yet
  "updated", "coverImage", "image", "tags", "canonical", "noindex",
]);

const VALID_STATUS = new Set(["published", "upcoming"]);

function assertPostSchema(post, filename) {
  for (const key of Object.keys(post)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new Error(
        `[blog] ${filename}: unknown frontmatter key "${key}". ` +
          `If intentional, add it to ALLOWED_KEYS in app/lib/blog.js and record it in docs/DECISIONS.md.`,
      );
    }
  }
  if (!VALID_STATUS.has(post.status)) {
    throw new Error(
      `[blog] ${filename}: status is ${JSON.stringify(post.status)}, must be "published" or "upcoming".`,
    );
  }
}

let _cache = null;

export function getAllPosts() {
  if (_cache) return _cache;

  const filenames = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts = filenames
    .map((f) => {
      const filePath = path.join(BLOG_DIR, f);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const post = {
        ...data,
        content,
        slug: data.slug || f.replace(/\.md$/, ""),
      };
      assertPostSchema(post, f);
      return post;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  _cache = posts;
  return posts;
}

export function getPostBySlug(slug) {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPublishedPosts() {
  return getAllPosts().filter((p) => p.status === "published");
}

export function getUpcomingPosts() {
  return getAllPosts().filter((p) => p.status === "upcoming");
}
