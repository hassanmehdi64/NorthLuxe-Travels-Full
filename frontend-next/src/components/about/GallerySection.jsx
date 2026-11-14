import { useEffect, useMemo, useRef, useState } from "react";
import { useGallery, usePublicTours } from "../../hooks/useCms";
import { X, Maximize2 } from "lucide-react";
import { buildGalleryItems } from "../../utils/gallery";
import SectionHeading from "../common/SectionHeading";
import SafeImage from "../common/SafeImage";

const GallerySection = () => {
  const { data: items = [] } = useGallery(true);
  const { data: tours = [] } = usePublicTours();
  const [selectedImg, setSelectedImg] = useState(null);
  const lightboxRef = useRef(null);
  useEffect(() => {
    if (selectedImg && lightboxRef.current && !lightboxRef.current.open) lightboxRef.current.showModal();
  }, [selectedImg]);

  const galleryItems = useMemo(() => buildGalleryItems(items, tours), [items, tours]);
  // Always fill whole rows of four (desktop) so the grid never ends with a gap.
  const visibleCount = galleryItems.length >= 8 ? 8 : galleryItems.length >= 4 ? 4 : galleryItems.length;
  const homeGalleryItems = galleryItems.slice(0, visibleCount);

  return (
    <section className="section section-white" aria-labelledby="home-gallery-title">
      <div className="container-site">
        <SectionHeading id="home-gallery-title" eyebrow="From our trips" title="Gallery" link="View gallery" to="/gallery" />

        {galleryItems.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {homeGalleryItems.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setSelectedImg(img)}
                aria-label={`Open ${img.alt || img.title || `gallery photo ${idx + 1}`}`}
                className="group media relative block aspect-[4/3] w-full rounded-card"
              >
                <SafeImage
                  src={img.src}
                  alt={img.alt || img.title}
                  loading="lazy"
                  decoding="async"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/20" />
                <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-navy-900 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 size={13} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-state">Gallery photos will appear here.</p>
        )}
      </div>
      
      {/* Lightbox */}
      {selectedImg && (
        <dialog
          ref={lightboxRef}
          className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-navy-950/95 p-4 pt-16 text-white backdrop:bg-navy-950/80 open:flex open:items-center open:justify-center sm:p-10 sm:pt-16"
          aria-label={selectedImg.alt || selectedImg.title || "Gallery photo"}
          onClose={() => setSelectedImg(null)}
          onCancel={() => setSelectedImg(null)}
          onClick={() => setSelectedImg(null)}
        >
          <button
            type="button"
            aria-label="Close photo"
            onClick={() => setSelectedImg(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/85 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={selectedImg.src}
              alt={selectedImg.alt || selectedImg.title}
              className="max-h-[80vh] w-auto rounded-card"
            />
          </div>
        </dialog>
      )}
    </section>
  );
};

export default GallerySection;
