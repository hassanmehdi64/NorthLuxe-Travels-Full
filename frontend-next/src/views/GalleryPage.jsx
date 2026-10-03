import { useMemo, useState } from "react";
import { useGallery, usePublicTours } from "../hooks/useCms";
import { X, Maximize2 } from "lucide-react";
import { buildGalleryItems } from "../utils/gallery";

const GalleryPage = () => {
  const { data: items = [] } = useGallery(true);
  const { data: tours = [] } = usePublicTours();
  const [selectedImg, setSelectedImg] = useState(null);

  const galleryItems = useMemo(() => buildGalleryItems(items, tours), [items, tours]);

  return (
    <section className="py-6 sm:py-8 bg-theme-bg min-h-[60vh]">
      <div className="max-w-[1600px] mx-auto px-8 sm:px-10 lg:px-14 xl:px-16">
        <div className="mb-10 lg:mb-12">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--c-brand)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--c-brand)]">
                Visual Journal
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-theme tracking-tight">
              Gallery <span className="text-[var(--c-brand)]">Collection</span>
            </h1>
            <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed">
              Explore all journey highlights and guest moments from our routes.
            </p>
          </div>
        </div>

        {galleryItems.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {galleryItems.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setSelectedImg(img)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200/70 bg-[var(--c-navy)] text-left shadow-[0_3px_12px_rgba(var(--c-brand-rgb),0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(var(--c-brand-rgb),0.45)] hover:shadow-[0_8px_20px_rgba(var(--c-brand-rgb),0.11)]"
              >
                <img
                  src={img.src}
                  alt={img.alt || img.title}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackApplied) return;
                    event.currentTarget.dataset.fallbackApplied = "true";
                    event.currentTarget.src = "/gb.jpg";
                  }}
                  className="h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055]"
                />

                <div className="absolute inset-0 bg-[var(--c-navy)]/0 transition-colors duration-400 group-hover:bg-[var(--c-navy)]/25" />
                <span className="absolute inset-0 m-auto grid h-10 w-10 scale-90 place-items-center rounded-full border border-white/40 bg-[var(--c-navy)]/35 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <Maximize2 size={15} />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[var(--c-brand)] transition-transform duration-400 group-hover:scale-x-100" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-theme bg-theme-surface py-16 text-center text-muted">
            <p className="text-xs font-medium tracking-widest uppercase">Curating Gallery...</p>
          </div>
        )}
      </div>

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

export default GalleryPage;
