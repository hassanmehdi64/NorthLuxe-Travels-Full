"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import SafeImage from "../common/SafeImage";
import Lightbox from "./Lightbox";

/**
 * Shared detail-page photo layout (tours, destinations, activities, services):
 * one main photo plus a balanced grid (never a lone photo on a row), opening the shared
 * Lightbox. Photos that fail to load drop out; with none left it shows the name on the
 * brand gradient; with no photos at all it renders nothing.
 */
export default function PhotoGallery({ images = [], title }) {
  const [failed, setFailed] = useState(() => new Set());
  const [index, setIndex] = useState(null);
  const all = [...new Set(images.filter(Boolean))];
  const photos = all.filter((src) => !failed.has(src));
  const markFailed = (src) => setFailed((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  if (!all.length) return null;
  if (!photos.length) {
    return (
      <div className="media relative aspect-[16/7] overflow-hidden rounded-panel">
        <SafeImage src="" alt="" label={title} />
      </div>
    );
  }

  // 1 photo: full width. 2: halves. 3: big + 2 stacked. 4+: big + 2×2 (max 5 shown).
  const shown = photos.slice(0, photos.length >= 5 ? 5 : photos.length === 4 ? 3 : photos.length);
  const layout =
    shown.length === 1 ? "grid-cols-1"
      : shown.length === 2 ? "grid-cols-2"
        : shown.length === 3 ? "grid-cols-2 sm:grid-cols-3 sm:grid-rows-2"
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
            onClick={() => setIndex(photos.indexOf(src))}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className={`group media media-zoom relative min-h-0 ${tileClass(i)}`}
          >
            <SafeImage src={src} alt="" label={title} loading={i === 0 ? "eager" : "lazy"} decoding="async" onError={() => markFailed(src)} />
            <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/10" />
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <button type="button" onClick={() => setIndex(0)} className="btn btn-light btn-sm absolute bottom-3 right-3 shadow-raised">
          <Images size={15} aria-hidden="true" />
          {photos.length} photos
        </button>
      )}
      <Lightbox
        slides={photos.map((src, i) => ({ src, alt: `${title}, photo ${i + 1}` }))}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  );
}
