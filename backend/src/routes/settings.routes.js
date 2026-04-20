import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { getEmailConfigStatus, sendMailSafely, verifyEmailTransport } from "../utils/email.js";

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

  const navbarColors = settings.navbarColors || {};
  const missingNavbarColorDefaults = {};
  if (!navbarColors.main || navbarColors.main === "rgba(9, 20, 41, 0.88)") missingNavbarColorDefaults["navbarColors.main"] = "#1F7630";
  if (!navbarColors.scrolled || navbarColors.scrolled === "rgba(9, 20, 41, 0.94)") missingNavbarColorDefaults["navbarColors.scrolled"] = "#1F7630";
  if (!navbarColors.mobile || navbarColors.mobile === "rgba(9, 20, 41, 0.985)") missingNavbarColorDefaults["navbarColors.mobile"] = "#1F7630";
  const textColor = settings.navbarTextColor || navbarColors.text || "#ffffff";
  const mutedTextColor = settings.navbarMutedTextColor || navbarColors.mutedText || "rgba(255, 255, 255, 0.9)";
  const activeTextColor =
    settings.navbarActiveTextColor === "#13DDB4" || navbarColors.activeText === "#13DDB4"
      ? "#FF8F05"
      : settings.navbarActiveTextColor || navbarColors.activeText || "#FF8F05";
  if (!navbarColors.text) missingNavbarColorDefaults["navbarColors.text"] = textColor;
  if (!navbarColors.mutedText) missingNavbarColorDefaults["navbarColors.mutedText"] = mutedTextColor;
  if (!navbarColors.activeText || navbarColors.activeText === "#13DDB4") missingNavbarColorDefaults["navbarColors.activeText"] = activeTextColor;
  if (!settings.navbarTextColor) missingNavbarColorDefaults.navbarTextColor = textColor;
  if (!settings.navbarMutedTextColor) missingNavbarColorDefaults.navbarMutedTextColor = mutedTextColor;
  if (!settings.navbarActiveTextColor || settings.navbarActiveTextColor === "#13DDB4") missingNavbarColorDefaults.navbarActiveTextColor = activeTextColor;

  const footerColors = settings.footerColors || {};
  if (!footerColors.background || footerColors.background === "#0F172A") missingNavbarColorDefaults["footerColors.background"] = "#1F7630";
  if (!footerColors.text) missingNavbarColorDefaults["footerColors.text"] = "#ffffff";
  if (!footerColors.mutedText) missingNavbarColorDefaults["footerColors.mutedText"] = "rgba(255, 255, 255, 0.78)";
  if (!footerColors.accentText) missingNavbarColorDefaults["footerColors.accentText"] = "#13DDB4";

  if (Object.keys(missingNavbarColorDefaults).length) {
    settings = await SiteSetting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: missingNavbarColorDefaults },
      { new: true, runValidators: true },
    );
  }

  return settings;
};

const toSettingsResponse = (settings) => {
  const item = settings?.toObject ? settings.toObject() : { ...(settings || {}) };
  const navbarColors = item.navbarColors || {};
  const footerColors = item.footerColors || {};
  const navbarTextColor = item.navbarTextColor || navbarColors.text || "#ffffff";
  const navbarMutedTextColor = item.navbarMutedTextColor || navbarColors.mutedText || "rgba(255, 255, 255, 0.9)";
  const navbarActiveTextColor = item.navbarActiveTextColor || navbarColors.activeText || "#FF8F05";

  return {
    ...item,
    navbarTextColor,
    navbarMutedTextColor,
    navbarActiveTextColor,
    navbarColors: {
      ...navbarColors,
      text: navbarTextColor,
      mutedText: navbarMutedTextColor,
      activeText: navbarActiveTextColor,
    },
    footerColors: {
      background: footerColors.background || "#1F7630",
      text: footerColors.text || "#ffffff",
      mutedText: footerColors.mutedText || "rgba(255, 255, 255, 0.78)",
      accentText: footerColors.accentText || "#13DDB4",
    },
  };
};

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const cleanString = (value) => (typeof value === "string" ? value.trim() : value);
const cleanUrlString = (value) => {
  const cleaned = cleanString(value);
  if (typeof cleaned !== "string") return cleaned;
  const iframeSrc = cleaned.match(/\bsrc=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) return iframeSrc[1].trim();
  return cleaned;
};

const isSafeUrl = (value) => {
  if (!value) return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("./") || trimmed.startsWith("../")) return true;
  if (/^[\w./-]+\.(avif|gif|jpe?g|png|svg|webp)$/i.test(trimmed)) return true;
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

