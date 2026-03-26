import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/app/components/CopyButton";
import ShareButton from "@/app/components/ShareButton";
import ImageLightbox from "@/app/components/ImageLightbox";
import places from "@/data/places.json";
import { TYPE_MAP, sortTags } from "@/app/lib/places";

function getValidatedPlaces() {
  const rows = Array.isArray(places) ? places : [];
  const seen = new Set();

  for (const place of rows) {
    const slug = place?.slug;
    if (!slug || typeof slug !== "string") continue;
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug found in data/places.json: ${slug}`);
    }
    seen.add(slug);
  }

  return rows;
}

const validatedPlaces = getValidatedPlaces();

function getPlaceBySlug(slug) {
  return validatedPlaces.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return validatedPlaces
    .filter((p) => typeof p.slug === "string" && p.slug.trim().length > 0)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  const title = place
    ? `${place.name} – Gluten-Free Options in Korea | Gluten-Free Korea`
    : "Place Not Found";
  const fallbackParts = [
    place?.type,
    place?.location || place?.address,
    "Verify ingredients and cross-contamination on visit.",
  ].filter(Boolean);
  const description = place?.note || fallbackParts.join(" · ") || "Gluten-free place detail";
  const path = `/place/${slug}`;
  const image = "/og-default.png";

  return {
    title,
    description,
    keywords: [
      `${place?.name || slug}`,
      `${place?.name || slug} gluten free`,
      `${place?.location || "Korea"} gluten free`,
      "gluten free korea",
      "글루텐프리 코리아",
    ],
    alternates: { canonical: place ? `/place/${place.slug}` : `/place/${slug}` },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: place?.name || "GF Korea place detail",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PlaceDetailPage({ params }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const displayTypeEn = place.type || "Place";
  const displayType = TYPE_MAP[place.type] || place.type || "장소";
  const noteEn = place.note || place.note_ko;
  const noteKo = place.note_ko || place.note;
  const normalizedWebsite = place.website?.trim() || "";
  const normalizedInstagram = place.instagram?.trim() || "";
  const normalizedNaverBlog = place.naverBlog?.trim() || "";
  const websiteLabel = normalizedWebsite.includes("catchtable")
    ? "Reservation"
    : normalizedWebsite.includes("smartstore.naver.com")
      ? "Store"
      : normalizedWebsite.includes("pf.kakao.com")
        ? "Kakao Channel"
        : normalizedWebsite.includes("link.inpock.co.kr")
          ? "Link Hub"
          : "Website";
  const schemaType = place.type === "Cafe" ? "CafeOrCoffeeShop" : place.type === "Bakery" ? "Bakery" : "Restaurant";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: place.name,
    description: place.note || undefined,
    address: place.address
      ? { "@type": "PostalAddress", streetAddress: place.address }
      : undefined,
    url: place.website || `${siteUrl}/place/${slug}`,
    servesCuisine: "Gluten-Free",
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <span className="lang-en">← Back to list</span>
          <span className="lang-ko">← 목록으로 돌아가기</span>
        </Link>

        {place.images?.length > 0 && (() => {
          return (
            <ImageLightbox
              images={place.images}
              alt={place.nameEn || place.name || "Place"}
            />
          );
        })()}

        <section className="mt-4 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <span className="lang-en">{displayTypeEn}</span>
            <span className="lang-ko">{displayType}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold leading-tight text-fg sm:text-3xl">
              <span className="lang-en">{place.nameEn || place.name}</span>
              <span className="lang-ko">{place.name}</span>
            </h1>
            {place.name ? (
              <CopyButton
                text={place.name}
                ariaLabel="Copy place name"
                labelEn="Copy name"
                labelKo="이름 복사"
              />
            ) : null}
          </div>
          <p className="mt-3 text-sm text-muted">
            {place.location || (
              <>
                <span className="lang-en">Location coming soon</span>
                <span className="lang-ko">위치 정보 준비중</span>
              </>
            )}
          </p>
          {place.address || place.addressEn ? (
            <div className="mt-3 rounded-lg border border-rim bg-surface-2 p-3">
              <p className="text-xs font-medium text-muted">
                <span className="lang-en">Address (show to taxi driver)</span>
                <span className="lang-ko">주소 (택시 기사님께 보여주세요)</span>
              </p>
              {place.address ? (
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-medium text-fg">
                    {place.address}
                  </p>
                  <CopyButton
                    text={place.address}
                    ariaLabel="Copy Korean address"
                    className="mt-0.5"
                  />
                </div>
              ) : null}
              {place.addressEn ? (
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm text-muted">
                    {place.addressEn}
                  </p>
                  <CopyButton
                    text={place.addressEn}
                    ariaLabel="Copy English address"
                    className="mt-0.5"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {place.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {sortTags(place.tags).map((tag) => (
                <span
                  key={tag}
                  className={
                    tag === "Dedicated GF"
                      ? "rounded px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-300/50 dark:ring-emerald-600/40"
                      : "rounded border border-rim px-2.5 py-1 text-xs text-muted"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {noteEn || noteKo ? (
          <section className="mt-5 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg">
              <span className="lang-en">Notes</span>
              <span className="lang-ko">메모</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <span className="lang-en">{noteEn}</span>
              <span className="lang-ko">{noteKo}</span>
            </p>
          </section>
        ) : null}

        {(normalizedWebsite || normalizedInstagram || normalizedNaverBlog || place.naverMapUrl || (place.lat && place.lng)) ? (
        <section className="mt-5 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg">
              <span className="lang-en">Links</span>
              <span className="lang-ko">링크</span>
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {normalizedWebsite ? (
                <a
                  href={normalizedWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rim px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0"><path d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" stroke="currentColor" strokeWidth="1.3" /><path d="M2.5 10h15M10 2.5a11.5 11.5 0 0 1 3 7.5 11.5 11.5 0 0 1-3 7.5A11.5 11.5 0 0 1 7 10a11.5 11.5 0 0 1 3-7.5Z" stroke="currentColor" strokeWidth="1.3" /></svg>
                  {websiteLabel}
                </a>
              ) : null}
              {normalizedInstagram && normalizedInstagram !== normalizedWebsite ? (
                <a
                  href={normalizedInstagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rim px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0"><rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.3" /><circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.3" /><circle cx="14.5" cy="5.5" r="1" fill="currentColor" /></svg>
                  Instagram
                </a>
              ) : null}
              {normalizedNaverBlog ? (
                <a
                  href={normalizedNaverBlog}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rim px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0"><path d="M4 3h12v14H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  Naver Blog
                </a>
              ) : null}
              {place.naverMapUrl ? (
                <a
                  href={place.naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rim px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0"><path d="M10 17.5S3.5 12 3.5 8a6.5 6.5 0 0 1 13 0c0 4-6.5 9.5-6.5 9.5Z" stroke="currentColor" strokeWidth="1.3" /><circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>
                  Naver Map
                </a>
              ) : null}
              {place.lat && place.lng ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rim px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0"><path d="M10 17.5S3.5 12 3.5 8a6.5 6.5 0 0 1 13 0c0 4-6.5 9.5-6.5 9.5Z" stroke="currentColor" strokeWidth="1.3" /><circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>
                  Google Maps
                </a>
              ) : null}
              <ShareButton
                url={`${siteUrl}/place/${slug}`}
                title={place.nameEn || place.name}
              />
            </div>
          </section>
        ) : null}

        {/* Tips section based on tags */}
        {place.tags?.length > 0 && (
          <section className="mt-5 rounded-2xl border border-rim bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg">
              <span className="lang-en">💡 Tips</span>
              <span className="lang-ko">💡 방문 팁</span>
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {place.tags.includes("Dedicated GF") && (
                <li>
                  <span className="lang-en">✨ This is a dedicated gluten-free establishment — safer for celiac visitors.</span>
                  <span className="lang-ko">✨ 글루텐프리 전문점으로, 셀리악병 환자에게 더 안전합니다.</span>
                </li>
              )}
              {place.tags.includes("Pizza") && (
                <li>
                  <span className="lang-en">🍕 Ask about gluten-free crust options and whether a separate oven is used.</span>
                  <span className="lang-ko">🍕 글루텐프리 크러스트 옵션과 별도 오븐 사용 여부를 확인하세요.</span>
                </li>
              )}
              {place.tags.includes("Italian") && (
                <li>
                  <span className="lang-en">🍝 Italian restaurants may offer GF pasta — ask if they have rice or corn-based noodles.</span>
                  <span className="lang-ko">🍝 글루텐프리 파스타(쌀면/옥수수면)가 있는지 문의해보세요.</span>
                </li>
              )}
              {place.tags.includes("Bakery") && (
                <li>
                  <span className="lang-en">🍞 Check if products are baked in a shared oven with wheat items.</span>
                  <span className="lang-ko">🍞 밀가루 제품과 같은 오븐을 사용하는지 확인하세요.</span>
                </li>
              )}
              {place.tags.includes("Restaurant") && !place.tags.includes("Dedicated GF") && (
                <li>
                  <span className="lang-en">🍽️ Ask staff about shared fryers, oils, and cooking utensils.</span>
                  <span className="lang-ko">🍽️ 튀김기/기름/조리도구 공유 여부를 직원에게 확인하세요.</span>
                </li>
              )}
              <li>
                <span className="lang-en">📱 Show this phrase to staff: &ldquo;밀가루, 보리, 호밀이 들어가나요?&rdquo; (Does this contain wheat, barley, or rye?)</span>
                <span className="lang-ko">📱 직원에게 &ldquo;밀가루, 보리, 호밀이 들어가나요?&rdquo;라고 물어보세요.</span>
              </li>
            </ul>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-amber-rim bg-amber-bg p-5">
          <p className="text-sm text-amber-fg">
            <span className="lang-en">
              Safety note: always reconfirm ingredients and cross-contamination
              with staff.
            </span>
            <span className="lang-ko">
              안전 안내: 재료와 조리도구 교차오염 여부를 방문 시점에 꼭 다시 확인하세요.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
