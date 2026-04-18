import express from "express";
import Stripe from "stripe";
import crypto from "crypto";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { sendPaymentConfirmationEmail } from "../utils/email.js";

const router = express.Router();
export const paymentsWebhookRouter = express.Router();

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;
const isJazzCashConfigured = Boolean(
  env.jazzCashMerchantId && env.jazzCashPassword && env.jazzCashIntegritySalt,
);

const normalizePaymentMethod = (value = "visa_card") =>
  value === "card_request" ? "visa_card" : value;

const toStripeAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * 100));

const isAllowedClientUrl = (value) => {
  try {
    const parsed = new URL(String(value || ""));
    return env.clientOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
};

const getBookingSummary = (booking) => ({
  id: booking._id.toString(),
  bookingCode: booking.bookingCode,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  paymentVerified: Boolean(booking.paymentVerified),
  paidAmount: Number(booking.paidAmount || 0),
  remainingAmount: Number(booking.remainingAmount || 0),
  advanceAmount: Number(booking.advanceAmount || 0),
  totalAmount: Number(booking.totalAmount || 0),
  currency: booking.currency,
});

const getJazzCashTimestamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

const sanitizeJazzCashDescription = (value) =>
  String(value || "North Luxe booking payment")
    .replace(/[<>*=%/:|'"{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200) || "North Luxe booking payment";

const formatJazzCashAmount = (amount) => String(Math.max(1, Math.round(Number(amount || 0) * 100)));

const normalizeJazzCashPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `0${digits}`;
  return digits.slice(-11);
};

const generateJazzCashTxnRefNo = () => {
  const stamp = getJazzCashTimestamp(new Date());
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `T${stamp}${suffix}`.slice(0, 20);
};

const buildJazzCashSecureHash = (fields, integritySalt) => {
  const includedKeys = Object.keys(fields)
    .filter((key) => key.startsWith("pp_") && key !== "pp_SecureHash" && String(fields[key] ?? "").trim() !== "")
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  const hashString = [integritySalt, ...includedKeys.map((key) => String(fields[key]).trim())].join("&");

  return crypto
    .createHmac("sha256", Buffer.from(integritySalt, "utf8"))
    .update(Buffer.from(hashString, "utf8"))
    .digest("hex")
    .toUpperCase();
};

const verifyJazzCashSecureHash = (fields, integritySalt) => {
  const receivedHash = String(fields.pp_SecureHash || "").trim().toUpperCase();
  if (!receivedHash || !integritySalt) {
    return false;
  }
  return buildJazzCashSecureHash(fields, integritySalt) === receivedHash;
};

const renderJazzCashReturnPage = ({ success, heading, message, bookingCode, reference }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${success ? "Payment Successful" : "Payment Status"}</title>
    <style>
      body { font-family: Arial, sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:24px; }
      .card { max-width:640px; margin:40px auto; background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:28px; box-shadow:0 10px 30px rgba(15,23,42,.08); }
      h1 { margin:0 0 12px; font-size:28px; }
      p { margin:0 0 12px; line-height:1.6; }
      .meta { margin-top:18px; padding:14px 16px; border-radius:14px; background:#f8fafc; border:1px solid #e2e8f0; }
      a { display:inline-block; margin-top:18px; text-decoration:none; background:#0f172a; color:#fff; padding:12px 18px; border-radius:12px; font-weight:700; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${heading}</h1>
      <p>${message}</p>
      ${bookingCode || reference ? `<div class="meta">
        ${bookingCode ? `<p><strong>Booking:</strong> ${bookingCode}</p>` : ""}
        ${reference ? `<p><strong>Reference:</strong> ${reference}</p>` : ""}
      </div>` : ""}
      <a href="${env.clientOrigin}/tours">Back to Tours</a>
    </div>
  </body>
</html>`;

const recordConfirmedPayment = async ({
  booking,
  amount,
  paymentMethod,
  paymentIntentId,
  transactionReference,
  provider = "stripe",
}) => {
  const normalizedAmount = Number(amount || 0);
  if (!booking || normalizedAmount <= 0) return booking;

  const normalizedMethod = normalizePaymentMethod(paymentMethod || booking.paymentMethod || "visa_card");
  const reference = String(transactionReference || paymentIntentId || "").trim();
  const alreadyRecorded = reference
    ? booking.paymentHistory.some((item) => item.reference === reference && item.status === "confirmed")
    : false;

  if (alreadyRecorded && booking.paymentVerified) {
    return booking;
  }

  booking.paidAmount = Number(booking.paidAmount || 0) + normalizedAmount;
  booking.remainingAmount = Math.max(0, Number(booking.totalAmount || 0) - booking.paidAmount);
  booking.advanceAmount = Number(booking.advanceAmount || 0) || normalizedAmount;
  booking.paymentMethod = normalizedMethod;
  booking.paymentIntentId = paymentIntentId || booking.paymentIntentId;
  booking.transactionReference = reference || booking.transactionReference;
  booking.paymentVerified = true;
  booking.paymentStatus =
    booking.paidAmount >= Number(booking.totalAmount || 0)
      ? "Paid"
      : booking.paidAmount > 0
        ? "Partially Paid"
        : "Pending";

  if (booking.status === "pending") {
    booking.status = "confirmed";
  }

  if (!alreadyRecorded) {
    booking.paymentHistory.push({
      amount: normalizedAmount,
      method: normalizedMethod,
      status: "confirmed",
      reference,
      paidAt: new Date(),
    });
  }

  await booking.save();

  await Notification.create({
    type: "Bookings",
    title: "Payment Confirmed",
    message: `${booking.bookingCode} paid ${booking.currency} ${normalizedAmount} via ${provider}.`,
  });

  await sendPaymentConfirmationEmail({
    to: booking.email,
    customerName: booking.customerName,
    bookingCode: booking.bookingCode,
    amountPaid: normalizedAmount,
    paymentMethod: normalizedMethod,
    transactionReference: reference || "N/A",
    remainingBalance: booking.remainingAmount,
    bookingStatus: booking.status,
    currency: booking.currency,
  });

  return booking;
};

const fetchCheckoutSession = async (sessionId) => {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
};

const finalizeCheckoutSession = async (session) => {
  const bookingId = session.metadata?.bookingId || session.client_reference_id;
  if (!bookingId) return null;

  const booking = await Booking.findById(bookingId).populate("tour");
  if (!booking) return null;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || "";

  if (session.payment_status === "paid") {
    return recordConfirmedPayment({
      booking,
      amount: Number(session.amount_total || 0) / 100,
      paymentMethod: booking.paymentMethod || "visa_card",
      paymentIntentId,
      transactionReference: paymentIntentId || session.id,
      provider: "stripe_checkout",
    });
  }

  return booking;
};

paymentsWebhookRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!stripe || !env.stripeWebhookSecret) {
      return res.status(400).json({ message: "Stripe webhook is not configured." });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature." });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
    } catch (error) {
      return res.status(400).json({ message: `Webhook signature verification failed: ${error.message}` });
    }

    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await finalizeCheckoutSession(event.data.object);
    }

    res.json({ received: true });
  }),
);

router.post(
  "/jazzcash/session",
  asyncHandler(async (req, res) => {
    if (!isJazzCashConfigured) {
      return res.status(400).json({ message: "JazzCash is not configured on the server." });
    }

    const { bookingId } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required." });
    }

    const booking = await Booking.findById(bookingId).populate("tour");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const chargeAmount = Number(booking.advanceAmount || booking.totalAmount || 0);
    if (chargeAmount <= 0) {
      return res.status(400).json({ message: "Booking amount must be greater than zero." });
    }

    const txnDateTime = getJazzCashTimestamp(new Date());
    const txnExpiryDateTime = getJazzCashTimestamp(addMinutes(new Date(), 30));
    const txnRefNo = generateJazzCashTxnRefNo();
    const returnUrl = env.jazzCashReturnUrl || `${req.protocol}://${req.get("host")}/api/payments/jazzcash/return`;

    const fields = {
      pp_Version: "2.0",
      pp_TxnType: "PAY",
      pp_Language: "EN",
      pp_IsRegisteredCustomer: "No",
      pp_MerchantID: env.jazzCashMerchantId,
      pp_SubMerchantID: "",
      pp_Password: env.jazzCashPassword,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: formatJazzCashAmount(chargeAmount),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: String(booking.bookingCode || booking._id).slice(0, 20),
      pp_Description: sanitizeJazzCashDescription(`${booking.tour?.title || "North Luxe booking"} ${chargeAmount >= Number(booking.totalAmount || 0) ? "full" : "advance"} payment`),
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: returnUrl,
      pp_CustomerID: booking._id.toString(),
      pp_CustomerEmail: booking.email || "",
      pp_CustomerMobile: normalizeJazzCashPhone(booking.phone),
      ppmpf_1: booking._id.toString(),
      ppmpf_2: booking.bookingCode || "",
      ppmpf_3: booking.customerName || "",
    };

    fields.pp_SecureHash = buildJazzCashSecureHash(fields, env.jazzCashIntegritySalt);

    booking.paymentIntentId = txnRefNo;
    booking.transactionReference = txnRefNo;
    await booking.save();

    res.json({
      provider: "jazzcash",
      actionUrl: env.jazzCashRedirectUrl,
      method: "POST",
      fields,
      booking: getBookingSummary(booking),
    });
  }),
);

router.post(
  "/jazzcash/return",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const bookingId = payload.ppmpf_1 || payload.pp_CustomerID || "";
    const booking = bookingId ? await Booking.findById(bookingId).populate("tour") : null;
    const responseCode = String(payload.pp_ResponseCode || payload.responseCode || "").trim();
    const responseMessage = String(payload.pp_ResponseMessage || payload.responseMessage || "").trim();
    const secureHashValid = payload.pp_SecureHash
      ? verifyJazzCashSecureHash(payload, env.jazzCashIntegritySalt)
      : true;
    const success = responseCode === "000" && secureHashValid && booking;

    if (success) {
      await recordConfirmedPayment({
        booking,
        amount: Number(payload.pp_Amount || 0) / 100,
        paymentMethod: "visa_card",
        paymentIntentId: payload.pp_TxnRefNo || booking.paymentIntentId || "",
        transactionReference:
          payload.pp_RetreivalReferenceNo ||
          payload.pp_TxnRefNo ||
          booking.transactionReference ||
          "",
        provider: "jazzcash",
      });
    }

    const html = renderJazzCashReturnPage({
      success: Boolean(success),
      heading: success ? "Payment Completed" : "Payment Not Completed",
      message: success
        ? "Your JazzCash debit card payment was received successfully. The booking has been updated."
        : responseMessage || (!secureHashValid ? "JazzCash response could not be verified." : "JazzCash did not confirm the payment."),
      bookingCode: booking?.bookingCode || payload.ppmpf_2 || "",
      reference:
        payload.pp_RetreivalReferenceNo || payload.pp_TxnRefNo || booking?.transactionReference || "",
    });

    res.status(success ? 200 : 400).type("html").send(html);
  }),
);

