import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { getStripe } from "./stripeClient.js";

/**
 * Single source of truth for recording money received on a booking.
 * Payment status is derived ONLY from recorded, verified payments — never from
 * anything the client sends.
 */

export const PAYMENT_METHODS = ["visa_card", "bank_transfer", "jazzcash", "easypaisa", "cash", "pay_on_arrival", "other"];

export const normalizePaymentMethod = (value = "visa_card") => {
  const method = value === "card_request" ? "visa_card" : String(value || "").trim();
  return PAYMENT_METHODS.includes(method) ? method : "other";
};

/** Amount the customer is expected to pay online now (advance, or the full total for full plans). */
export const getExpectedOnlineCharge = (booking) =>
  Math.max(0, Math.round(Number(booking?.advanceAmount || 0)));

export const derivePaymentStatus = (paidAmount, totalAmount) => {
  const paid = Number(paidAmount || 0);
  const total = Number(totalAmount || 0);
  if (paid <= 0) return "Pending";
  if (total > 0 && paid >= total) return "Paid";
  return "Partially Paid";
};

/** Smallest currency unit used by Stripe for our currencies (PKR, USD… all 2-decimal). */
export const toMinorUnits = (amount) => Math.round(Number(amount || 0) * 100);

/**
 * Record a confirmed payment on a booking (idempotent per reference).
 * `recordedBy` is the staff user for manual entries; omit for provider callbacks.
 */
export const recordPayment = async ({
  booking,
  amount,
  method,
  reference = "",
  provider,
  recordedBy = null,
  note = "",
  paidAt = new Date(),
  sendEmail = true,
}) => {
  const normalizedAmount = Math.round(Number(amount || 0) * 100) / 100;
  if (!booking || !(normalizedAmount > 0)) {
    throw Object.assign(new Error("Payment amount must be greater than zero."), { status: 400 });
  }

  const cleanReference = String(reference || "").trim();
  const alreadyRecorded =
    cleanReference &&
    booking.paymentHistory.some((item) => item.reference === cleanReference && item.status === "confirmed");
  if (alreadyRecorded) return { booking, duplicate: true };

  const normalizedMethod = normalizePaymentMethod(method || booking.paymentMethod);
  booking.paymentHistory.push({
    amount: normalizedAmount,
    method: normalizedMethod,
    status: "confirmed",
    reference: cleanReference,
    provider,
    note: String(note || "").slice(0, 500),
    recordedBy: recordedBy?._id || null,
    recordedByName: recordedBy?.name || "",
    paidAt,
    recordedAt: new Date(),
  });

  booking.paidAmount = booking.paymentHistory
    .filter((item) => item.status === "confirmed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  booking.remainingAmount = Math.max(0, Number(booking.totalAmount || 0) - booking.paidAmount);
  booking.paymentStatus = derivePaymentStatus(booking.paidAmount, booking.totalAmount);
  booking.paymentVerified = booking.paidAmount > 0;
  booking.transactionReference = cleanReference || booking.transactionReference;
  if (booking.status === "pending") booking.status = "confirmed";

  await booking.save();

  await Notification.create({
    type: "Bookings",
    title: "Payment Recorded",
    message: `${booking.bookingCode}: ${booking.currency} ${normalizedAmount} via ${provider}${
      recordedBy?.name ? ` (recorded by ${recordedBy.name})` : ""
    }.`,
  });

  if (sendEmail) {
    const { sendPaymentConfirmationEmail } = await import("./email.js");
    await sendPaymentConfirmationEmail({
      to: booking.email,
      customerName: booking.customerName,
      bookingCode: booking.bookingCode,
      amountPaid: normalizedAmount,
      paymentMethod: normalizedMethod,
      transactionReference: cleanReference || "N/A",
      remainingBalance: booking.remainingAmount,
      bookingStatus: booking.status,
      currency: booking.currency,
    });
  }

  return { booking, duplicate: false };
};

/**
 * Verify a Stripe PaymentIntent server-side before treating a booking as paid.
 * Returns { ok: true, intent } or { ok: false, reason }.
 */
export const verifyStripeIntentForBooking = async ({ paymentIntentId, booking }) => {
  const stripe = getStripe();
  if (!stripe) return { ok: false, reason: "Card payments are not configured on the server." };
  const id = String(paymentIntentId || "").trim();
  if (!/^pi_[A-Za-z0-9_]+$/.test(id)) return { ok: false, reason: "Invalid payment reference." };

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(id);
  } catch {
    return { ok: false, reason: "Payment could not be found with the card processor." };
  }

  if (intent.status !== "succeeded") return { ok: false, reason: "Card payment has not succeeded." };

  const expected = toMinorUnits(getExpectedOnlineCharge(booking));
  const received = Number(intent.amount_received ?? intent.amount ?? 0);
  if (expected <= 0 || received !== expected) {
    return { ok: false, reason: "Paid amount does not match the booking amount." };
  }
  if (String(intent.currency || "").toLowerCase() !== String(booking.currency || "PKR").toLowerCase()) {
    return { ok: false, reason: "Payment currency does not match the booking." };
  }

  const reused = await Booking.exists({
    _id: { $ne: booking._id },
    $or: [{ paymentIntentId: intent.id }, { "paymentHistory.reference": intent.id }],
  });
  if (reused) return { ok: false, reason: "This payment is already attached to another booking." };

  return { ok: true, intent };
};
