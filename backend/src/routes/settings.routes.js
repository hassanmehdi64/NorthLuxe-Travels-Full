import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { SiteSetting } from "../models/SiteSetting.js";

const router = express.Router();
const SETTINGS_KEY = "default";

const getOrCreateSettings = async () => {
  let settings = await SiteSetting.findOne({ key: SETTINGS_KEY });
  if (!settings) settings = await SiteSetting.create({ key: SETTINGS_KEY });
  return settings;
};

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const cleanString = (value) => (typeof value === "string" ? value.trim() : value);

const isSafeUrl = (value) => {
  if (!value) return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^data:image\/[a-zA-Z+]+;base64,/.test(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const sanitizePricedOptions = (options = []) => {
  if (!Array.isArray(options)) return undefined;
  return options
    .filter((item) => isObject(item))
    .map((item, index) => ({
      key: cleanString(item.key) || `option_${index + 1}`,
      label: cleanString(item.label) || `Option ${index + 1}`,
      dailyRate: Number.isFinite(Number(item.dailyRate)) ? Math.max(0, Number(item.dailyRate)) : 0,
      active: Boolean(item.active),
    }));
};

const buildSettingsUpdate = (payload = {}) => {
  const update = {};

  const stringFields = [
    "siteName",
    "siteEmail",
    "sitePhone",
    "address",
    "currency",
    "seoTitle",
    "seoDescription",
    "primaryColor",
    "logoUrl",
    "faviconUrl",
  ];

  for (const field of stringFields) {
    if (payload[field] !== undefined) update[field] = cleanString(payload[field]);
  }

  if (payload.maintenanceMode !== undefined) {
    update.maintenanceMode = Boolean(payload.maintenanceMode);
  }

  if (isObject(payload.socialLinks)) {
    update.socialLinks = {};
    for (const key of ["facebook", "instagram", "whatsapp", "twitter"]) {
      if (payload.socialLinks[key] !== undefined) {
        update.socialLinks[key] = cleanString(payload.socialLinks[key]);
      }
    }
  }

  if (isObject(payload.paymentConfig)) {
    update.paymentConfig = {};
    for (const key of ["allowManualVerification", "requireVerifiedPaymentForCard"]) {
      if (payload.paymentConfig[key] !== undefined) {
        update.paymentConfig[key] = Boolean(payload.paymentConfig[key]);
      }
    }
  }

  if (isObject(payload.bookingPricing)) {
    update.bookingPricing = {};
    for (const key of [
      "dailyBaseFee",
      "perGuestDailyFee",
      "mealsDailyRate",
      "insuranceRate",
      "airportTransferRate",
    ]) {
      if (payload.bookingPricing[key] !== undefined) {
        const number = Number(payload.bookingPricing[key]);
        update.bookingPricing[key] = Number.isFinite(number) ? Math.max(0, number) : 0;
      }
    }
    if (payload.bookingPricing.hotelCategories !== undefined) {
      update.bookingPricing.hotelCategories = sanitizePricedOptions(payload.bookingPricing.hotelCategories);
    }
    if (payload.bookingPricing.vehicleTypes !== undefined) {
      update.bookingPricing.vehicleTypes = sanitizePricedOptions(payload.bookingPricing.vehicleTypes);
    }
  }

  return update;
};

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ item: settings });
  }),
);

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ item: settings });
  }),
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const updates = buildSettingsUpdate(req.body);
    if (!isSafeUrl(updates.logoUrl) || !isSafeUrl(updates.faviconUrl)) {
      return res.status(400).json({
        message: "Invalid logo or favicon URL. Use http(s) URL or base64 image data URL.",
      });
    }

    const settings = await getOrCreateSettings();
    settings.set(updates);
    await settings.save();
    res.json({ item: settings });
  }),
);

export default router;
