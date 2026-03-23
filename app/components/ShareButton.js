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
      className="rounded border border-rim px-3 py-2 text-center text-sm text-muted transition-colors hover:border-rim-strong hover:text-fg"
    >
      {copied ? (
        <>
          <span className="lang-en text-accent">Link copied!</span>
          <span className="lang-ko text-accent">링크 복사됨!</span>
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
