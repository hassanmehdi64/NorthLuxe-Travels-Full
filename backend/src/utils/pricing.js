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

const pickAllowedOptionKeys = ({ preferred = [], fallback = [] }) => {
  const list = Array.isArray(preferred) && preferred.length ? preferred : fallback;
  return new Set(list);
};

export const calculateBookingQuote = ({
  tour,
  settings,
  payload,
  enforceAllowedOptions = true,
}) => {
  const pricing = settings?.bookingPricing || {};
  const hotelOptions = normalizePricedOptions(pricing.hotelCategories);
  const vehicleOptions = normalizePricedOptions(pricing.vehicleTypes);

  const allowedHotels = pickAllowedOptionKeys({
    preferred: tour?.availableOptions?.hotelCategories,
    fallback: hotelOptions.map((x) => x.key),
  });
  allowedHotels.add("no_hotel");
  const allowedVehicles = pickAllowedOptionKeys({
    preferred: tour?.availableOptions?.vehicleTypes,
    fallback: vehicleOptions.map((x) => x.key),
  });

  const adults = Math.max(1, toNumber(payload.adults, 1));
  const children = Math.max(0, toNumber(payload.children, 0));
  const guests = adults + children;
  const days = getDurationDays({
    travelDate: payload.travelDate,
    endDate: payload.endDate,
    fallbackDays: tour?.durationDays,
  });

  const selectedHotelKey = payload?.facilities?.hotelType || payload.hotelType || "no_hotel";
  const selectedVehicleKey =
    payload?.facilities?.vehicleType || payload.vehicleType || vehicleOptions[0]?.key || "";
  const mealsSelection = payload?.facilities?.meals ?? payload.meals ?? "no";
  const addOnsFromPayload = Array.isArray(payload?.facilities?.addOns)
    ? payload.facilities.addOns
    : Array.isArray(payload?.addOns)
      ? payload.addOns
      : [];

  if (enforceAllowedOptions && selectedHotelKey && !allowedHotels.has(selectedHotelKey)) {
    throw new Error("Selected hotel category is not available for this tour.");
  }

  if (enforceAllowedOptions && selectedVehicleKey && !allowedVehicles.has(selectedVehicleKey)) {
    throw new Error("Selected vehicle type is not available for this tour.");
  }

  const selectedHotel = hotelOptions.find((x) => x.key === selectedHotelKey);
  const selectedVehicle = vehicleOptions.find((x) => x.key === selectedVehicleKey);

  const baseTourDailyRate = toNumber(tour?.price, 0);
  const dailyBaseFee = toNumber(pricing.dailyBaseFee, 0);
  const perGuestDailyFee = toNumber(pricing.perGuestDailyFee, 0);
  const mealsDailyRate = toNumber(pricing.mealsDailyRate, 0);
  const insuranceRate = toNumber(pricing.insuranceRate, 0);
  const airportTransferRate = toNumber(pricing.airportTransferRate, 0);

  const baseTourTotal = baseTourDailyRate * days;
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
      hotelCategories: hotelOptions.filter((x) => allowedHotels.has(x.key)),
      vehicleTypes: vehicleOptions.filter((x) => allowedVehicles.has(x.key)),
    },
  };
};
