/**
 * Ratings are shown only when they are backed by enough real reviews.
 * Override with NEXT_PUBLIC_MIN_REVIEWS_FOR_RATING (default 3).
 */
const configuredMinimum = Number(process.env.NEXT_PUBLIC_MIN_REVIEWS_FOR_RATING);
export const MIN_REVIEWS_FOR_RATING =
  Number.isFinite(configuredMinimum) && configuredMinimum > 0 ? Math.floor(configuredMinimum) : 3;

/**
 * Returns { value, count } computed from the tour's real review items,
 * or null when there are too few reviews to show a rating.
 */
export const getTourRating = (tour = {}) => {
  const items = Array.isArray(tour?.reviewItems) ? tour.reviewItems : [];
  const ratings = items
    .map((item) => Number(item?.rating))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

  if (ratings.length < MIN_REVIEWS_FOR_RATING) return null;

  const value = Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1));
  return { value, count: ratings.length };
};
