import { Link } from "@/lib/router";
import { usePublicContentList } from "../../hooks/useCms";
import PageHero from "../common/PageHero";

const ContentListingPage = ({
  type,
  route,
  heroTag,
  heroTitle,
  heroAccent,
  heroText,
  eyebrow,
  heading,
  itemLabel,
  itemsLabel,
  emptyMessage,
}) => {
  const { data: items = [], isLoading } = usePublicContentList(type);

  return (
    <main className="bg-theme-bg text-theme">
      <PageHero
        page={route}
        label={`${itemLabel} hero`}
        tag={heroTag}
        title={heroTitle}
        accent={heroAccent}
        text={heroText}
      />

      <section className="pb-9 pt-5 sm:pb-10 sm:pt-6 lg:pb-12 lg:pt-7">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px w-6 bg-[var(--c-brand)]" />
                {eyebrow}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#061b3a] sm:text-2xl">
                {heading}
              </h2>
            </div>

            {!isLoading ? (
              <span className="text-[10px] font-semibold text-slate-500">
                {items.length} {items.length === 1 ? itemLabel : itemsLabel}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 xl:grid-cols-4" aria-label={`Loading ${itemsLabel}`} aria-busy="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="h-28 animate-pulse bg-slate-200 sm:h-40" />
                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-2 w-16 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="hidden h-3 w-full animate-pulse rounded bg-slate-100 sm:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length ? (
            <div className="grid grid-cols-2 items-stretch gap-2.5 sm:gap-3.5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const itemRoute = item.slug || item.id;
                const image = item.image || item.coverImage || "/gb.jpg";
                const category =
                  type === "activity"
                    ? item.location || "Guided activity"
                    : item.category || "Travel service";

                return (
                  <Link
                    key={item.id || item.slug}
                    to={`/${route}/${itemRoute}`}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_3px_12px_rgba(6,27,58,0.05)] transition-[border-color,box-shadow] duration-200 hover:border-[rgba(var(--c-brand-rgb),0.35)] hover:shadow-[0_8px_20px_rgba(6,27,58,0.09)]">
                    <div className="relative h-28 overflow-hidden bg-slate-100 sm:h-40 lg:h-44">
                      {/* CMS images can use dynamically configured external hosts. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={item.title || itemLabel}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallbackApplied) return;
                          event.currentTarget.dataset.fallbackApplied = "true";
                          event.currentTarget.src = "/gb.jpg";
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#061b3a]/45 to-transparent" />
                    </div>

                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <p className="truncate text-[8px] font-bold uppercase tracking-[0.13em] text-[var(--c-brand)] sm:text-[9px]">
                        {category}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#061b3a] sm:text-base">
                        {item.title}
                      </h3>
                      <p className="mt-2 hidden line-clamp-2 text-xs leading-5 text-slate-500 sm:block">
                        {item.shortDescription || item.description}
                      </p>
                      <span className="mt-auto hidden pt-3 text-[10px] font-semibold text-slate-500 transition-colors group-hover:text-[var(--c-brand)] sm:block">
                        View details
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
              <h3 className="text-base font-bold text-[#061b3a]">Nothing published yet</h3>
              <p className="mt-1 text-xs text-slate-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ContentListingPage;
