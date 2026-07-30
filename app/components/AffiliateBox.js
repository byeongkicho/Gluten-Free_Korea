"use client";

import { trackEvent } from "@/app/lib/analytics";

// Reusable affiliate recommendation box. Client component so affiliate clicks
// are tracked (KPI: affiliate click volume) and links carry rel="sponsored".
// Drop into any server-rendered page/post; pass serializable bilingual items.
//
// items: [{ href, program, title: {en, ko}, note?: {en, ko} }]
export default function AffiliateBox({
  id,
  heading,
  disclosure,
  footnote,
  items,
  className,
}) {
  const list = Array.isArray(items) ? items.filter((it) => it?.href) : [];
  if (list.length === 0) return null;

  return (
    <section
      id={id}
      className={
        className ??
        "mt-5 scroll-mt-20 rounded-2xl border border-rim bg-surface p-5 sm:p-6"
      }
    >
      {heading ? (
        <h2 className="text-lg font-semibold text-fg">
          <span className="lang-en">{heading.en}</span>
          <span className="lang-ko">{heading.ko}</span>
        </h2>
      ) : null}

      {disclosure ? (
        <div className="mt-3 rounded-xl border border-amber-rim bg-amber-bg p-3">
          <p className="text-xs leading-relaxed text-amber-fg">
            <span className="lang-en">{disclosure.en}</span>
            <span className="lang-ko">{disclosure.ko}</span>
          </p>
        </div>
      ) : null}

      <ul className="mt-4 space-y-4 text-sm leading-relaxed">
        {list.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              onClick={() =>
                trackEvent("click_external_link", {
                  link_type: "affiliate",
                  affiliate_program: it.program,
                  affiliate_item: it.title?.en || it.href,
                })
              }
            >
              <span className="lang-en">{it.title?.en}</span>
              <span className="lang-ko">{it.title?.ko}</span>
            </a>
            {it.note ? (
              <p className="mt-0.5 text-xs text-muted">
                <span className="lang-en">{it.note.en}</span>
                <span className="lang-ko">{it.note.ko}</span>
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {footnote ? (
        <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
          <span className="lang-en">{footnote.en}</span>
          <span className="lang-ko">{footnote.ko}</span>
        </p>
      ) : null}
    </section>
  );
}
