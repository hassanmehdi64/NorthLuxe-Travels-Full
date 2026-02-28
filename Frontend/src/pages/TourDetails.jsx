import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, MoveUpRight, Star } from "lucide-react";
import { usePublicTour, usePublicTours } from "../hooks/useCms";

const fallbackFaq = [
  {
    q: "Can this tour be customized?",
    a: "Yes. You can share your preferred route, comfort level, and pace during booking.",
  },
  {
    q: "Is transport included in this package?",
    a: "Transport is included according to selected plan and confirmed itinerary.",
  },
  {
    q: "How much advance payment is required?",
    a: "Advance requirements are shared during booking confirmation according to active policy.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Cancellation terms depend on booking date and vendor windows. Final policy is shared in confirmation.",
  },
];

const fallbackReviews = [
  {
    id: 1,
    name: "Ayesha Khan",
    rating: 5,
    date: "Jan 2026",
    tag: "Family Trip",
    comment: "Very smooth coordination, reliable stays, and great route planning.",
  },
  {
    id: 2,
    name: "Omar Ahmed",
    rating: 4,
    date: "Dec 2025",
    tag: "Friends Group",
    comment: "Clean itinerary and good support. Overall experience was excellent.",
  },
  {
    id: 3,
    name: "Nida Fatima",
    rating: 5,
    date: "Nov 2025",
    tag: "Couple Tour",
    comment: "Loved the balance of comfort and exploration. Team stayed responsive.",
  },
];

