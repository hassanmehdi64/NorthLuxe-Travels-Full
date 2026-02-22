import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { Tour } from "../models/Tour.js";
import { generateBookingCode } from "../utils/bookingCode.js";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "../utils/email.js";
import { calculateBookingQuote } from "../utils/pricing.js";

const router = express.Router();
const SETTINGS_KEY = "default";

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
  tour: booking.tour?.title || "",
  tourId: booking.tour?._id || booking.tour || null,
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
  paymentHistory: booking.paymentHistory || [],
  pricingBreakdown: booking.pricingBreakdown || {},
  bookingType: booking.bookingType || "standard",
  identity: booking.identity || {},
  facilities: booking.facilities || {},
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
      currency: tour.currency || settings.currency || "USD",
      paymentConfig: settings.paymentConfig || {},
    });
  }),
);

router.post(
  "/public",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const [tour, settings] = await Promise.all([
      Tour.findById(payload.tourId),
      getSettings(),
    ]);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    if (!payload.customerName?.trim() || !payload.email?.trim()) {
      return res.status(400).json({ message: "Customer name and email are required" });
    }

    let bookingCode = generateBookingCode();
    while (await Booking.exists({ bookingCode })) {
      bookingCode = generateBookingCode();
    }

    const quote = calculateBookingQuote({
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
    const paymentMethod = payload.paymentMethod || "visa_card";
    const requireVerifiedCard = Boolean(settings.paymentConfig?.requireVerifiedPaymentForCard);

    if (paymentMethod === "visa_card" && requireVerifiedCard && !paymentVerified) {
      return res.status(400).json({
        message: "Card payment must be verified before confirming booking.",
      });
    }

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
    const bookingType = payload.bookingType === "custom" || payload.isCustomTour ? "custom" : "standard";

    const booking = await Booking.create({
      bookingCode,
      tour: tour._id,
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
      currency: payload.currency || tour.currency || "USD",
      paymentMethod,
      paymentIntentId: payload.paymentIntentId || "",
      paymentVerified,
      transactionReference: payload.transactionReference || "",
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
      customRequirements: payload.customRequirements || "",
      specialRequirements: payload.specialRequirements || "",
      notes: payload.notes || "",
      bookingType,
      isCustomTour: bookingType === "custom",
      source: "website",
      status: paymentVerified ? "confirmed" : "pending",
      paymentStatus,
    });

    await Notification.create({
      type: "Bookings",
      title: "New Booking Alert",
      message: `${booking.customerName} requested ${tour.title} (${booking.status}).`,
    });

    await sendBookingConfirmationEmail({
      to: booking.email,
      customerName: booking.customerName,
      bookingCode,
      tourTitle: tour.title,
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

    const populated = await booking.populate("tour");
    res.status(201).json({ item: toBookingResponse(populated) });
  }),
);

router.use(requireAuth);

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
    const items = await Booking.find(query).populate("tour").sort({ createdAt: -1 });
    res.json({ items: items.map(toBookingResponse) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Booking.findById(req.params.id).populate("tour");
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
    }).populate("tour");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (payload.status || payload.paymentStatus) {
      await Notification.create({
        type: "Bookings",
        title: "Booking Updated",
        message: `${booking.bookingCode} updated.`,
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