router.post(
  "/checkout-session",
  asyncHandler(async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe is not configured on the server." });
    }

    const { bookingId, successUrl, cancelUrl } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required." });
    }

    if (!isAllowedClientUrl(successUrl) || !isAllowedClientUrl(cancelUrl)) {
      return res.status(400).json({ message: "Success and cancel URLs must use an allowed client origin." });
    }

    const booking = await Booking.findById(bookingId).populate("tour");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const chargeAmount = Number(booking.advanceAmount || booking.totalAmount || 0);
    if (chargeAmount <= 0) {
      return res.status(400).json({ message: "Booking amount must be greater than zero." });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: booking._id.toString(),
      customer_email: booking.email,
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      payment_method_types: ["card"],
      metadata: {
        bookingId: booking._id.toString(),
        bookingCode: booking.bookingCode,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking._id.toString(),
          bookingCode: booking.bookingCode,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: String(booking.currency || "PKR").toLowerCase(),
            unit_amount: toStripeAmount(chargeAmount),
            product_data: {
              name: booking.tour?.title || "North Luxe booking",
              description:
                chargeAmount >= Number(booking.totalAmount || 0)
                  ? `Full payment for booking ${booking.bookingCode}`
                  : `Advance payment for booking ${booking.bookingCode}`,
            },
          },
        },
      ],
    });

    booking.paymentIntentId = checkoutSession.id;
    await booking.save();

    res.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      provider: "stripe_checkout",
      amount: chargeAmount,
      currency: booking.currency,
    });
  }),
);

