const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getDurationDays = ({ travelDate, endDate, fallbackDays }) => {
  if (travelDate && endDate) {
    const start = new Date(travelDate);
    const end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      return Math.max(1, diff);
    }
  }
  return Math.max(1, toNumber(fallbackDays, 1));
};

const normalizePricedOptions = (items = []) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item && item.active !== false && item.key)
    .map((item) => ({
      key: String(item.key),
      label: item.label || String(item.key),
      dailyRate: toNumber(item.dailyRate, 0),
    }));

const normalizeOptionKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

/**
 * Map a tour's option values onto settings entries. Tours historically stored labels
 * ("Comfort", "Coaster") instead of settings keys ("3_star", "prado_old"), so match by
 * key OR label. Values that match nothing are ignored (and reported by the
 * normalize-tour-options migration). If none match, every active option is allowed.
 */
export const resolveAllowedOptionKeys = ({ preferred = [], options = [] }) => {
  const list = Array.isArray(preferred) ? preferred : [];
  const matched = new Set();
  for (const value of list) {
    const needle = normalizeOptionKey(value);
    const hit = options.find((option) => normalizeOptionKey(option.key) === needle || normalizeOptionKey(option.label) === needle);
    if (hit) matched.add(normalizeOptionKey(hit.key));
  }
  return matched.size ? matched : new Set(options.map((option) => normalizeOptionKey(option.key)));
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

export const calculateBookingQuote = ({
  tour,
  settings,
  payload,
  enforceAllowedOptions = true,
}) => {
  const pricing = settings?.bookingPricing || {};
  const hotelOptions = normalizePricedOptions(pricing.hotelCategories);
  const vehicleOptions = normalizePricedOptions(pricing.vehicleTypes);

  const allowedHotels = resolveAllowedOptionKeys({ preferred: tour?.availableOptions?.hotelCategories, options: hotelOptions });
  allowedHotels.add("no_hotel");
  const allowedVehicles = resolveAllowedOptionKeys({ preferred: tour?.availableOptions?.vehicleTypes, options: vehicleOptions });

  const adults = Math.max(1, toNumber(payload.adults, 1));
  const children = Math.max(0, toNumber(payload.children, 0));
  const guests = adults + children;
  const days = getDurationDays({
    travelDate: payload.travelDate,
    endDate: payload.endDate,
    fallbackDays: tour?.durationDays,
  });

  const selectedHotelKey = payload?.facilities?.hotelType || payload.hotelType || "no_hotel";
  const defaultVehicle = vehicleOptions.find((x) => allowedVehicles.has(normalizeOptionKey(x.key)));
  const selectedVehicleKey =
    payload?.facilities?.vehicleType || payload.vehicleType || defaultVehicle?.key || "";
  const normalizedSelectedHotelKey = normalizeOptionKey(selectedHotelKey);
  const normalizedSelectedVehicleKey = normalizeOptionKey(selectedVehicleKey);
  const mealsSelection = payload?.facilities?.meals ?? payload.meals ?? "no";
  const addOnsFromPayload = Array.isArray(payload?.facilities?.addOns)
    ? payload.facilities.addOns
    : Array.isArray(payload?.addOns)
      ? payload.addOns
      : [];

  if (enforceAllowedOptions && selectedHotelKey && !allowedHotels.has(normalizedSelectedHotelKey)) {
    throw httpError(400, "Selected hotel category is not available for this tour.");
  }

  if (enforceAllowedOptions && selectedVehicleKey && !allowedVehicles.has(normalizedSelectedVehicleKey)) {
    throw httpError(400, "Selected vehicle type is not available for this tour.");
  }

  const selectedHotel = hotelOptions.find((x) => normalizeOptionKey(x.key) === normalizedSelectedHotelKey);
  const selectedVehicle = vehicleOptions.find((x) => normalizeOptionKey(x.key) === normalizedSelectedVehicleKey);

  // Never quote PKR 0 for an option that exists but has no price configured.
  if (normalizedSelectedHotelKey && normalizedSelectedHotelKey !== "no_hotel" && !selectedHotel) {
    throw httpError(400, "This hotel option isn't priced yet. Please choose another or contact us.");
  }
  if (normalizedSelectedVehicleKey && !selectedVehicle) {
    throw httpError(400, "This vehicle option isn't priced yet. Please choose another or contact us.");
  }

  // `tour.price` is a per-day rate. The tour's discount applies to that rate only
  // (not to vehicle, hotel or per-guest fees), matching what tour cards advertise.
  const listTourDailyRate = toNumber(tour?.price, 0);
  const discountPercent = Math.max(0, Math.min(95, toNumber(tour?.discountPercent, 0)));
  const baseTourDailyRate = Math.round(listTourDailyRate * (1 - discountPercent / 100));
  const dailyBaseFee = toNumber(pricing.dailyBaseFee, 0);
  const perGuestDailyFee = toNumber(pricing.perGuestDailyFee, 0);
  const mealsDailyRate = toNumber(pricing.mealsDailyRate, 0);
  const insuranceRate = toNumber(pricing.insuranceRate, 0);
  const airportTransferRate = toNumber(pricing.airportTransferRate, 0);

  const baseTourTotal = baseTourDailyRate * days;
  const tourDiscountTotal = (listTourDailyRate - baseTourDailyRate) * days;
  const baseDailyCharges = dailyBaseFee * days;
  const guestDailyCharges = perGuestDailyFee * guests * days;
  const hotelTotal = toNumber(selectedHotel?.dailyRate, 0) * days;
  const vehicleTotal = toNumber(selectedVehicle?.dailyRate, 0) * days;
  const mealsTotal =
    mealsSelection === "yes" || mealsSelection === true ? mealsDailyRate * guests * days : 0;

  const insuranceTotal = addOnsFromPayload.includes("insurance") ? insuranceRate * guests : 0;
  const airportTransferTotal = addOnsFromPayload.includes("airport_transfer")
    ? airportTransferRate
    : 0;

  const totalAmount = Math.max(
    0,
    Math.round(
      baseTourTotal +
        baseDailyCharges +
        guestDailyCharges +
        hotelTotal +
        vehicleTotal +
        mealsTotal +
        insuranceTotal +
        airportTransferTotal,
    ),
  );

  const advanceAmount = payload.paymentMethod === "pay_on_arrival"
    ? 0
    : payload.paymentPlan === "full"
      ? totalAmount
      : Math.round(totalAmount * 0.1);
  const remainingAmount = Math.max(0, totalAmount - advanceAmount);

  return {
    days,
    guests,
    adults,
    children,
    selections: {
      hotelType: selectedHotelKey,
      meals: mealsSelection === "yes" || mealsSelection === true ? "yes" : "no",
      vehicleType: selectedVehicleKey,
      addOns: addOnsFromPayload,
    },
    breakdown: {
      listTourDailyRate,
      tourDailyRate: baseTourDailyRate,
      discountPercent,
      tourDiscountTotal,
      baseTourTotal,
      baseDailyCharges,
      guestDailyCharges,
      hotelTotal,
      vehicleTotal,
      mealsTotal,
      insuranceTotal,
      airportTransferTotal,
    },
    totalAmount,
    advanceAmount,
    remainingAmount,
    options: {
      hotelCategories: hotelOptions.filter((x) => allowedHotels.has(normalizeOptionKey(x.key))),
      vehicleTypes: vehicleOptions.filter((x) => allowedVehicles.has(normalizeOptionKey(x.key))),
    },
  };
};
