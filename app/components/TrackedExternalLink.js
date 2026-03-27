"use client";

import { trackEvent } from "@/app/lib/analytics";

export default function TrackedExternalLink({
  href,
  children,
  className,
  place,
  linkType,
  title,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      title={title}
      onClick={() =>
        trackEvent("click_external_link", {
          link_type: linkType,
          place_slug: place?.slug,
          place_name: place?.nameEn || place?.name || place?.slug,
        })
      }
    >
      {children}
    </a>
  );
}