router.get(
  "/session/:sessionId",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await fetchCheckoutSession(sessionId);
    const booking = await finalizeCheckoutSession(session);

    res.json({
      provider: "stripe_checkout",
      sessionId: session.id,
      checkoutStatus: session.status,
      paymentStatus: session.payment_status,
      booking: booking ? getBookingSummary(booking) : null,
    });
  }),
);

router.post(
  "/intent",
  asyncHandler(async (req, res) => {
    const amount = Number(req.body.amount || 0);
    const currency = (req.body.currency || "PKR").toLowerCase();
    const method = req.body.method || "visa_card";
    const customerName = String(req.body.customerName || "").trim();
    const email = String(req.body.email || "").trim();
    const phone = String(req.body.phone || "").trim();
    const paymentPlan = String(req.body.paymentPlan || "advance_10").trim();
    const bookingType = String(req.body.bookingType || "standard").trim();
    const tourId = String(req.body.tourId || "").trim();
    const tourTitle = String(req.body.tourTitle || "North Luxe booking").trim() || "North Luxe booking";

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (method === "visa_card") {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe is not configured on the server." });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ["card"],
        receipt_email: email || undefined,
        description: `${tourTitle} ${paymentPlan === "full" ? "full payment" : "advance payment"}`,
        metadata: {
          source: "north_luxe_booking",
          customerName,
          email,
          phone,
          paymentPlan,
          bookingType,
          tourId,
          tourTitle,
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

    if (paymentMethod === "visa_card") {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe is not configured on the server." });
      }

      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const verified = intent.status === "succeeded";
      return res.json({
        verified,
        status: intent.status,
        provider: "stripe",
        transactionReference: intent.id,
      });
    }

    const verified = Boolean(transactionReference?.trim());
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

    const updatedBooking = await recordConfirmedPayment({
      booking,
      amount,
      paymentMethod,
      transactionReference,
      provider: "manual_confirmation",
    });

    res.json({
      bookingId: updatedBooking._id.toString(),
      bookingCode: updatedBooking.bookingCode,
      paidAmount: amount,
      remainingBalance: updatedBooking.remainingAmount,
      paymentStatus: updatedBooking.paymentStatus,
      paymentMethod: updatedBooking.paymentMethod,
      transactionReference: updatedBooking.transactionReference || "",
    });
  }),
);

export default router;
