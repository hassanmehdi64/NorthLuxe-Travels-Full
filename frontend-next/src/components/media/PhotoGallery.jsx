"use client";

import { useState } from "react";
import SafeImage from "../common/SafeImage";
import Lightbox from "./Lightbox";
import Carousel from "./Carousel";

/**
 * Shared detail-page photo row (tours, destinations, activities, services):
 * equal 4:3 tiles in a single row — 3 in view on desktop, 2 on tablets, ~1 on phones —
 * extra photos scroll sideways (Carousel), each opens the shared Lightbox. Photos that fail to load drop out; with none left it shows the name on the
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

  // One row of equal 4:3 tiles, at most 3 in view; extra photos scroll sideways in the same row.
  return (
    <div className="relative">
      <Carousel label={`${title} photos`} slideClassName={photos.length === 1 ? "basis-full sm:basis-1/2 lg:basis-1/3" : "basis-[82%] sm:basis-1/2 lg:basis-1/3"}>
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group media media-zoom relative block aspect-[4/3] w-full overflow-hidden rounded-card"
          >
            <SafeImage src={src} alt="" label={title} loading={i < 3 ? "eager" : "lazy"} decoding="async" onError={() => markFailed(src)} />
            <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/10" />
          </button>
        ))}
      </Carousel>
      <Lightbox
        slides={photos.map((src, i) => ({ src, alt: `${title}, photo ${i + 1}` }))}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </div>
  );
}
