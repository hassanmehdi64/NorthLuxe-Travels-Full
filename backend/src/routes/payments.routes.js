import express from "express";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { sendPaymentConfirmationEmail } from "../utils/email.js";

const router = express.Router();

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

router.post(
  "/intent",
  asyncHandler(async (req, res) => {
    const amount = Number(req.body.amount || 0);
    const currency = (req.body.currency || "USD").toLowerCase();
    const method = req.body.method || "visa_card";

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (method === "visa_card" && stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          source: "north_luxe_booking",
        },
      });

      return res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency: currency.toUpperCase(),
        method,
        provider: "stripe",
      });
    }

    const paymentIntentId = `pi_${Date.now()}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).slice(2, 10)}`;

    res.json({
      paymentIntentId,
      clientSecret,
      amount,
      currency: currency.toUpperCase(),
      method,
      provider: "mock",
    });
  }),
);

router.post(
  "/verify-intent",
  asyncHandler(async (req, res) => {
    const { paymentIntentId, method, transactionReference } = req.body;
    const paymentMethod = method || "visa_card";

    if (!paymentIntentId && paymentMethod === "visa_card") {
      return res.status(400).json({ message: "Payment intent id is required for card verification." });
    }

    if (paymentMethod === "visa_card" && stripe) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const verified = intent.status === "succeeded" || intent.status === "processing";
      return res.json({
        verified,
        status: intent.status,
        provider: "stripe",
        transactionReference: intent.id,
      });
    }

    const verified = paymentMethod === "visa_card" ? true : Boolean(transactionReference?.trim());
    res.json({
      verified,
      status: verified ? "verified" : "pending",
      provider: "mock",
      transactionReference: transactionReference || paymentIntentId || "",
    });
  }),
);

router.post(
  "/confirm",
  asyncHandler(async (req, res) => {
    const { bookingId, paidAmount, paymentMethod, transactionReference } = req.body;
    const booking = await Booking.findById(bookingId).populate("tour");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const amount = Number(paidAmount || 0);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Paid amount must be greater than zero" });
    }

    booking.paidAmount = Number(booking.paidAmount || 0) + amount;
    booking.remainingAmount = Math.max(0, Number(booking.totalAmount || 0) - booking.paidAmount);
    booking.advanceAmount = Number(booking.advanceAmount || 0) || amount;
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    booking.transactionReference = transactionReference || booking.transactionReference;
    booking.paymentVerified = true;
    booking.paymentStatus =
      booking.paidAmount >= booking.totalAmount
        ? "Paid"
        : booking.paidAmount > 0
          ? "Partially Paid"
          : "Pending";
    if (booking.status === "pending") {
      booking.status = "confirmed";
    }

    booking.paymentHistory.push({
      amount,
      method: booking.paymentMethod,
      status: "confirmed",
      reference: booking.transactionReference || "",
      paidAt: new Date(),
    });

    await booking.save();

    await Notification.create({
      type: "Bookings",
      title: "Payment Confirmed",
      message: `${booking.bookingCode} paid ${booking.currency} ${amount}.`,
    });

    await sendPaymentConfirmationEmail({
      to: booking.email,
      customerName: booking.customerName,
      bookingCode: booking.bookingCode,
      amountPaid: amount,
      paymentMethod: booking.paymentMethod,
      transactionReference: booking.transactionReference || "N/A",
      remainingBalance: booking.remainingAmount,
      bookingStatus: booking.status,
      currency: booking.currency,
    });

    res.json({
      bookingId: booking._id.toString(),
      bookingCode: booking.bookingCode,
      paidAmount: amount,
      remainingBalance: booking.remainingAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      transactionReference: booking.transactionReference || "",
    });
  }),
);

export default router;
