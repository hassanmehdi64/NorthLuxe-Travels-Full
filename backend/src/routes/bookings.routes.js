import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { Tour } from "../models/Tour.js";
import { generateBookingCode } from "../utils/bookingCode.js";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "../utils/email.js";
import { calculateBookingQuote } from "../utils/pricing.js";

const router = express.Router();
const SETTINGS_KEY = "default";

const parseCustomRequestSummary = (value = "") =>
  String(value || "")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const index = line.indexOf(":");
      if (index === -1) return acc;
      const key = line.slice(0, index).trim();
      const fieldValue = line.slice(index + 1).trim();
      if (key) acc[key] = fieldValue;
      return acc;
    }, {});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitDestinations = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.toLowerCase() !== "flexible");

const normalizeCustomRequest = (source = {}, fallbackTourTitle = "") => {
  const explicit = source.customRequest || {};
  const legacy = parseCustomRequestSummary(source.customRequirements);
  const preferredDestinations = Array.isArray(explicit.preferredDestinations) && explicit.preferredDestinations.length
    ? explicit.preferredDestinations.filter(Boolean)
    : splitDestinations(legacy["Preferred Destinations"]);

  return {
    preferredDestinations,
    sourceTourTitle: explicit.sourceTourTitle || legacy["Source Tour"] || fallbackTourTitle || "",
    startDate: explicit.startDate || legacy["Start Date"] || "",
    endDate: explicit.endDate || legacy["End Date"] || "",
    persons: toNumber(explicit.persons, toNumber(legacy["Persons"], toNumber(source.groupSize, 0))),
    childrenBelowThree: toNumber(explicit.childrenBelowThree, toNumber(legacy["Children below 3 years"], toNumber(source.children, 0))),
    budget: explicit.budget || legacy["Budget"] || "",
    budgetMode: explicit.budgetMode || legacy["Budget Mode"] || "",
    hotelPreference: explicit.hotelPreference || legacy["Hotel Preference"] || source.facilities?.hotelType || "",
    vehiclePreference: explicit.vehiclePreference || legacy["Vehicle Preference"] || source.facilities?.vehicleType || "",
    requirements: explicit.requirements || legacy["Requirements"] || source.specialRequirements || "",
  };
};

const getSettings = async () => {
  let settings = await SiteSetting.findOne({ key: SETTINGS_KEY });
  if (!settings) settings = await SiteSetting.create({ key: SETTINGS_KEY });
  return settings;
};

