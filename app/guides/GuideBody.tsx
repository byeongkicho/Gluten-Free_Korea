"use client";

import { useEffect, useState } from "react";

async function loadGuideComponent(slug: string) {
  // Keep this explicit (no filesystem scanning) to match repo guardrails.
  switch (slug) {
    case "getting-started":
      return (await import("@/content/guides/getting-started.mdx")).default;
    case "dining-card-korean":
      return (await import("@/content/guides/dining-card-korean.mdx")).default;
    default:
      return null;
  }
}

export default function GuideBody({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGuideComponent(slug)
      .then((C) => {
        if (!cancelled) setComponent(() => C);
      })
      .catch(() => {
        if (!cancelled) setComponent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!Component) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Loading guide...
      </div>
    );
  }

  return <Component />;
}
