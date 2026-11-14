import { useMemo } from "react";
import { usePublicContentList, usePublicTours } from "../../hooks/useCms";
import DestinationCard from "./DestinationCard";
import PageHero from "../common/PageHero";
import SectionHeading from "../common/SectionHeading";
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
          <SectionHeading title="Explore destinations">
            {!isLoading ? (
              <span className="brand-section-count">
                {destinations.length} {destinations.length === 1 ? "destination" : "destinations"}
              </span>
            ) : null}
          </SectionHeading>

        {isLoading ? (
          <div className="destination-tile-grid" aria-label="Loading destinations" aria-busy="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="destination-tile-skeleton animate-pulse" />
            ))}
          </div>
        ) : destinations.length ? (
          <div className="destination-tile-grid">
            {destinations.map((destination, index) => (
              <DestinationCard
                key={destination.id || destination.slug || `${destination.title}-${index}`}
                destination={destination}
                index={index}
                small
                showDescription={false}
                overlay
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
            <h3 className="text-base font-bold text-[var(--c-navy)]">No destinations available yet</h3>
            <p className="mt-1 text-xs text-slate-500">Published destinations will appear here automatically.</p>
          </div>
        )}
        </div>
      </section>
    </main>
  );
};

export default ViewAllDestinations;