const toBookingResponse = (booking) => ({
  id: booking._id,
  bookingCode: booking.bookingCode,
  customer: booking.customerName,
  email: booking.email,
  phone: booking.phone,
  tour: booking.tour?.title || (booking.bookingType === "custom" ? "Custom Booking Request" : ""),
  tourId: booking.tour?._id || booking.tour || null,
  tourDetails: booking.tour
    ? {
        id: booking.tour?._id || booking.tour,
        title: booking.tour?.title || "",
        location: booking.tour?.location || "",
        durationDays: booking.tour?.durationDays || 0,
        durationLabel: booking.tour?.durationLabel || "",
        price: booking.tour?.price || 0,
        currency: "PKR",
        shortDescription: booking.tour?.shortDescription || "",
        description: booking.tour?.description || "",
        itinerary: Array.isArray(booking.tour?.itinerary) ? booking.tour.itinerary : [],
        availableOptions: booking.tour?.availableOptions || {},
      }
    : null,
  designedTour: booking.designedTour
    ? {
        id: booking.designedTour?._id || booking.designedTour,
        title: booking.designedTour?.title || "",
        slug: booking.designedTour?.slug || "",
        status: booking.designedTour?.status || "",
      }
    : null,
  date: booking.travelDate ? booking.travelDate.toISOString() : "",
  travelTime: booking.travelTime || "",
  endDate: booking.endDate ? booking.endDate.toISOString() : "",
  createdAt: booking.createdAt,
  status: booking.status,
  payment: booking.paymentStatus,
  amount: booking.totalAmount,
  advanceAmount: booking.advanceAmount,
  paidAmount: booking.paidAmount,
  remainingAmount: booking.remainingAmount,
  currency: booking.currency,
  adults: booking.adults,
  adultDetails: booking.adultDetails || [],
  children: booking.children,
  childrenAgeGroups: booking.childrenAgeGroups || [],
  groupSize: booking.groupSize,
  flexibleDates: booking.flexibleDates,
  paymentMethod: booking.paymentMethod,
  paymentIntentId: booking.paymentIntentId,
  paymentVerified: Boolean(booking.paymentVerified),
  transactionReference: booking.transactionReference,
  manualPayment: {
    senderName: booking.manualPayment?.senderName || "",
    senderNumber: booking.manualPayment?.senderNumber || "",
    sentAmount: booking.manualPayment?.sentAmount || 0,
    sentAt: booking.manualPayment?.sentAt ? booking.manualPayment.sentAt.toISOString() : "",
    slip: booking.manualPayment?.slip || "",
    slipName: booking.manualPayment?.slipName || "",
  },
  paymentHistory: booking.paymentHistory || [],
  pricingBreakdown: booking.pricingBreakdown || {},
  bookingType: booking.bookingType || "standard",
  identity: booking.identity || {},
  facilities: booking.facilities || {},
  customRequest: normalizeCustomRequest(booking, booking.tour?.title || ""),
  customItinerary: booking.customItinerary || {},
  customRequirements: booking.customRequirements || "",
  specialRequirements: booking.specialRequirements,
  notes: booking.notes,
  isCustomTour: booking.isCustomTour,
  adminNote: booking.adminNote,
  source: booking.source,
});

router.post(
  "/quote/public",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    if (!payload.tourId) {
      return res.status(400).json({ message: "tourId is required to calculate quote." });
    }
    const [tour, settings] = await Promise.all([
      Tour.findById(payload.tourId),
      getSettings(),
    ]);
    if (!tour || tour.status !== "published") {
      return res.status(404).json({ message: "Tour not found" });
    }

    const quote = calculateBookingQuote({
      tour,
      settings,
      payload,
      enforceAllowedOptions: true,
    });

    res.json({
      quote,
      currency: "PKR",
      paymentConfig: settings.paymentConfig || {},
    });
  }),
);

