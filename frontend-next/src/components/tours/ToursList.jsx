import TourCard from "./TourCard";
import { SearchX, ShieldCheck } from "lucide-react";

const ToursList = ({ tours = [], searchSummary = {}, isLoading = false }) => {
  const hasSearchSummary = Boolean(searchSummary?.query || searchSummary?.dateLabel);

  return (
    <section className="bg-theme-bg pb-14 pt-0 lg:pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_5px_16px_rgba(6,27,58,0.04)] sm:mb-5 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Results</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-brand)]" />
              <h2 className="text-sm font-semibold tracking-tight text-[#061b3a] sm:text-base">
                {tours.length} curated journeys found
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(var(--c-brand-rgb),0.1)] text-[var(--c-brand)]">
                <ShieldCheck size={14} />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[var(--c-brand-dark)]">
                Verified listings
              </span>
            </div>
          </div>

          {hasSearchSummary ? (
            <div className="flex flex-wrap gap-2">
              {searchSummary?.query ? (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  Place: {searchSummary.query}
                </span>
              ) : null}
              {searchSummary?.dateLabel ? (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  Date: {searchSummary.dateLabel}
                </span>
              ) : null}
              {searchSummary?.seasonLabel ? (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  Season match: {searchSummary.seasonLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div
            className="grid items-stretch gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Loading tours"
            aria-busy="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white">
                <div className="h-44 animate-pulse bg-slate-200 sm:h-48" />
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tours.length ? (
          <div className="grid items-stretch gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <SearchX size={19} className="text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-theme tracking-tight mb-1">
              No matching tours found
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              Try changing your place, date, or filter options to view more matching tours.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToursList;

