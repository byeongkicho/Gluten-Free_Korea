import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllPosts, getPostBySlug } from "@/app/lib/blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Not Found | Gluten-Free Korea" };
  }

  const ogImage = post.ogImage || "/og-default.png";
  const isPublished = post.status === "published";
  return {
    title: `${post.title} | Gluten-Free Korea`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    // Keep unfinished "Coming soon" stubs out of the index — thin content
    // hurts a young domain's quality signals until the posts are written.
    robots: isPublished ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const isPublished = post.status === "published";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author || "Ki" },
    publisher: {
      "@type": "Organization",
      name: "No Gluten Korea",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-default.png`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const faqSchema =
    Array.isArray(post.faq) && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <p className="text-xs text-faint">
        <Link
          href="/blog"
          className="underline-offset-2 hover:text-fg hover:underline"
        >
          ← Blog
        </Link>
      </p>

      <h1 className="mt-3 font-fraunces text-3xl font-bold text-fg leading-tight sm:text-4xl">
        {post.title}
      </h1>

      <p className="mt-3 text-xs text-faint">
        {fmtDate(post.date)}
        {post.author ? <> · by {post.author}</> : null}
        {!isPublished && (
          <span className="ml-3 rounded-full border border-amber-rim bg-amber-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-fg">
            Coming Soon
          </span>
        )}
      </p>

      <article className="blog-prose mt-8 text-fg/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
