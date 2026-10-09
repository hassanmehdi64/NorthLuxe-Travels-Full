import { useState } from "react";
import { Link } from "@/lib/router";
import { ChevronLeft, MoveUpRight } from "lucide-react";

export const DetailState = ({ children }) => (
  <main className="grid min-h-[55vh] place-items-center bg-theme-bg px-4 py-16">
    <div className="w-full max-w-xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-muted">
      {children}
    </div>
  </main>
);

export const DetailBreadcrumb = ({ href, label }) => (
  <Link
    to={href}
    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:text-[var(--c-brand)]"
  >
    <ChevronLeft size={14} />
    {label}
  </Link>
);

export const DetailMediaGrid = ({ images = [], title }) => {
  const [failedImages, setFailedImages] = useState([]);
  const uniqueImages = [...new Set(images.filter(Boolean))]
    .filter((image) => !failedImages.includes(image))
    .slice(0, 5);
  if (!uniqueImages.length) return null;

  const hideFailedImage = (image) => {
    setFailedImages((current) =>
      current.includes(image) ? current : [...current, image],
    );
  };

  return (
    <section className="brand-gallery-grid tour-photo-grid" style={{ "--photo-columns": Math.min(uniqueImages.length, 3) }} aria-label={`${title} photos`}>
      {uniqueImages.map((image, index) => <div className="brand-gallery-tile" key={image}>
        <img src={image} alt={`${title}, photo ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} onError={() => hideFailedImage(image)} />
      </div>)}
    </section>
  );
};

export const DetailFacts = ({ items = [] }) => {
  const visible = items.filter((item) => item?.value);
  if (!visible.length) return null;
  const columns = visible.length === 1 ? "sm:grid-cols-1" : visible.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className={`grid w-full min-w-0 gap-2 ${columns}`}>
      {visible.map(({ icon: Icon, label, value }) => (
        <div key={`${label}-${value}`} className="flex min-w-0 items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-3">
          {Icon ? <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[rgba(var(--c-brand-rgb),0.08)] text-[var(--c-brand)]"><Icon size={13} /></span> : null}
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-0.5 break-words text-xs font-semibold leading-5 text-[var(--c-navy)]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailAside = ({ title, buttonLabel }) => (
  <aside className="brand-card overflow-hidden lg:sticky lg:top-24">
    <div className="h-0.5 bg-[var(--c-brand)]" />
    <div className="p-4">
    <h2 className="text-sm font-medium text-[var(--c-navy)]">{title}</h2>
    <Link to="/custom-plan-request" className="ql-btn-primary mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold">
      {buttonLabel}
      <MoveUpRight size={13} />
    </Link>
    </div>
  </aside>
);

export const RelatedContentGrid = ({ title, route, items = [] }) => {
  if (!items.length) return null;

  return (
    <section className="border-t border-slate-200 pt-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight text-[var(--c-navy)]">{title}</h2>
        <Link to={`/${route}`} className="text-xs font-semibold text-slate-500 transition-colors hover:text-[var(--c-brand)]">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id || item.slug} to={`/${route}/${item.slug || item.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--c-brand-rgb),0.35)] hover:shadow-[0_10px_24px_rgba(var(--c-brand-rgb),0.07)]">
            {item.image || item.coverImage ? <img src={item.image || item.coverImage} alt={item.title} onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] sm:h-36" /> : null}
            <div className="p-3.5">
              {item.category || item.location ? <p className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--c-brand)]">{item.category || item.location}</p> : null}
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[var(--c-navy)] group-hover:text-[var(--c-brand)]">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