const collectInvalidUrlFields = (updates) => {
  const invalid = [];

  for (const field of ["logoUrl", "faviconUrl", "googleMapUrl"]) {
    if (updates[field] !== undefined && !isSafeUrl(updates[field])) invalid.push(field);
  }

  if (updates.homeHeroImages !== undefined) {
    if (!Array.isArray(updates.homeHeroImages)) {
      invalid.push("homeHeroImages");
    } else {
      updates.homeHeroImages.forEach((item, index) => {
        if (!isSafeUrl(item)) invalid.push(`homeHeroImages[${index + 1}]`);
      });
    }
  }

  if (updates.pageHeroImages) {
    for (const [key, value] of Object.entries(updates.pageHeroImages)) {
      if (!isSafeUrl(value)) invalid.push(`pageHeroImages.${key}`);
    }
  }

  return invalid;
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
    "siteTagline",
    "siteEmail",
    "supportEmail",
    "sitePhone",
    "whatsappNumber",
    "address",
    "businessHours",
    "googleMapUrl",
    "currency",
    "seoTitle",
    "seoDescription",
    "primaryColor",
    "logoUrl",
    "faviconUrl",
    "navbarTextColor",
    "navbarMutedTextColor",
    "navbarActiveTextColor",
  ];

  for (const field of stringFields) {
    if (payload[field] !== undefined) {
      update[field] = ["googleMapUrl", "logoUrl", "faviconUrl"].includes(field)
        ? cleanUrlString(payload[field])
        : cleanString(payload[field]);
    }
  }

  if (payload.maintenanceMode !== undefined) {
    update.maintenanceMode = Boolean(payload.maintenanceMode);
  }

  if (isObject(payload.socialLinks)) {
    update.socialLinks = {};
    for (const key of ["facebook", "instagram", "whatsapp", "twitter", "linkedin"]) {
      if (payload.socialLinks[key] !== undefined) {
        update.socialLinks[key] = cleanString(payload.socialLinks[key]);
      }
    }
  }

  if (payload.homeHeroImages !== undefined) {
    update.homeHeroImages = Array.isArray(payload.homeHeroImages)
      ? payload.homeHeroImages.map((item) => cleanUrlString(item)).filter(Boolean)
      : [];
  }

  if (isObject(payload.pageHeroImages)) {
    update.pageHeroImages = {};
    for (const key of ["tours", "about", "blog", "contact"]) {
      if (payload.pageHeroImages[key] !== undefined) {
        update.pageHeroImages[key] = cleanUrlString(payload.pageHeroImages[key]);
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
    for (const key of ["main", "scrolled", "mobile", "text", "mutedText", "activeText"]) {
      if (payload.navbarColors[key] !== undefined) {
        update.navbarColors[key] = cleanString(payload.navbarColors[key]);
      }
    }
  }

  if (isObject(payload.footerColors)) {
    update.footerColors = {};
    for (const key of ["background", "text", "mutedText", "accentText"]) {
      if (payload.footerColors[key] !== undefined) {
        update.footerColors[key] = cleanString(payload.footerColors[key]);
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

const flattenForMongoSet = (value, prefix = "", target = {}) => {
  for (const [key, entry] of Object.entries(value || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isObject(entry)) {
      flattenForMongoSet(entry, path, target);
    } else {
      target[path] = entry;
    }
  }
  return target;
};

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ item: toSettingsResponse(settings) });
  }),
);

router.use(requireAuth, requireRole("Admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ item: toSettingsResponse(settings) });
  }),
);

router.get(
  "/debug/navbar-colors",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    res.json({
      item: {
        navbarTextColor: settings.navbarTextColor,
        navbarMutedTextColor: settings.navbarMutedTextColor,
        navbarActiveTextColor: settings.navbarActiveTextColor,
        navbarColors: settings.navbarColors || {},
        normalized: toSettingsResponse(settings).navbarColors,
        raw: settings.toObject?.() || {},
      },
    });
  }),
);

router.get(
  "/email/status",
  asyncHandler(async (_req, res) => {
    res.json({ item: getEmailConfigStatus() });
  }),
);

router.post(
  "/email/verify",
  asyncHandler(async (_req, res) => {
    await verifyEmailTransport();
    res.json({ ok: true, message: "SMTP connection verified." });
  }),
);

router.post(
  "/email/test",
  asyncHandler(async (req, res) => {
    const to = String(req.body?.to || req.user?.email || "").trim();
    if (!to) return res.status(400).json({ message: "Test email recipient is required." });

    const sent = await sendMailSafely({
      to,
      subject: "North Luxe SMTP test",
      text: "SMTP is configured and able to send mail from the production backend.",
      html: "<p>SMTP is configured and able to send mail from the production backend.</p>",
    });

    if (!sent) {
      return res.status(502).json({
        message: "SMTP test failed. Check Vercel Function Logs for the [Email failed] entry.",
      });
    }

    res.json({ ok: true, message: `Test email sent to ${to}.` });
  }),
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const updates = buildSettingsUpdate(req.body);
    const invalidUrlFields = collectInvalidUrlFields(updates);

    if (invalidUrlFields.length) {
      return res.status(400).json({
        message: `Invalid URL in settings: ${invalidUrlFields.join(", ")}. Use http(s) URLs, /local paths, filenames like gb.jpg, or base64 image data URLs.`,
      });
    }

    const mongoSet = flattenForMongoSet(updates);
    const settings = Object.keys(mongoSet).length
      ? await SiteSetting.findOneAndUpdate(
          { key: SETTINGS_KEY },
          {
            $set: mongoSet,
            $setOnInsert: { key: SETTINGS_KEY },
          },
          {
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
            upsert: true,
          },
        )
      : await getOrCreateSettings();

    res.json({ item: toSettingsResponse(settings) });
  }),
);

export default router;
