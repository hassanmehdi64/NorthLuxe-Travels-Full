import { useMemo, useState } from "react";
import { useGallery, usePublicTours } from "../../hooks/useCms";
import { buildGalleryItems } from "../../utils/gallery";
import SectionHeading from "../common/SectionHeading";
import SafeImage from "../common/SafeImage";
import Lightbox from "../media/Lightbox";
import Reveal from "../motion/Reveal";

const GallerySection = () => {
  const { data: items = [] } = useGallery(true);
  const { data: tours = [] } = usePublicTours();
  const [openIndex, setOpenIndex] = useState(null);

  const galleryItems = useMemo(() => buildGalleryItems(items, tours), [items, tours]);
  // Always fill whole rows of four (desktop) so the grid never ends with a gap.
  const visibleCount = galleryItems.length >= 8 ? 8 : galleryItems.length >= 4 ? 4 : galleryItems.length;
  const homeGalleryItems = galleryItems.slice(0, visibleCount);

  return (
    <section className="section section-white" aria-labelledby="home-gallery-title">
      <div className="container-site">
        <SectionHeading id="home-gallery-title" eyebrow="From our trips" title="Gallery" link="View gallery" to="/gallery" />

        {galleryItems.length ? (
          <Reveal className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {homeGalleryItems.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setOpenIndex(idx)}
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
              </button>
            ))}
          </Reveal>
        ) : (
          <p className="empty-state">Gallery photos will appear here.</p>
        )}
      </div>
      
      <Lightbox
        slides={galleryItems.map((img) => ({ src: img.src, alt: img.alt || img.title || "Gallery photo", title: img.title || undefined }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </section>
  );
};

export default GallerySection;
