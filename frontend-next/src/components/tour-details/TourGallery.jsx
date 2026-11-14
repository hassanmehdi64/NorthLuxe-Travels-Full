"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import SafeImage from "../common/SafeImage";

/**
 * Photo mosaic (1 large + up to 4 small) with a full-screen lightbox.
 * Adapts to 1–5+ photos; renders nothing when there are none.
 */
export default function TourGallery({ images = [], title }) {
  const photos = [...new Set(images.filter(Boolean))];
  const [index, setIndex] = useState(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (!photos.length) return null;

  const shown = photos.slice(0, 5);
  const layout =
    shown.length === 1
      ? "grid-cols-1"
      : shown.length === 2
        ? "grid-cols-2"
        : shown.length <= 4
          ? "grid-cols-2 sm:grid-cols-3 sm:grid-rows-2"
          : "grid-cols-2 sm:grid-cols-4 sm:grid-rows-2";

  const tileClass = (i) => {
    if (shown.length >= 3 && i === 0) return "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto";
    if (shown.length >= 3) return "hidden aspect-[4/3] sm:block";
    return "aspect-[4/3]";
  };

  return (
    <section aria-label={`${title} photos`} className="relative">
      <div className={`grid gap-2 overflow-hidden rounded-panel sm:h-[clamp(280px,34vw,440px)] ${layout}`}>
        {shown.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className={`group media media-zoom relative min-h-0 ${tileClass(i)}`}
          >
            <SafeImage src={src} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            <span className="absolute inset-0 bg-navy-950/0 transition-colors group-hover:bg-navy-950/10" />
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <button type="button" onClick={() => setIndex(0)} className="btn btn-light btn-sm absolute bottom-3 right-3 shadow-raised">
          <Images size={15} aria-hidden="true" />
          {photos.length} photos
        </button>
      )}

      <Dialog.Root open={open} onOpenChange={(value) => { if (!value) setIndex(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy-950/95" />
          <Dialog.Content className="fixed inset-0 z-[91] flex flex-col items-center justify-center p-4 outline-none sm:p-10">
            <Dialog.Title className="sr-only">{title} photos</Dialog.Title>
            <Dialog.Description className="sr-only">Use the arrow keys to move between photos.</Dialog.Description>
            {open && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[index]} alt={`${title}, photo ${index + 1}`} className="max-h-[78dvh] max-w-full rounded-card object-contain" />
                <p className="mt-3 text-sm text-white/75" aria-live="polite">{index + 1} / {photos.length}</p>
              </>
            )}
            <Dialog.Close className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white hover:bg-white/10" aria-label="Close photos">
              <X size={18} />
            </Dialog.Close>
            {photos.length > 1 && (
              <>
                <button type="button" aria-label="Previous photo" onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronLeft size={20} />
                </button>
                <button type="button" aria-label="Next photo" onClick={() => setIndex((i) => (i + 1) % photos.length)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
