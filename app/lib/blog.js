import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

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
      return {
        ...data,
        content,
        slug: data.slug || f.replace(/\.md$/, ""),
      };
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
