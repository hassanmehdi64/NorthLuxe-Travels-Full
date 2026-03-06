import { Link, useParams } from "react-router-dom";
import { usePublicTours } from "../hooks/useCms";
import { getSeasonDetails } from "../components/seasonal-journeys/seasonalJourneysData";

const SeasonDetails = () => {
  const { slug } = useParams();
  const { data: tours = [] } = usePublicTours();
  const season = getSeasonDetails((slug || "").toLowerCase(), tours);

  return (
    <section className="bg-theme-bg py-10 md:py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 space-y-6">
        <div className="overflow-hidden rounded-2xl border border-theme bg-theme-surface">
          <div className="relative h-[240px] sm:h-[300px] lg:h-[340px]">
            <img src={season.image} alt={season.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 lg:p-9">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--c-brand)]">
                Seasonal Journey
              </p>
              <h1 className="mt-2 max-w-3xl text-[2.15rem] font-semibold tracking-[-0.03em] text-white md:text-[3.4rem]">
                {season.title}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/85 md:text-[17px]">
                {season.overview}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section className="rounded-2xl border border-theme bg-theme-surface p-5 md:p-6">
            <p className="max-w-3xl text-[15px] leading-7 text-muted md:text-[17px]">
              {season.description}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-theme-bg px-4 py-4">
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
                  Activities
                </p>
                <p className="mt-2 text-[15px] leading-6 text-muted">
                  Seasonal experiences planned around the strongest sightseeing window.
                </p>
                <ul className="mt-3 space-y-2.5">
                  {season.activities.map((item) => (
                    <li key={item} className="text-[15px] leading-6 text-muted">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-theme-bg px-4 py-4">
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
                  Services
                </p>
                <p className="mt-2 text-[15px] leading-6 text-muted">
                  Core support arranged to keep the route smooth and practical.
                </p>
                <ul className="mt-3 space-y-2.5">
                  {season.services.map((item) => (
                    <li key={item} className="text-[15px] leading-6 text-muted">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-theme-bg px-4 py-4">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
                Season Experience
              </p>
              <p className="mt-2 text-[15px] leading-7 text-muted md:text-[17px]">
                {season.seasonExperience}
              </p>
            </div>
          </section>

          <aside className="rounded-2xl border border-theme bg-theme-surface p-5 md:p-6">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
              Quick Info
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-theme-bg px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Best Time</p>
                <p className="mt-1 text-[15px] font-semibold text-theme">{season.bestTime}</p>
              </div>
              <div className="rounded-xl bg-theme-bg px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Top Regions</p>
                <p className="mt-1 text-[15px] font-semibold text-theme">{season.destinations.join(", ")}</p>
              </div>
              {season.packages.length ? (
                <Link
                  to={`/tours?season=${season.slug}`}
                  className="block cursor-pointer rounded-xl bg-theme-bg px-4 py-3 transition hover:bg-white"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Available Packages</p>
                  <p className="mt-1 text-[15px] font-semibold text-theme">{season.packages.length} matching tours</p>
                </Link>
              ) : (
                <div className="rounded-xl bg-theme-bg px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Available Packages</p>
                  <p className="mt-1 text-[15px] font-semibold text-theme">No matching tours yet</p>
                </div>
              )}
              <div className="rounded-xl bg-theme-bg px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Ideal For</p>
                <p className="mt-1 text-[15px] font-semibold text-theme">{season.idealFor}</p>
              </div>
              <div className="rounded-xl bg-theme-bg px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Weather Feel</p>
                <p className="mt-1 text-[15px] font-semibold text-theme">{season.weather}</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-theme bg-theme-surface p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
                Why This Season
              </p>
              <ul className="mt-3 space-y-2.5">
                {season.whyGo.map((item) => (
                  <li key={item} className="text-[15px] leading-6 text-muted">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--c-brand)]">
                Planning Notes
              </p>
              <ul className="mt-3 space-y-2.5">
                {season.notes.map((item) => (
                  <li key={item} className="text-[15px] leading-6 text-muted">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default SeasonDetails;