router.post(
  "/public",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const bookingType = payload.bookingType === "custom" || payload.isCustomTour ? "custom" : "standard";
    const settings = await getSettings();
    const safeTourId = typeof payload.tourId === "string" ? payload.tourId.trim() : payload.tourId;
    const tour = safeTourId ? await Tour.findById(safeTourId) : null;

    if (bookingType === "standard" && !tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    if (!payload.customerName?.trim() || !payload.email?.trim()) {
      return res.status(400).json({ message: "Customer name and email are required" });
    }

    let bookingCode = generateBookingCode();
    while (await Booking.exists({ bookingCode })) {
      bookingCode = generateBookingCode();
    }

    const quote = bookingType === "custom"
      ? {
          adults: Math.max(1, Number(payload.adults || payload.groupSize || 1)),
          children: Math.max(0, Number(payload.children || 0)),
          guests:
            Math.max(1, Number(payload.adults || payload.groupSize || 1)) +
            Math.max(0, Number(payload.children || 0)),
          totalAmount: Number(payload.totalAmount || 0),
          advanceAmount: Number(payload.advanceAmount || 0),
          days: 1,
          selections: payload.facilities || {},
          breakdown: {},
        }
      : calculateBookingQuote({
          tour,
          settings,
          payload,
          enforceAllowedOptions: true,
        });

    const adults = quote.adults;
    const children = quote.children;
    const groupSize = quote.guests;
    const totalAmount = quote.totalAmount;
    const adultDetails =
      Array.isArray(payload.adultDetails) && payload.adultDetails.length
        ? payload.adultDetails
        : [
            {
              fullName: payload.adultFullName || payload.customerName || "",
              age: Number(payload.adultAge || 0) || null,
              photo: payload.adultPhoto || "",
            },
          ];
    const childrenAgeGroups = Array.isArray(payload.childrenAgeGroups) && payload.childrenAgeGroups.length
      ? payload.childrenAgeGroups
      : [
          {
            range: payload.childrenAgeRange || "",
            count: children,
          },
        ];
    const advanceAmount = quote.advanceAmount;
    const paymentVerified = Boolean(payload.paymentVerified);
    const paidAmount = paymentVerified ? advanceAmount : 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const paymentMethod = payload.paymentMethod || "pay_on_arrival";
    const manualPayment = ["visa_card", "pay_on_arrival"].includes(paymentMethod)
      ? {
          senderName: "",
          senderNumber: "",
          sentAmount: 0,
          sentAt: null,
          slip: "",
          slipName: "",
        }
      : {
          senderName: payload.manualPayment?.senderName || "",
          senderNumber: payload.manualPayment?.senderNumber || "",
          sentAmount: Number(payload.manualPayment?.sentAmount || 0),
          sentAt: payload.manualPayment?.sentAt || null,
          slip: payload.manualPayment?.slip || "",
          slipName: payload.manualPayment?.slipName || "",
        };
    const hasManualReference = Boolean(payload.transactionReference?.trim());
    const paymentStatus = paymentVerified
      ? paidAmount >= totalAmount
        ? "Paid"
        : "Partially Paid"
      : paymentMethod === "pay_on_arrival"
        ? "Pending"
        : hasManualReference
          ? "Verification Pending"
          : "Pending";

    const customRequest = bookingType === "custom"
      ? normalizeCustomRequest({
          ...payload,
          customRequest: payload.customRequest || {},
          customRequirements: payload.customRequirements || "",
          groupSize,
          children,
          facilities: quote.selections,
          specialRequirements: payload.specialRequirements || "",
        }, tour?.title || "")
      : {};

    const booking = await Booking.create({
      bookingCode,
      tour: tour?._id || null,
      customerName: payload.customerName,
      email: payload.email,
      phone: payload.phone || "",
      adults,
      children,
      groupSize,
      travelDate: payload.travelDate || null,
      travelTime: payload.travelTime || "",
      endDate: payload.endDate || null,
      flexibleDates: Boolean(payload.flexibleDates),
      totalAmount,
      advanceAmount,
      paidAmount,
      remainingAmount,
      currency: "PKR",
      paymentMethod,
      paymentIntentId: payload.paymentIntentId || "",
      paymentVerified,
      transactionReference: payload.transactionReference || "",
      manualPayment,
      paymentHistory:
        paymentVerified && advanceAmount > 0
          ? [
              {
                amount: advanceAmount,
                method: paymentMethod,
                status: "confirmed",
                reference: payload.transactionReference || payload.paymentIntentId || "",
                paidAt: new Date(),
              },
            ]
          : [],
      pricingBreakdown: {
        days: quote.days,
        guests: quote.guests,
        ...quote.breakdown,
      },
      adultDetails,
      childrenAgeGroups,
      identity: payload.identity || {},
      facilities: quote.selections,
      customRequest,
      customRequirements: payload.customRequirements || "",
      specialRequirements: payload.specialRequirements || "",
      notes: payload.notes || "",
      bookingType,
      isCustomTour: bookingType === "custom",
      source: payload.source || "website",
      status: paymentVerified ? "confirmed" : "pending",
      paymentStatus,
    });

    await Notification.create({
      type: "Bookings",
      title: "New Booking Alert",
      message: `${booking.customerName} requested ${tour?.title || "a custom booking"} (${booking.status}).`,
    });

    await sendBookingConfirmationEmail({
      to: booking.email,
      customerName: booking.customerName,
      bookingCode,
      tourTitle: tour?.title || "Custom Booking Request",
      travelDate:
        booking.travelDate
          ? `${booking.travelDate.toDateString()} ${booking.travelTime || ""}`.trim()
          : "Flexible",
      guests: booking.groupSize,
      addOns: booking.facilities?.addOns || [],
      totalAmount,
      advanceAmount: booking.advanceAmount,
      remainingAmount: booking.remainingAmount,
      currency: booking.currency,
    });

    if (paymentVerified && advanceAmount > 0) {
      await sendPaymentConfirmationEmail({
        to: booking.email,
        customerName: booking.customerName,
        bookingCode,
        amountPaid: advanceAmount,
        paymentMethod,
        transactionReference: booking.transactionReference || payload.paymentIntentId || "N/A",
        remainingBalance: booking.remainingAmount,
        bookingStatus: booking.status,
        currency: booking.currency,
      });
    }

    const populated = await booking.populate(["tour", "designedTour"]);
    res.status(201).json({ item: toBookingResponse(populated) });
  }),
);
router.use(requireAuth, requireRole("Admin"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, q } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (q) {
      query.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { bookingCode: { $regex: q, $options: "i" } },
      ];
    }
    const items = await Booking.find(query).populate(["tour", "designedTour"]).sort({ createdAt: -1 });
    res.json({ items: items.map(toBookingResponse) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Booking.findById(req.params.id).populate(["tour", "designedTour"]);
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json({ item: toBookingResponse(item) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    const current = await Booking.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Booking not found" });

    if (payload.customItinerary) {
      payload.customItinerary = {
        ...current.customItinerary?.toObject?.(),
        ...payload.customItinerary,
        planDays: Array.isArray(payload.customItinerary.planDays)
          ? payload.customItinerary.planDays
              .map((item) => ({
                title: String(item?.title || "").trim(),
                plan: String(item?.plan || "").trim(),
              }))
              .filter((item) => item.title || item.plan)
          : current.customItinerary?.planDays || [],
        title: String(payload.customItinerary.title || current.customItinerary?.title || "").trim(),
        route: String(payload.customItinerary.route || current.customItinerary?.route || "").trim(),
        durationLabel: String(payload.customItinerary.durationLabel || current.customItinerary?.durationLabel || "").trim(),
        finalBudget: Number(payload.customItinerary.finalBudget ?? current.customItinerary?.finalBudget ?? 0),
        currency: "PKR",
        hotelPlan: String(payload.customItinerary.hotelPlan || current.customItinerary?.hotelPlan || "").trim(),
        vehiclePlan: String(payload.customItinerary.vehiclePlan || current.customItinerary?.vehiclePlan || "").trim(),
        planDetails: String(payload.customItinerary.planDetails || current.customItinerary?.planDetails || "").trim(),
        status: String(payload.customItinerary.status || current.customItinerary?.status || "draft").trim() || "draft",
        savedAt: payload.customItinerary.savedAt || current.customItinerary?.savedAt || new Date(),
      };
    }

    if (payload.paymentVerified === true && payload.paidAmount === undefined) {
      payload.paidAmount = Number(current.paidAmount || 0) || Number(current.advanceAmount || 0);
    }

    if (payload.paidAmount !== undefined || payload.totalAmount !== undefined) {
      const totalAmount = Number(payload.totalAmount ?? current.totalAmount);
      const paidAmount = Number(payload.paidAmount ?? current.paidAmount);
      payload.remainingAmount = Math.max(0, totalAmount - paidAmount);
      if (paidAmount >= totalAmount) payload.paymentStatus = "Paid";
      else if (paidAmount > 0) payload.paymentStatus = "Partially Paid";
      else payload.paymentStatus = payload.paymentStatus || "Pending";
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate(["tour", "designedTour"]);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (payload.status || payload.paymentStatus || payload.customItinerary) {
      await Notification.create({
        type: "Bookings",
        title: payload.customItinerary ? "Custom Itinerary Updated" : "Booking Updated",
        message: payload.customItinerary ? `${booking.bookingCode} itinerary saved.` : `${booking.bookingCode} updated.`,
      });
    }

    res.json({ item: toBookingResponse(booking) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.status(204).send();
  }),
);

export default router;












