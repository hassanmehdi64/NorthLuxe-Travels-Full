import Loader from "../components/spinner/Loader";
import { useMemo, useState } from "react";
import { useParams } from "@/lib/router";

import { usePublicContentList, usePublicTour, usePublicTours, useSettings } from "../hooks/useCms";
import {
  MobileBookingBar,
  TourBookingCard,
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

  const { data: directTour, isLoading: tourLoading } = usePublicTour(slug);
  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
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

    const displayItinerary = buildDisplayItinerary(tour);
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

  if (!tour && (tourLoading || toursLoading)) return <Loader fullPage label="Loading tour details" />;

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
    <section className="tour-detail-page bg-theme-bg pb-24 pt-5 lg:pb-12">
      <div className="tour-detail-container mx-auto w-full max-w-[1328px] px-6">
        <TourDetailsBreadcrumbs tour={tour} />
        <div className="mt-5 space-y-5">
          <TourDetailsHeader tour={tour} ratingValue={ratingValue} reviewCount={reviewCount} planLabel={planLabel} />
          <TourImageGallery images={heroImages} title={tour.title} />
          <div className="tour-detail-layout grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="tour-detail-content min-w-0 rounded-xl border border-theme bg-white px-5 sm:px-6">
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
            <div className="tour-detail-sidebar min-w-0 lg:sticky lg:top-6">
              <TourBookingCard tour={tour} />
            </div>
          </div>
        </div>
      </div>

      <MobileBookingBar tour={tour} />
    </section>
  );
};

export default TourDetails;
