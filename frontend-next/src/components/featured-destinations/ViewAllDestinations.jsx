import { useMemo } from "react";
import { usePublicContentList, usePublicTours } from "../../hooks/useCms";
import DestinationCard from "./DestinationCard";
import PageHero from "../common/PageHero";
import { buildTourDestinationFallback, mapContentDestination } from "../../utils/destinations";

const ViewAllDestinations = () => {
  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
  const { data: backendDestinations = [], isLoading: destinationsLoading } =
    usePublicContentList("destination");

  const destinations = useMemo(() => {
    if (backendDestinations.length) {
      return backendDestinations.map(mapContentDestination);
    }

    return buildTourDestinationFallback(tours);
  }, [backendDestinations, tours]);

  const isLoading = toursLoading || destinationsLoading;

  return (
    <main className="bg-theme-bg text-theme">
      <PageHero
        page="destinations"
        label="Destinations hero"
        tag="Explore the North"
        title="Remarkable places"
        accent="Beautifully connected"
        text="Discover handpicked valleys, mountain towns, lakes, and cultural regions across Northern Pakistan."
      />

      <section className="pb-8 pt-5 sm:pb-9 sm:pt-6 lg:pb-10 lg:pt-7">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px w-6 bg-[var(--c-brand)]" />
                Destination collection
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#061b3a] sm:text-2xl">
                Choose where your journey begins
              </h2>
            </div>

            {!isLoading ? (
              <span className="text-[10px] font-semibold text-slate-500">
                {destinations.length} {destinations.length === 1 ? "destination" : "destinations"}
              </span>
            ) : null}
          </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading destinations" aria-busy="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-[155px] animate-pulse rounded-[1rem] bg-slate-200 min-[420px]:h-[175px] sm:h-[200px] sm:rounded-[1.15rem] lg:h-[220px]" />
            ))}
          </div>
        ) : destinations.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((destination, index) => (
              <DestinationCard
                key={destination.id || destination.slug || `${destination.title}-${index}`}
                destination={destination}
                index={index}
                small
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
            <h3 className="text-base font-bold text-[#061b3a]">No destinations available yet</h3>
            <p className="mt-1 text-xs text-slate-500">Published destinations will appear here automatically.</p>
          </div>
        )}
        </div>
      </section>
    </main>
  );
};

export default ViewAllDestinations;
