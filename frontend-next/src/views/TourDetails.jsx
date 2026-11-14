"use client";

import { useMemo } from "react";
import { ArrowLeft, Check, ChevronDown, Clock3, MapPin, Star, Users, X } from "lucide-react";
import { Link, useParams } from "@/lib/router";
import { usePublicContentList, usePublicTour, usePublicTours, useSettings } from "../hooks/useCms";
import PhotoGallery from "../components/media/PhotoGallery";
import Carousel from "../components/media/Carousel";
import Reveal from "../components/motion/Reveal";
import TourBookingPanel from "../components/tour-details/TourBookingPanel";
import TourCard from "../components/tours/TourCard";
import { buildDisplayItinerary, buildPlacesCovered, buildTourReviews, getTourPlaceName } from "../components/tour-details/tourDetailsData";
import { getTourRating } from "../lib/reviews";

/** Section with a heading and a hairline above it (no boxed cards). */
const Section = ({ id, title, children }) => (
  <section aria-labelledby={id} className="border-t border-line pt-8">
    <h2 id={id} className="heading-3 mb-4 text-xl">{title}</h2>
    {children}
  </section>
);

const Paragraphs = ({ text }) =>
  String(text || "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => (
      <p key={index} className="mb-3 text-[15px] leading-relaxed text-body last:mb-0">{part}</p>
    ));

const PageSkeleton = () => (
  <div className="container-site py-8" aria-busy="true" aria-label="Loading tour">
    <div className="skeleton h-5 w-40" />
    <div className="skeleton mt-4 h-9 w-2/3" />
    <div className="skeleton mt-6 h-[320px] w-full rounded-panel" />
  </div>
);

