import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { useGallery, usePublicTours } from "../../hooks/useCms";
import { X, Maximize2 } from "lucide-react";
import { buildGalleryItems } from "../../utils/gallery";

const GallerySection = () => {
  const { data: items = [] } = useGallery(true);
  const { data: tours = [] } = usePublicTours();
  const [selectedImg, setSelectedImg] = useState(null);

  const galleryItems = useMemo(() => buildGalleryItems(items, tours), [items, tours]);
  const homeGalleryItems = galleryItems.slice(0, 8);

  return (
    <section className="py-8 lg:py-10 bg-theme-bg overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-theme tracking-tight">Gallery</h2>
            </div>

            <Link
              to="/gallery"
              className="ql-btn-secondary ql-btn-compact self-center active:scale-[0.98] md:self-auto"
            >
              View All Gallery
            </Link>

          </div>
        </div>

        {galleryItems.length ? (
          <div className="mx-auto grid max-w-[1280px] auto-rows-[100px] grid-cols-2 gap-2 sm:auto-rows-[115px] sm:gap-2.5 lg:auto-rows-[135px] lg:grid-cols-[repeat(16,minmax(0,1fr))] xl:auto-rows-[140px]">
            {homeGalleryItems.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setSelectedImg(img)}
                className={`group relative overflow-hidden rounded-[10px] border border-slate-200/70 bg-[var(--c-navy)] text-left shadow-[0_2px_8px_rgba(var(--c-brand-rgb),0.05)] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(var(--c-brand-rgb),0.4)] hover:shadow-[0_6px_16px_rgba(var(--c-brand-rgb),0.09)] ${
                  idx === 0
                    ? "col-span-1 row-span-2 lg:col-span-4"
                    : idx <= 3
                      ? "col-span-1 lg:col-span-4"
                      : "col-span-1 lg:col-span-3"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt || img.title}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackApplied) return;
                    event.currentTarget.dataset.fallbackApplied = "true";
                    event.currentTarget.src = "/gb.jpg";
                  }}
                  className="h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055]"
                />

                <div className="absolute inset-0 bg-[var(--c-navy)]/0 transition-colors duration-400 group-hover:bg-[var(--c-navy)]/25" />
                <span className="absolute inset-0 m-auto grid h-8 w-8 scale-90 place-items-center rounded-full border border-white/35 bg-[var(--c-navy)]/35 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <Maximize2 size={12} />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[var(--c-brand)] transition-transform duration-400 group-hover:scale-x-100" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-theme bg-theme-surface py-16 text-center text-muted">
            <p className="text-xs font-medium tracking-widest uppercase">Curating Gallery...</p>
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-theme-text/96 backdrop-blur-lg p-6"
          onClick={() => setSelectedImg(null)}
        >
          <button
            className="ql-btn-icon absolute top-8 right-8 [--btn-icon-bg:rgba(255,255,255,0.06)] [--btn-icon-border:rgba(255,255,255,0.2)] [--btn-icon-text:rgba(255,255,255,0.82)] [--btn-icon-hover-bg:rgba(32,183,122,0.2)] [--btn-icon-hover-border:rgba(32,183,122,0.45)] [--btn-icon-hover-text:#ffffff]"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImg.src}
              alt={selectedImg.alt || selectedImg.title}
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied) return;
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = "/gb.jpg";
              }}
              className="max-h-[80vh] w-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
