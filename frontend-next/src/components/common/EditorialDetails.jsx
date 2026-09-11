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
  const uniqueImages = [...new Set(images.filter(Boolean))].slice(0, 5);
  if (!uniqueImages.length) return null;

  return (
    <section className={`grid overflow-hidden rounded-2xl bg-slate-100 ${uniqueImages.length > 1 ? "gap-1.5 md:grid-cols-[minmax(0,1.7fr)_minmax(220px,.7fr)]" : ""}`}>
      <div className="overflow-hidden">
        <img
          src={uniqueImages[0]}
          alt={title}
          className="h-[260px] w-full object-cover transition-transform duration-700 hover:scale-[1.02] sm:h-[360px] lg:h-[440px]"
        />
      </div>
      {uniqueImages.length > 1 ? (
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
          {uniqueImages.slice(1, 3).map((image, index) => (
            <div key={image} className="overflow-hidden">
              <img
                src={image}
                alt={`${title} ${index + 2}`}
                className="h-36 w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-44 md:h-[217px]"
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

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
      {visible.map(({ icon: Icon, label, value }) => (
        <div key={`${label}-${value}`} className="flex min-w-0 items-center gap-3 bg-white px-4 py-3.5">
          {Icon ? <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(var(--c-brand-rgb),0.08)] text-[var(--c-brand)]"><Icon size={15} /></span> : null}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-[#061b3a]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailAside = ({ eyebrow, title, text, buttonLabel }) => (
  <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(6,27,58,0.05)] lg:sticky lg:top-24">
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--c-brand)]">{eyebrow}</p>
    <h2 className="mt-2 text-lg font-bold tracking-tight text-[#061b3a]">{title}</h2>
    {text ? <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p> : null}
    <Link to="/custom-plan-request" className="ql-btn-primary mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold">
      {buttonLabel}
      <MoveUpRight size={13} />
    </Link>
  </aside>
);

export const RelatedContentGrid = ({ title, route, items = [] }) => {
  if (!items.length) return null;

  return (
    <section className="border-t border-slate-200 pt-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[#061b3a]">{title}</h2>
        <Link to={`/${route}`} className="text-xs font-semibold text-slate-500 transition-colors hover:text-[var(--c-brand)]">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id || item.slug} to={`/${route}/${item.slug || item.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--c-brand-rgb),0.35)] hover:shadow-[0_10px_24px_rgba(6,27,58,0.07)]">
            {item.image || item.coverImage ? <img src={item.image || item.coverImage} alt={item.title} className="h-28 w-full object-cover sm:h-36" /> : null}
            <div className="p-3.5">
              {item.category || item.location ? <p className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--c-brand)]">{item.category || item.location}</p> : null}
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#061b3a] group-hover:text-[var(--c-brand)]">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
