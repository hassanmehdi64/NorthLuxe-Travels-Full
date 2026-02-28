import { Link } from "react-router-dom";
import { useMemo } from "react";
import { MoveUpRight } from "lucide-react";
import TourCard from "../tours/TourCard";
import { usePublicTours } from "../../hooks/useCms";

const PopularTours = () => {
  const { data: tours = [] } = usePublicTours();
  const list = useMemo(() => {
    return tours
      .filter((tour) => Boolean(tour?.featured))
      .sort((a, b) => {
        const featuredScoreA = Number(Boolean(a?.featured)) * 2 + Number(Number(a?.availableSeats || 0) > 0);
        const featuredScoreB = Number(Boolean(b?.featured)) * 2 + Number(Number(b?.availableSeats || 0) > 0);
        return featuredScoreB - featuredScoreA;
      })
      .slice(0, 4);
  }, [tours]);

  return (
    <section className="py-12 lg:py-14 bg-theme-bg ql-scroll-reveal" data-ql-reveal>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--c-brand)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--c-brand)]">
                  Featured Collection
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-theme tracking-tight">
                Featured <span className="text-[var(--c-brand)]">Tours</span>
              </h2>

              <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed">
                Most booked experiences with live availability and direct booking.
              </p>
            </div>

            <Link
              to="/tours"
              className="inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-xl border border-theme bg-theme-surface px-5 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-theme hover:text-[var(--c-brand)] hover:border-[var(--c-brand)]/45 hover:bg-white transition-all duration-300 active:scale-[0.98]"
            >
              View All Tours
              <MoveUpRight size={14} />
            </Link>
          </div>
        </div>

        {list.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {list.map((tour) => (
              <div key={tour.id} className="h-full">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-light bg-theme-surface py-16 text-center ql-section-subheading">
            Featured tours will appear here after publishing from the dashboard.
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularTours;
