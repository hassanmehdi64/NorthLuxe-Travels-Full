import { formatCurrencyAmount } from "../utils/currency";

/**
 * Single source of truth for how a tour's price is displayed.
 *
 * `tour.price` is a PER-DAY rate (owner-confirmed). The backend quote
 * (backend/src/utils/pricing.js → calculateBookingQuote) uses the same rule:
 *   discounted day rate = round(price × (1 − discountPercent / 100))
 *   tour total          = discounted day rate × days
 * plus vehicle / hotel / per-guest fees chosen at booking. Totals and the
 * advance always come from that backend quote, never from the client.
 */

export const PRICE_UNIT = "day";
export const PRICE_UNIT_LABEL = "/ day";

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[^\d.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getTourPricing = (tour = {}) => {
  const basePrice = Math.max(0, toNumber(tour?.price));
  const discountPercent = Math.max(0, Math.min(95, Math.round(toNumber(tour?.discountPercent))));
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
  const hasDiscount = discountPercent > 0 && finalPrice < basePrice;
  const currency = tour?.currency || "PKR";
  const days = Math.max(0, Math.round(toNumber(tour?.durationDays)));

  return {
    basePrice,
    discountPercent: hasDiscount ? discountPercent : 0,
    finalPrice,
    hasDiscount,
    hasPrice: basePrice > 0,
    currency,
    unit: PRICE_UNIT,
    unitLabel: PRICE_UNIT_LABEL,
    days,
    /** Tour day-rate × days, before vehicle / hotel / guest fees. */
    tourOnlyTotal: days > 0 ? finalPrice * days : 0,
    formattedBase: formatCurrencyAmount(basePrice, currency),
    formattedFinal: formatCurrencyAmount(finalPrice, currency),
  };
};

/** Sort key for "price low/high" so sorting matches what customers see. */
export const getTourSortPrice = (tour) => getTourPricing(tour).finalPrice;