const TourDetails = () => {
  const { slug } = useParams();
  const { data: directTour } = usePublicTour(slug);
  const { data: tours = [] } = usePublicTours();
  const [openFaq, setOpenFaq] = useState(0);

  const tour = useMemo(() => {
    if (directTour) return directTour;
    return tours.find((item) => item.slug === slug);
  }, [directTour, tours, slug]);

  const relatedTours = useMemo(() => {
    if (!tour) return [];
    return tours
      .filter((item) => item.id !== tour.id)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
      .slice(0, 4);
  }, [tours, tour]);

  if (!tour) {
    return (
      <section className="py-12 lg:py-14 bg-theme-bg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="rounded-2xl border border-dashed border-theme bg-theme-surface py-16 text-center text-muted">
            Tour not found or not published.
          </div>
        </div>
      </section>
    );
  }

  const itinerary = (tour.itinerary || []).slice(0, 6);
  const highlights = tour.tags?.length
    ? tour.tags
    : ["Scenic routes", "Comfort stays", "Local support", "Flexible pacing"];
  const ratingValue = Number(tour.rating || 4.8);
  const reviewCount = Number(tour.reviews || 24);
  const reviewStats = [5, 4, 3, 2, 1].map((star) => {
    const count = fallbackReviews.filter((item) => Number(item.rating) === star).length;
    const percent = fallbackReviews.length ? (count / fallbackReviews.length) * 100 : 0;
    return { star, count, percent };
  });

  const quickFacts = [
    { label: "Location", value: tour.location || "Northern Pakistan" },
    { label: "Duration", value: tour.durationLabel || `${tour.durationDays || 0} Days` },
    { label: "Seats", value: `${tour.availableSeats || 0}` },
    { label: "Style", value: tour.featured ? "Featured" : "Classic" },
  ];

  const detailedDescription =
    tour.description ||
    `${tour.title} takes you through ${tour.location || "Northern Pakistan"} with a structured day-by-day plan focused on scenic exploration, practical travel timing, and reliable support. The route is arranged to reduce fatigue, keep comfort consistent, and give meaningful stops for landscapes, culture, and local experiences. This package works well for travelers who want a clean balance of sightseeing, convenience, and predictable logistics throughout ${tour.durationLabel || `${tour.durationDays || 0} days`}.`;

  return (
    <section className="py-10 md:py-12 bg-theme-bg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 space-y-9">
        <header className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--c-brand)]">Tour Profile</p>
          <h1 className="text-2xl md:text-4xl font-bold text-theme tracking-tight">{tour.title}</h1>
          <div className="inline-flex items-center gap-3 rounded-xl border border-theme bg-theme-surface px-4 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">Starting From</p>
            <p className="text-lg md:text-xl font-bold text-theme">{tour.currency} {tour.price}</p>
            <span className="h-4 w-px bg-theme" />
            <p className="text-sm font-semibold text-theme">{tour.durationLabel || `${tour.durationDays || 0} Days`}</p>
          </div>
        </header>

        <div className="rounded-2xl border border-theme bg-theme-surface overflow-hidden">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-[220px] sm:h-[300px] lg:h-[360px] object-cover"
          />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-5">
            <article className="space-y-4">
              <p className="text-sm md:text-[15px] text-muted leading-relaxed">
                {tour.shortDescription || "A refined route designed for scenic views, smooth travel operations, and memorable local experiences."}
              </p>

              <div className="flex flex-wrap gap-2">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-theme bg-theme-surface px-3 py-1 text-xs font-semibold text-theme"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <section className="rounded-2xl border border-theme bg-theme-surface p-4 md:p-5">
              <h2 className="text-lg md:text-xl font-bold text-theme">Detailed Description</h2>
              <p className="mt-3 text-sm md:text-base text-muted leading-relaxed">
                {detailedDescription}
              </p>
            </section>
          </div>

          <aside className="rounded-2xl border border-theme bg-theme-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">Rating</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold text-theme">{ratingValue.toFixed(1)}</span>
              <div className="flex items-center gap-0.5 text-[var(--c-brand)]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={13} className={idx < Math.round(ratingValue) ? "fill-current" : "opacity-25"} />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted">{reviewCount} reviews</p>
            <div className="mt-4 flex items-center gap-2">
              <Link
                to={`/book/${tour.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ql-btn-primary whitespace-nowrap"
              >
                Book This Tour
                <MoveUpRight size={14} />
              </Link>
              <Link
                to="/custom-plan-request"
                state={{
                  sourceTour: {
                    id: tour.id,
                    title: tour.title,
                    location: tour.location,
                    price: tour.price,
                    currency: tour.currency,
                  },
                }}
                className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold ql-btn-secondary whitespace-nowrap"
              >
                Custom Request
              </Link>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-theme bg-theme-surface p-4 md:p-5">
          <h2 className="text-lg md:text-xl font-bold text-theme">Tour At a Glance</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickFacts.map((item) => (
              <div key={item.label} className="rounded-lg border border-theme bg-theme-bg px-3.5 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-theme">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-bold text-theme">Itinerary</h2>
          {itinerary.length ? (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {itinerary.map((item, idx) => (
                <div key={`${item.day}-${idx}`} className="rounded-xl border border-theme bg-theme-surface p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--c-brand)]">Day {item.day || idx + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-theme">{item.title || "Planned Activities"}</p>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-3">
                    {item.description || "Detailed program will be shared before departure."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Detailed itinerary is shared after booking confirmation.</p>
          )}
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-bold text-theme">Pakistan Travel FAQs</h2>
          <div className="mt-3 space-y-2">
            {fallbackFaq.map((faq, idx) => {
              const active = openFaq === idx;
              return (
                <div key={faq.q} className="rounded-xl border border-theme bg-theme-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(active ? -1 : idx)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-semibold text-theme">{faq.q}</span>
                    <ChevronDown size={16} className={`text-muted transition-transform ${active ? "rotate-180" : ""}`} />
                  </button>
                  {active ? <p className="px-4 pb-4 text-sm text-muted leading-relaxed">{faq.a}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-bold text-theme">Tour Reviews</h2>
          <div className="mt-4 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
            <aside className="rounded-xl border border-theme bg-theme-surface p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">Average Rating</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-3xl font-bold text-theme">{ratingValue.toFixed(1)}</p>
                <p className="text-xs font-semibold text-muted pb-1">/5</p>
              </div>
              <p className="mt-1 text-xs text-muted">{reviewCount} verified reviews</p>
              <div className="mt-4 space-y-2">
                {reviewStats.map((row) => (
                  <div key={row.star} className="grid grid-cols-[20px_1fr_18px] items-center gap-2">
                    <span className="text-[11px] font-semibold text-theme">{row.star}</span>
                    <div className="h-1.5 rounded-full bg-theme">
                      <div
                        className="h-1.5 rounded-full bg-[var(--c-brand)]"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted">{row.count}</span>
                  </div>
                ))}
              </div>
            </aside>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {fallbackReviews.map((item) => (
                <article key={item.id} className="rounded-xl border border-theme bg-theme-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-theme">{item.name}</p>
                    <p className="text-xs font-black text-[var(--c-brand)]">{item.rating}.0</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{item.tag} | {item.date}</p>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{item.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {relatedTours.length ? (
          <section>
            <h2 className="text-lg md:text-xl font-bold text-theme">You Might Also Like</h2>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedTours.map((item) => (
                <Link
                  key={item.id}
                  to={`/tours/${item.slug || item.id}`}
                  className="rounded-xl border border-theme bg-theme-surface p-4 hover:border-[var(--c-brand)]/45 transition"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--c-brand)]">{item.location}</p>
                  <p className="mt-1 text-sm font-semibold text-theme line-clamp-2">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
};

export default TourDetails;
