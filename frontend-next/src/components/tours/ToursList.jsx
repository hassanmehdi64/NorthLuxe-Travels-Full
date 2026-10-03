import TourCard from "./TourCard";
import { SearchX, ShieldCheck } from "lucide-react";

const ToursList = ({ tours = [], searchSummary = {}, isLoading = false }) => {
  const hasSearchSummary = Boolean(searchSummary?.query || searchSummary?.dateLabel || searchSummary?.guests);

  return (
    <section className="bg-theme-bg pb-14 pt-0 lg:pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-3 sm:mb-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1" role="status" aria-live="polite">
              <span className="text-xs font-medium text-slate-500">Results</span>
              <p className="text-[13px] font-medium leading-5 text-[var(--c-navy)]">
                {isLoading ? "Loading journeys..." : `${tours.length} curated ${tours.length === 1 ? "journey" : "journeys"} found`}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium leading-5 text-[var(--c-brand-dark)]">
              <ShieldCheck size={14} aria-hidden="true" />
              Verified listings
            </span>
          </div>

          {hasSearchSummary ? (
            <div className="flex flex-wrap gap-2">
              {searchSummary.guests ? <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">{searchSummary.guests} {searchSummary.guests === 1 ? "adult" : "adults"}</span> : null}
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
                className="luxe-tour-skeleton flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                <div className="h-[150px] shrink-0 animate-pulse bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-2 p-3.5">
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

