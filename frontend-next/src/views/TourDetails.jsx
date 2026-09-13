import { useMemo, useState } from "react";
import { useParams } from "@/lib/router";

import { usePublicContentList, usePublicTour, usePublicTours, useSettings } from "../hooks/useCms";
import {
  MobileBookingBar,
  TourBookingCard,
  TourDetailsActions,
  TourDetailsBreadcrumbs,
  TourDetailsHeader,
  TourImageGallery,
} from "../components/tour-details/TourDetailsSections";
import {
  FaqSection,
  InclusionsSection,
  ItinerarySection,
  OverviewSection,
  RouteSection,
} from "../components/tour-details/TourDetailsContentSections";
import { ReviewsSection } from "../components/tour-details/TourDetailsFooterSections";
import {
  buildCommonTourFacts,
  buildDetailedDescription,
  buildDisplayItinerary,
  buildIncludedServices,
  buildPackageOverview,
  buildPlacesCovered,
  buildTourReviews,
  getTourHeroImages,
  getTourPlaceName,
  getTourPlanLabel,
} from "../components/tour-details/tourDetailsData";

const MAX_ITINERARY_DAYS = 10;

const getRatingValue = (tour, reviews) => {
  if (reviews.length) {
    const totalRating = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );

    return Number((totalRating / reviews.length).toFixed(1));
  }

  const tourRating = Number(tour?.rating);
  return Number.isFinite(tourRating) && tourRating > 0 ? tourRating : 0;
};

const buildBeforeYouBookNotes = (transportNote) => {
  const noteParts = String(transportNote || "")
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  return Array.from(new Set(noteParts)).slice(0, 4);
};

const TourDetails = () => {
  const { slug } = useParams();

  const { data: directTour } = usePublicTour(slug);
  const { data: tours = [] } = usePublicTours();
  const { data: settings = {} } = useSettings(true);
  const { data: faqEntries = [] } = usePublicContentList("faq");

  const [openFaq, setOpenFaq] = useState(0);
  const [openItineraryDay, setOpenItineraryDay] = useState(0);

  const tour = useMemo(() => {
    if (directTour) return directTour;
    return tours.find((item) => item.slug === slug || item.id === slug);
  }, [directTour, tours, slug]);

  const faqItems = useMemo(
    () => faqEntries
      .map((item) => ({ q: item.question || item.title || "", a: item.answer || item.description || "" }))
      .filter((item) => item.q && item.a),
    [faqEntries],
  );

  const tourData = useMemo(() => {
    if (!tour) return null;

    const displayItinerary = buildDisplayItinerary(tour).slice(
      0,
      MAX_ITINERARY_DAYS,
    );
    const reviews = buildTourReviews(tour);
    const ratingValue = getRatingValue(tour, reviews);
    const reviewCount = reviews.length || Number(tour.reviews || 0);
    const includedServices = buildIncludedServices(tour);
    const planLabel = getTourPlanLabel(tour);
    const commonFacts = buildCommonTourFacts(settings);

    return {
      heroImages: getTourHeroImages(tour),
      displayItinerary,
      reviews,
      ratingValue,
      reviewCount,
      includedServices,
      planLabel,
      commonFacts,
      packageOverview: buildPackageOverview(tour),
      placesCovered: buildPlacesCovered(tour, displayItinerary),
      placeName: getTourPlaceName(tour),
      detailedDescription: buildDetailedDescription(tour),
      beforeYouBook: buildBeforeYouBookNotes(commonFacts.transportNote),
    };
  }, [tour, settings]);

  if (!tour || !tourData) {
    return (
      <section className="bg-theme-bg py-12">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-theme bg-theme-surface py-16 text-center text-muted">
            Tour not found or not published.
          </div>
        </div>
      </section>
    );
  }

  const {
    heroImages,
    displayItinerary,
    reviews,
    ratingValue,
    reviewCount,
    includedServices,
    planLabel,
    packageOverview,
    placesCovered,
    placeName,
    detailedDescription,
    beforeYouBook,
  } = tourData;

  return (
    <section className="bg-[linear-gradient(180deg,#f7fafc_0%,var(--c-bg)_34%,var(--c-bg)_100%)] pb-24 pt-5 md:pb-12 md:pt-7">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        <TourDetailsBreadcrumbs tour={tour} />

        <div className="mt-4">
          <section className="w-full min-w-0">
            <div className="space-y-4">
              <TourDetailsHeader
                tour={tour}
                ratingValue={ratingValue}
                reviewCount={reviewCount}
                planLabel={planLabel}
              />

              <div className="lg:hidden">
                <TourDetailsActions tour={tour} />
              </div>

              <TourImageGallery images={heroImages} title={tour.title} />

              <div className="hidden lg:block">
                <TourBookingCard tour={tour} />
              </div>
            </div>

            <div className="mt-5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-[0_6px_20px_rgba(6,27,58,0.035)] sm:px-5 lg:px-6">
            <OverviewSection
              description={detailedDescription}
              packageOverview={packageOverview}
            />

            <InclusionsSection
              includedServices={includedServices}
              beforeYouBook={beforeYouBook}
            />

            <ItinerarySection
              items={displayItinerary}
              openIndex={openItineraryDay}
              onToggle={(index) =>
                setOpenItineraryDay((current) => (current === index ? -1 : index))
              }
            />

            <RouteSection
              placeName={placeName}
              placesCovered={placesCovered}
            />

            <ReviewsSection reviews={reviews} />

            <FaqSection
              items={faqItems}
              openIndex={openFaq}
              onToggle={(index) =>
                setOpenFaq((current) => (current === index ? -1 : index))
              }
            />

            </div>
          </section>
        </div>
      </div>

      <MobileBookingBar tour={tour} />
    </section>
  );
};

export default TourDetails;
