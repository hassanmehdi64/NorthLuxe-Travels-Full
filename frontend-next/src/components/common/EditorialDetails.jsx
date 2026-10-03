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
  const secondaryImages = uniqueImages.slice(1, 3);
  if (!uniqueImages.length) return null;

  const hideFailedImage = (image) => {
    setFailedImages((current) =>
      current.includes(image) ? current : [...current, image],
    );
  };

  return (
    <section className={`grid overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${uniqueImages.length > 1 ? "gap-1 md:grid-cols-[minmax(0,2fr)_minmax(210px,1fr)]" : ""}`}>
      <div className="overflow-hidden">
        <img
          src={uniqueImages[0]}
          alt={title}
          onError={() => hideFailedImage(uniqueImages[0])}
          className="h-[180px] w-full object-cover transition-transform duration-700 hover:scale-[1.02] sm:h-[230px] md:h-[300px]"
        />
      </div>
      {secondaryImages.length ? (
        <div className={`grid gap-1 ${secondaryImages.length > 1 ? "grid-cols-2 md:grid-cols-1" : "grid-cols-1"}`}>
          {secondaryImages.map((image, index) => (
            <div key={image} className="overflow-hidden">
              <img
                src={image}
                alt={`${title} ${index + 2}`}
                onError={() => hideFailedImage(image)}
                className={`w-full object-cover transition-transform duration-700 hover:scale-[1.03] ${secondaryImages.length === 1 ? "h-28 sm:h-36 md:h-[300px]" : "h-24 sm:h-28 md:h-[148px]"}`}
              />
            </div>
          ))}
        </div>
      ) : null}
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

export const DetailAside = ({ eyebrow, title, text, buttonLabel }) => (
  <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_18px_rgba(var(--c-brand-rgb),0.045)] lg:sticky lg:top-24">
    <div className="h-0.5 bg-[var(--c-brand)]" />
    <div className="p-4">
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--c-brand)]">{eyebrow}</p>
    <h2 className="mt-1.5 text-base font-bold tracking-tight text-[var(--c-navy)]">{title}</h2>
    {text ? <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p> : null}
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
