import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import AffiliateBox from "@/app/components/AffiliateBox";
import CopyButton from "@/app/components/CopyButton";
import { resolveAffiliate } from "@/app/lib/affiliate";
import { getAllPosts, getPostBySlug } from "@/app/lib/blog";

// Korean phrases in these posts are meant to be *shown* to staff, not read
// aloud: romanisation is hard to pronounce and, per the operator (2026-08-25),
// staff often don't recognise it when a traveller tries. So any table cell or
// blockquote carrying Korean gets a copy button.
//
// The copy text is assembled fragment by fragment and keeps only the pieces
// containing Hangul. Blockquotes here put the English gloss in a sibling node,
// and copying that too would hand a kitchen a sentence with English mixed in.
const HANGUL = /[가-힣]/;
// A sentence ending, so single Korean words in glossary tables ("밀 — wheat")
// don't sprout a button that copies a word nobody needs to show anyone.
const KOREAN_SENTENCE_END = /[가-힣][다요죠][.?!]$/;

function textFragments(node, out = []) {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) textFragments(child, out);
    return out;
  }
  if (node.props?.children != null) textFragments(node.props.children, out);
  return out;
}

function koreanToCopy(children) {
  return textFragments(children)
    .filter((fragment) => HANGUL.test(fragment))
    .map((fragment) => fragment.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

const markdownComponents = {
  td({ node, children, ...props }) {
    const korean = koreanToCopy(children);
    if (!KOREAN_SENTENCE_END.test(korean)) return <td {...props}>{children}</td>;
    return (
      <td {...props}>
        <span className="flex items-start justify-between gap-2">
          <span>{children}</span>
          <CopyButton
            text={korean}
            ariaLabel={`Copy the Korean phrase: ${korean}`}
          />
        </span>
      </td>
    );
  },
  blockquote({ node, children, ...props }) {
    // Same sentence test as the table cells, and for the same reason: some
    // blockquotes carry Korean the reader is meant to *find* (the printed
    // shared-facility caution on a package), not to show anyone. Those end in
    // a noun with no terminator and correctly get no button.
    const korean = koreanToCopy(children);
    if (!KOREAN_SENTENCE_END.test(korean))
      return <blockquote {...props}>{children}</blockquote>;
    return (
      <blockquote {...props}>
        {children}
        <span className="mt-3 flex justify-end not-italic">
          <CopyButton
            text={korean}
            ariaLabel={`Copy the Korean text: ${korean}`}
          />
        </span>
      </blockquote>
    );
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://noglutenkorea.com";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Not Found" };
  }

  const ogImage = post.ogImage || "/og-default.png";
  const isPublished = post.status === "published";
  return {
    title: post.title,
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
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Outside .blog-prose on purpose: its descendant rules (a, ul, h2) beat
          the card's utility classes, which would render affiliate links in body
          text color — invisible as links, and this box exists to be clicked. */}
      {post.affiliate && (
        <AffiliateBox
          id="shop"
          placement={`blog:${post.slug}`}
          {...resolveAffiliate(post.affiliate, post.slug)}
        />
      )}

      {/* FAQPage markup requires the same content to be visible on the page.
          Skip posts that already write their FAQ into the body. */}
      {faqSchema && !/^##\s+FAQ/m.test(post.content) && (
        <section id="faq" className="blog-prose mt-8 text-fg/90">
          <h2>FAQ</h2>
          {post.faq.map((item) => (
            <div key={item.q}>
              <p>
                <strong>{item.q}</strong>
              </p>
              <p>{item.a}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
