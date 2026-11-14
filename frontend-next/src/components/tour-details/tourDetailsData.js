export const normalizePlaceName = (location = "") =>
  String(location)
    .replace(/\b(valley|lake|lakes|district|region|plateau|meadows)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim() || "Northern Pakistan";

export const getTourPlaceName = (tour) => normalizePlaceName(tour?.location);

export const getTourPlanCount = (tour) => Number(tour?.availableSeats ?? tour?.capacity ?? 0);

export const getTourPlanLabel = (tour) => {
  const persons = getTourPlanCount(tour);
  return persons ? `${persons} ${persons === 1 ? "person" : "persons"} plan` : "Custom plan";
};

/**
 * Itinerary is shown exactly as entered by the admin: one entry per day,
 * description shown once. Nothing is invented when the itinerary is empty.
 */
export const buildDisplayItinerary = (tour) => {
  const source = Array.isArray(tour?.itinerary) ? tour.itinerary.filter(Boolean) : [];
  return source
    .map((item, index) => ({
      day: Number(item?.day) || index + 1,
      title: String(item?.title || "").trim() || `Day ${index + 1}`,
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title || item.description);
};

/** "Places covered" chips come only from the admin-entered `tour.places` list. */
export const buildPlacesCovered = (tour) =>
  Array.from(
    new Set(
      (Array.isArray(tour?.places) ? tour.places : [])
        .map((place) => String(place || "").trim())
        .filter(Boolean),
    ),
  );

export const buildTourReviews = (tour) =>
  Array.isArray(tour?.reviewItems)
    ? tour.reviewItems
        .map((item, index) => ({
          id: `${tour?.id || tour?.slug || "tour"}-review-${index + 1}`,
          name: item?.name || "Guest",
          rating: Math.max(1, Math.min(5, Number(item?.rating || 5))),
          date: item?.date || "",
          tag: item?.tag || "Guest Review",
          comment: item?.comment || "",
        }))
        .filter((item) => item.name || item.comment)
    : [];
