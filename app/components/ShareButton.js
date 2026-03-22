"use client";

import { useRef, useState } from "react";

export default function ShareButton({ url, title }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or error — do nothing
      }
      return;
    }

    // Fallback: clipboard copy
    if (!navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {copied ? (
        <>
          <span className="lang-en text-emerald-700 dark:text-emerald-300">Link copied!</span>
          <span className="lang-ko text-emerald-700 dark:text-emerald-300">링크 복사됨!</span>
        </>
      ) : (
        <>
          <span className="lang-en">Share</span>
          <span className="lang-ko">공유</span>
        </>
      )}
    </button>
  );
}
