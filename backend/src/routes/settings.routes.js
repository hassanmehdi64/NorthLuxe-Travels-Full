import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { SiteSetting } from "../models/SiteSetting.js";

const router = express.Router();
const SETTINGS_KEY = "default";
const SUPPORTED_PAYMENT_METHOD_KEYS = new Set([
  "visa_card",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
  "pay_on_arrival",
]);

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

const isSafeUrlList = (items) => {
  if (!Array.isArray(items)) return false;
  return items.every((item) => isSafeUrl(item));
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

const sanitizePaymentMethods = (methods = []) => {
  if (!Array.isArray(methods)) return undefined;
  return methods
    .filter((item) => isObject(item) && SUPPORTED_PAYMENT_METHOD_KEYS.has(cleanString(item.key)))
    .map((item) => ({
      key: cleanString(item.key),
      label: cleanString(item.label) || cleanString(item.key),
      active: item.active !== false,
      accountKey: cleanString(item.accountKey) || "",
      referenceLabel: cleanString(item.referenceLabel) || "",
      instructions: cleanString(item.instructions) || "",
    }));
};

const sanitizeReceivingAccounts = (accounts = []) => {
  if (!Array.isArray(accounts)) return undefined;
  return accounts
    .filter((item) => isObject(item))
    .map((item, index) => ({
      key: cleanString(item.key) || `account_${index + 1}`,
      label: cleanString(item.label) || `Account ${index + 1}`,
      accountTitle: cleanString(item.accountTitle) || "",
      accountNumber: cleanString(item.accountNumber) || "",
      bankName: cleanString(item.bankName) || "",
      contactNumber: cleanString(item.contactNumber) || "",
      iban: cleanString(item.iban) || "",
      branchCode: cleanString(item.branchCode) || "",
      swiftCode: cleanString(item.swiftCode) || "",
      beneficiaryAddress: cleanString(item.beneficiaryAddress) || "",
      instructions: cleanString(item.instructions) || "",
      active: item.active !== false,
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

  if (payload.homeHeroImages !== undefined) {
    update.homeHeroImages = Array.isArray(payload.homeHeroImages)
      ? payload.homeHeroImages.map((item) => cleanString(item)).filter(Boolean)
      : [];
  }

  if (isObject(payload.pageHeroImages)) {
    update.pageHeroImages = {};
    for (const key of ["tours", "about", "blog", "contact"]) {
      if (payload.pageHeroImages[key] !== undefined) {
        update.pageHeroImages[key] = cleanString(payload.pageHeroImages[key]);
      }
    }
  }

  if (isObject(payload.heroColors)) {
    update.heroColors = {};
    for (const key of ["overlay", "start", "middle", "end", "homeStart", "homeEnd"]) {
      if (payload.heroColors[key] !== undefined) {
        update.heroColors[key] = cleanString(payload.heroColors[key]);
      }
    }
  }

  if (isObject(payload.navbarColors)) {
    update.navbarColors = {};
    for (const key of ["main", "scrolled", "mobile"]) {
      if (payload.navbarColors[key] !== undefined) {
        update.navbarColors[key] = cleanString(payload.navbarColors[key]);
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
    if (payload.paymentConfig.methods !== undefined) {
      update.paymentConfig.methods = sanitizePaymentMethods(payload.paymentConfig.methods);
    }
    if (payload.paymentConfig.accounts !== undefined) {
      update.paymentConfig.accounts = sanitizeReceivingAccounts(payload.paymentConfig.accounts);
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

router.use(requireAuth, requireRole("Admin"));

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
    const pageHeroUrls = updates.pageHeroImages
      ? Object.values(updates.pageHeroImages).filter(Boolean)
      : [];

    if (
      !isSafeUrl(updates.logoUrl) ||
      !isSafeUrl(updates.faviconUrl) ||
      (updates.homeHeroImages !== undefined && !isSafeUrlList(updates.homeHeroImages)) ||
      !pageHeroUrls.every((item) => isSafeUrl(item))
    ) {
      return res.status(400).json({
        message: "Invalid image URL found in settings. Use http(s) URLs, /local paths, or base64 image data URLs.",
      });
    }

    const settings = await getOrCreateSettings();
    settings.set(updates);
    await settings.save();
    res.json({ item: settings });
  }),
);

export default router;
