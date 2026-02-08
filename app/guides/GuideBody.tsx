"use client";

import { useEffect, useMemo, useState } from "react";

import type { Guide } from "@/lib/guides";

export default function GuideBody({ guide }: { guide: Guide }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  const loader = useMemo(() => guide.load, [guide]);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((mod) => {
        if (!cancelled) setComponent(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setComponent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loader]);

  if (!Component) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Loading guide
      </div>
    );
  }

  return <Component />;
}
