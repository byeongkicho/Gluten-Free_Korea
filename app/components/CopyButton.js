"use client";

import { useRef, useState } from "react";

export default function CopyButton({
  text,
  ariaLabel = "Copy text",
  labelEn = "Copy",
  labelKo = "복사",
  copiedEn = "Copied",
  copiedKo = "복사됨",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  async function handleCopy(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (!text || !navigator?.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
      >
        <path
          d="M7.5 5.833h6.667A1.667 1.667 0 0 1 15.833 7.5v7.5a1.667 1.667 0 0 1-1.666 1.667H7.5A1.667 1.667 0 0 1 5.833 15V8.333A2.5 2.5 0 0 1 8.333 5.833Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 5.833V5A1.667 1.667 0 0 0 10.833 3.333H5A1.667 1.667 0 0 0 3.333 5v5.833A1.667 1.667 0 0 0 5 12.5h.833"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {copied ? (
        <>
          <span className="lang-en text-emerald-700 dark:text-emerald-300">{copiedEn}</span>
          <span className="lang-ko text-emerald-700 dark:text-emerald-300">{copiedKo}</span>
        </>
      ) : (
        <>
          <span className="lang-en">{labelEn}</span>
          <span className="lang-ko">{labelKo}</span>
        </>
      )}
    </button>
  );
}
