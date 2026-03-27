"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

function getDisplaySrc(src) {
  if (!src) return src;
  const parts = src.split("/");
  const fileName = parts.pop();
  if (!fileName || fileName.startsWith("thumb_")) return src;
  return [...parts, `thumb_${fileName}`].join("/");
}

export default function ImageLightbox({ images, alt }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [heroSrc, setHeroSrc] = useState(() => getDisplaySrc(images?.[0]));

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  const openAt = (i) => {
    setIdx(i);
    setOpen(true);
  };

  return (
    <>
      {/* Clickable thumbnails — render as children replacement */}
      <div className="mt-4 space-y-2">
        {/* Hero */}
        <div className="relative aspect-[16/10] min-h-[220px] overflow-hidden rounded-2xl bg-surface-2 sm:min-h-[320px]">
          <Image
            src={heroSrc || images[0]}
            alt={`${alt} — main photo`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="cursor-zoom-in rounded-2xl object-cover transition-transform hover:scale-[1.01]"
            priority
            fetchPriority="high"
            onClick={() => openAt(0)}
            onError={() => {
              if (heroSrc !== images[0]) setHeroSrc(images[0]);
            }}
          />
        </div>
        {/* Gallery grid */}
        {images.length > 1 && (
          <div className="min-h-[88px] grid grid-cols-3 gap-2 sm:min-h-[140px]">
            {images.slice(1).map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`${alt} photo ${i + 2}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="cursor-zoom-in object-cover transition-all hover:opacity-90 hover:scale-[1.02]"
                  loading={i < 2 ? "eager" : "lazy"}
                  onClick={() => openAt(i + 1)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              {idx + 1} / {images.length}
            </div>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[idx]}
              alt={`${alt} photo ${idx + 1}`}
              fill
              sizes="90vw"
              className="rounded-lg object-contain"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
