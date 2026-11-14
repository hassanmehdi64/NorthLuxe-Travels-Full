"use client";

import { useMemo, useState } from "react";
import { useGallery, usePublicTours } from "../hooks/useCms";
import { buildGalleryItems } from "../utils/gallery";
import SafeImage from "../components/common/SafeImage";
import Lightbox from "../components/media/Lightbox";
import Reveal from "../components/motion/Reveal";

const GalleryPage = () => {
  const { data: items = [], isLoading } = useGallery(true);
  const { data: tours = [] } = usePublicTours();
  const [openIndex, setOpenIndex] = useState(null);
  const galleryItems = useMemo(() => buildGalleryItems(items, tours), [items, tours]);

  return (
    <main className="section">
      <div className="container-site">
        <Reveal as="header" className="mb-8 max-w-2xl">
          <p className="eyebrow mb-2">From our trips</p>
          <h1 className="heading-1">Gallery</h1>
          <p className="lead mt-2 text-subtle">Moments from our routes across Gilgit-Baltistan.</p>
        </Reveal>

        {galleryItems.length ? (
          <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {galleryItems.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setOpenIndex(idx)}
                aria-label={`Open ${img.alt || img.title || `photo ${idx + 1}`}`}
                className="group media media-zoom relative block aspect-[4/3] w-full rounded-card"
              >
                <SafeImage src={img.src} alt={img.alt || img.title || ""} label={img.title} loading="lazy" decoding="async" />
                <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
              </button>
            ))}
          </Reveal>
        ) : (
          <p className="empty-state">{isLoading ? "Loading photos…" : "Gallery photos will appear here."}</p>
        )}
      </div>

      <Lightbox
        slides={galleryItems.map((img) => ({ src: img.src, alt: img.alt || img.title || "Gallery photo", title: img.title || undefined }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </main>
  );
};

export default GalleryPage;
