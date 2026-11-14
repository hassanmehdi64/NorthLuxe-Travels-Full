export const fallbackFaq = [
  { q: "Can this tour be customized?", a: "Yes. You can share your preferred route, comfort level, and pace during booking." },
  { q: "Is transport included in this package?", a: "Transport is included according to selected plan and confirmed itinerary." },
  { q: "How much advance payment is required?", a: "Advance requirements are shared during booking confirmation according to active policy." },
  { q: "What is the cancellation policy?", a: "Cancellation terms depend on booking date and vendor windows. Final policy is shared in confirmation." },
];

export const fallbackReviews = [];

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

export const getTourMood = (tour) => {
  const searchText = [tour?.title, ...(Array.isArray(tour?.tags) ? tour.tags : [])].filter(Boolean).join(" ").toLowerCase();
  if (searchText.includes("summer")) return "Summer Tour";
  if (searchText.includes("winter")) return "Winter Tour";
  if (searchText.includes("spring")) return "Spring Tour";
  if (searchText.includes("autumn") || searchText.includes("fall")) return "Autumn Tour";
  if (searchText.includes("family")) return "Family Tour";
  if (searchText.includes("group")) return "Group Tour";
  if (searchText.includes("premium") || searchText.includes("luxury")) return "Premium Tour";
  if (searchText.includes("heritage") || searchText.includes("culture")) return "Heritage Tour";
  return "Scenic Tour";
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

export const buildIncludedServices = (tour) => {
  const services = [];
  const durationDays = Number(tour?.durationDays || 0);
  const placeName = normalizePlaceName(tour?.location);
  const hotelCategories = Array.isArray(tour?.availableOptions?.hotelCategories)
    ? tour.availableOptions.hotelCategories.filter(Boolean)
    : [];
  const vehicleTypes = Array.isArray(tour?.availableOptions?.vehicleTypes)
    ? tour.availableOptions.vehicleTypes.filter(Boolean)
    : [];
  const displayItinerary = buildDisplayItinerary(tour);
  const itineraryTitles = displayItinerary
    .map((item) => String(item?.title || "").trim())
    .filter(Boolean)
    .slice(0, 2);

  if (durationDays > 0) {
    services.push(`${durationDays}-day route planning and on-trip coordination`);
  }

  if (vehicleTypes.length) {
    services.push(`Transport options for this tour: ${vehicleTypes.join(", ")}`);
  } else {
    services.push("Transport arranged according to route and group size");
  }

  if (hotelCategories.length) {
    services.push(`Stay categories available: ${hotelCategories.join(", ")}`);
  } else {
    services.push("Accommodation can be arranged on request");
  }

  services.push(`Driver allowance, fuel, and toll management for ${placeName}`);

  if (itineraryTitles.length) {
    services.push(`Structured sightseeing flow including ${itineraryTitles.join(" and ")}`);
  } else {
    services.push(`Sightseeing coordination across ${placeName}`);
  }

  return services;
};

export const buildVehicleDetails = (tour) => {
  const configuredVehicles = Array.isArray(tour?.availableOptions?.vehicleTypes)
    ? tour.availableOptions.vehicleTypes.filter(Boolean)
    : [];

  if (configuredVehicles.length) {
    return configuredVehicles;
  }

  const seats = Number(tour?.availableSeats ?? tour?.capacity ?? 0);
  if (seats >= 12) return ["Coaster / Saloon", "SUV support vehicle"];
  if (seats >= 6) return ["SUV / Prado", "Hiace / Grand Cabin"];
  if (seats >= 2) return ["Sedan / Corolla", "SUV upgrade on request"];
  return ["Transport arranged as per group size"];
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


const heroGalleryFallbacks = {
  fairy: [
    "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
    "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
    "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
  ],
  hunza: [
    "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
    "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
    "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
  ],
  skardu: [
    "https://visitgilgitbaltistan.gov.pk/storage/images/egawjw4TjQ4b8yD9iUHzkLxFwwxyce-metaQ2h1bmRhLXZhbGxleS0xMDI0eDY4My5qcGc%3D-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/EgzRNEiwXoQdYYriBJZ4pfaOqAZtEE-metaU2hhbmdyaWxhLF9Mb3dlcl9LYWNodXJhX0xha2UuanBn-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/VYOw4S1I2iCdU3YoaagAMTAAGsKj97-metaU0FEUEFSQSBsYWtlIFNrYXJkdSwgUGFraXN0YW4gLSBDb3B5LmpwZw%3D%3D-.jpg",
  ],
  nagar: [
    "https://visitgilgitbaltistan.gov.pk/storage/images/amF3lOQaNWavgTlumgn9lgeW8FdoL1-metacmFrYXBvc2hpX3ZpZXdfcG9pbnRfcGFraXN0YW4uanBn-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/UrfxjQ5cNIyBVoWo1q1WwTkegmiM8T-metaSGlzcGFyIEdsY2FjaWVyLkpQRw%3D%3D-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/iAl0RLMGh7yzaKXYZLglObq4QzY09V-metaUnVzaCBMYWtlIDMuanBn-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/XZna35rr13FxPXMijjw4yzlY09Nitq-metaa2FjaGVsaSBsYWtlLmpwZw%3D%3D-.jpg",
  ],
  deosai: [
    "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Shangrila_resort_skardu.jpg/1024px-Shangrila_resort_skardu.jpg",
  ],
};

export const getTourHeroImages = (tour) => {
  const configured = [tour?.image, ...(Array.isArray(tour?.gallery) ? tour.gallery : [])].filter(Boolean);
  if (configured.length > 1) return [...new Set(configured)];

  const searchKey = [tour?.location, tour?.title, ...(Array.isArray(tour?.tags) ? tour.tags : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchedKey = Object.keys(heroGalleryFallbacks).find((key) => searchKey.includes(key));
  const fallback = matchedKey ? heroGalleryFallbacks[matchedKey] : [];
  return [...new Set([...configured, ...fallback])];
};
export const buildPackageOverview = (tour) => [
  { label: "Package Type", value: `${getTourMood(tour)} in ${normalizePlaceName(tour?.location)}` },
  { label: "Travel Style", value: "Private tour planning with flexible coordination" },
];

export const buildDetailedDescription = (tour) =>
  tour.description ||
  tour.shortDescription || "";

const DEFAULT_TRANSPORT_NOTE =
  "Prices are for transport only. Hotels, meals, boating, entry tickets, jeep charges, and personal expenses are not included.";

export const buildCommonTourFacts = (settings) => {
  const bookingPricing = settings?.bookingPricing || {};
  const transportNote = String(bookingPricing.transportNote || "").trim() || DEFAULT_TRANSPORT_NOTE;
  const vehicleStartingPrices = Array.isArray(bookingPricing.vehicleTypes)
    ? bookingPricing.vehicleTypes
        .filter((item) => item?.active !== false && String(item?.label || item?.key || "").trim())
        .map((item) => ({
          label: String(item.label || item.key).trim(),
          dailyRate: Number(item.dailyRate || 0),
        }))
    : [];

  return {
    transportNote,
    vehicleStartingPrices,
  };
};

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