const TourDetails = () => {
  const { slug } = useParams();
  const { data: directTour, isLoading } = usePublicTour(slug);
  const { data: tours = [] } = usePublicTours();
  const { data: settings } = useSettings(true);
  const { data: faqEntries = [] } = usePublicContentList("faq");

  const tour = useMemo(() => directTour || tours.find((item) => item.slug === slug || item.id === slug), [directTour, tours, slug]);

  const data = useMemo(() => {
    if (!tour) return null;
    return {
      // Only the tour's own photos — never stock/third-party fallbacks.
      photos: [tour.image, ...(Array.isArray(tour.gallery) ? tour.gallery : [])].filter(Boolean),
      itinerary: buildDisplayItinerary(tour),
      places: buildPlacesCovered(tour),
      reviews: buildTourReviews(tour),
      rating: getTourRating(tour),
      inclusions: (tour.inclusions || []).filter(Boolean),
      exclusions: (tour.exclusions || []).filter(Boolean),
      related: tours
        .filter((item) => item.id !== tour.id && item.status !== "draft")
        .filter((item) => getTourPlaceName(item) && getTourPlaceName(item) === getTourPlaceName(tour))
        .slice(0, 4),
    };
  }, [tour, tours]);

  const faqs = faqEntries
    .map((item) => ({ q: item.question || item.title || "", a: item.answer || item.description || "" }))
    .filter((item) => item.q && item.a);
  const goodToKnow = String(settings?.bookingPricing?.transportNote || "").trim();

  if (!tour && isLoading) return <PageSkeleton />;
  if (!tour || !data) {
    return (
      <div className="container-site py-16 text-center">
        <h1 className="heading-2">Tour not found</h1>
        <p className="mt-2 text-subtle">This tour may have been unpublished.</p>
        <Link to="/tours" className="btn btn-primary mt-6">Browse tours</Link>
      </div>
    );
  }

  const capacity = Number(tour.capacity || 0);
  const duration = tour.durationLabel || (tour.durationDays ? `${tour.durationDays} days` : "");

  return (
    <article className="pb-28 lg:pb-16">
      <div className="container-site pt-5 sm:pt-6">
        <Link to="/tours" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-navy-900">
          <ArrowLeft size={14} aria-hidden="true" /> All tours
        </Link>

        <header className="mt-3 max-w-3xl">
          {tour.location && (
            <p className="eyebrow mb-2"><MapPin size={13} aria-hidden="true" />{tour.location}</p>
          )}
          <h1 className="heading-1">{tour.title}</h1>
          <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-body">
            {duration && <li className="inline-flex items-center gap-1.5"><Clock3 size={16} className="text-brand" aria-hidden="true" />{duration}</li>}
            {capacity > 0 && <li className="inline-flex items-center gap-1.5"><Users size={16} className="text-brand" aria-hidden="true" />Up to {capacity} per departure</li>}
            {data.rating && (
              <li className="inline-flex items-center gap-1.5">
                <Star size={16} className="fill-sand text-sand" aria-hidden="true" />
                <strong className="font-semibold text-navy-900">{data.rating.value.toFixed(1)}</strong>
                <span className="text-subtle">({data.rating.count} reviews)</span>
              </li>
            )}
          </ul>
          {tour.shortDescription && <p className="lead mt-3 text-subtle">{tour.shortDescription}</p>}
        </header>

        <div className="mt-6">
          <PhotoGallery images={data.photos} title={tour.title} />
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            {tour.description && tour.description !== tour.shortDescription && (
              <section aria-labelledby="about-title">
                <h2 id="about-title" className="heading-3 mb-3 text-xl">About this tour</h2>
                <Paragraphs text={tour.description} />
              </section>
            )}

            {data.places.length > 0 && (
              <Section id="places-title" title="Places you'll see">
                <ul className="flex flex-wrap gap-2">
                  {data.places.map((place) => <li key={place} className="chip"><MapPin size={13} className="text-brand" aria-hidden="true" />{place}</li>)}
                </ul>
              </Section>
            )}

            {data.itinerary.length > 0 && (
              <Section id="itinerary-title" title={`Itinerary · ${data.itinerary.length} day${data.itinerary.length === 1 ? "" : "s"}`}>
                <ol className="divide-y divide-line border-y border-line">
                  {data.itinerary.map((day, index) => (
                    <li key={`${day.day}-${index}`}>
                      <details className="group" open={index === 0}>
                        <summary className="flex cursor-pointer list-none items-center gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{day.day}</span>
                          <span className="min-w-0 flex-1 font-semibold text-navy-900">{day.title}</span>
                          <ChevronDown size={18} className="shrink-0 text-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="pb-4 pl-12 text-[15px] leading-relaxed text-body">{day.description || "Details for this day are shared before departure."}</p>
                      </details>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {(data.inclusions.length > 0 || data.exclusions.length > 0) && (
              <Section id="included-title" title="What's included">
                <div className="grid gap-6 sm:grid-cols-2">
                  {data.inclusions.length > 0 && (
                    <ul className="space-y-2.5">
                      {data.inclusions.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[15px] text-body"><Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />{item}</li>
                      ))}
                    </ul>
                  )}
                  {data.exclusions.length > 0 && (
                    <ul className="space-y-2.5" aria-label="Not included">
                      {data.exclusions.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[15px] text-subtle"><X size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><span><span className="sr-only">Not included: </span>{item}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>
            )}

            {goodToKnow && (
              <Section id="know-title" title="Good to know">
                <p className="rounded-card bg-sand-50 px-4 py-3 text-[15px] leading-relaxed text-body">{goodToKnow}</p>
              </Section>
            )}

            {data.reviews.length > 0 && (
              <Section id="reviews-title" title="Guest reviews">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {data.reviews.map((review) => (
                    <li key={review.id} className="rounded-card bg-surface p-4 ring-1 ring-line">
                      <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} aria-hidden="true" className={i < review.rating ? "fill-sand text-sand" : "text-line-strong"} />)}
                      </div>
                      <p className="mt-2 text-[15px] leading-relaxed text-body">{review.comment}</p>
                      <p className="mt-2 text-sm font-semibold text-navy-900">{review.name}<span className="font-normal text-subtle">{review.date ? ` · ${review.date}` : ""}</span></p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {faqs.length > 0 && (
              <Section id="faq-title" title="Questions">
                <div className="divide-y divide-line border-y border-line">
                  {faqs.map((item) => (
                    <details key={item.q} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <ChevronDown size={18} className="shrink-0 text-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <p className="pb-4 text-[15px] leading-relaxed text-body">{item.a}</p>
                    </details>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <TourBookingPanel tour={tour} />
        </div>
      </div>

      {data.related.length > 0 && (
        <section aria-labelledby="related-title" className="section mt-6 section-white">
          <div className="container-site">
            <h2 id="related-title" className="heading-2 mb-5">More tours in {getTourPlaceName(tour)}</h2>
            <Reveal>
              <Carousel label={`More tours in ${getTourPlaceName(tour)}`} slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/4">
                {data.related.map((item) => <TourCard key={item.id} tour={item} />)}
              </Carousel>
            </Reveal>
          </div>
        </section>
      )}
    </article>
  );
};

export default TourDetails;
