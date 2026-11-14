import { after, before, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createTour, futureDate, startTestApp, TEST_JAZZCASH_SALT } from "./helpers/testApp.js";

let app;
let Booking;
let setStripeClientForTests;

before(async () => {
  app = await startTestApp();
  ({ Booking } = await import("../src/models/Booking.js"));
  ({ setStripeClientForTests } = await import("../src/utils/stripeClient.js"));
});
after(async () => app.stop());
beforeEach(() => setStripeClientForTests(null));

const publicBooking = async (tour, extra = {}) =>
  app.request("POST", "/api/bookings/public", {
    body: {
      tourId: tour._id.toString(),
      customerName: "Test Customer",
      email: "customer@test.local",
      adults: 2,
      travelDate: futureDate(),
      paymentMethod: "pay_on_arrival",
      ...extra,
    },
  });

describe("POST /api/payments/confirm (manual payment entry)", () => {
  test("rejects anonymous callers with 401 and changes nothing", async () => {
    const tour = await createTour();
    const { json } = await publicBooking(tour);
    const res = await app.request("POST", "/api/payments/confirm", {
      body: { bookingId: json.item.id, paidAmount: 999999, paymentMethod: "cash" },
    });
    assert.equal(res.status, 401);
    const booking = await Booking.findById(json.item.id);
    assert.equal(booking.paidAmount, 0);
    assert.equal(booking.paymentHistory.length, 0);
  });

  test("rejects Editors with 403", async () => {
    const tour = await createTour();
    const { json } = await publicBooking(tour);
    const { token } = await app.createUser({ role: "Editor" });
    const res = await app.request("POST", "/api/payments/confirm", {
      token,
      body: { bookingId: json.item.id, paidAmount: 100, paymentMethod: "cash" },
    });
    assert.equal(res.status, 403);
  });

  test("Admins can record a payment and the entry is audited (who, when, amount, method)", async () => {
    const tour = await createTour();
    const { json } = await publicBooking(tour);
    const { user, token } = await app.createUser({ role: "Admin", name: "Ayesha Admin" });
    const res = await app.request("POST", "/api/payments/confirm", {
      token,
      body: { bookingId: json.item.id, paidAmount: 5000, paymentMethod: "cash", transactionReference: "CASH-001", note: "Paid at office" },
    });
    assert.equal(res.status, 200);
    const booking = await Booking.findById(json.item.id);
    const entry = booking.paymentHistory.at(-1);
    assert.equal(entry.amount, 5000);
    assert.equal(entry.method, "cash");
    assert.equal(entry.provider, "manual");
    assert.equal(String(entry.recordedBy), String(user._id));
    assert.equal(entry.recordedByName, "Ayesha Admin");
    assert.ok(entry.recordedAt instanceof Date);
    assert.equal(booking.paidAmount, 5000);
    assert.equal(booking.paymentStatus, "Partially Paid");
  });

  test("refuses amounts above the outstanding balance", async () => {
    const tour = await createTour();
    const { json } = await publicBooking(tour);
    const { token } = await app.createUser({ role: "Admin" });
    const res = await app.request("POST", "/api/payments/confirm", {
      token,
      body: { bookingId: json.item.id, paidAmount: json.item.totalAmount + 1, paymentMethod: "cash" },
    });
    assert.equal(res.status, 400);
  });
});

describe("POST /api/bookings/public cannot set payment fields", () => {
  test("paymentVerified / paidAmount / status / paymentStatus / paymentHistory from the client are ignored", async () => {
    const tour = await createTour();
    const res = await publicBooking(tour, {
      paymentMethod: "bank_transfer",
      paymentVerified: true,
      paidAmount: 999999,
      status: "confirmed",
      paymentStatus: "Paid",
      paymentHistory: [{ amount: 999999, status: "confirmed" }],
      source: "admin",
    });
    assert.equal(res.status, 201);
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.paymentVerified, false);
    assert.equal(booking.paidAmount, 0);
    assert.equal(booking.status, "pending");
    assert.notEqual(booking.paymentStatus, "Paid");
    assert.notEqual(booking.paymentStatus, "Partially Paid");
    assert.equal(booking.paymentHistory.length, 0);
    assert.equal(booking.source, "website");
  });

  test("pay-on-arrival bookings are never shown as paid when nothing was received", async () => {
    const tour = await createTour();
    const res = await publicBooking(tour, { paymentMethod: "pay_on_arrival", paymentVerified: true });
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.paidAmount, 0);
    assert.equal(booking.paymentStatus, "Pending");
    assert.equal(booking.status, "pending");
  });

  test("custom requests cannot set their own price", async () => {
    const res = await app.request("POST", "/api/bookings/public", {
      body: { bookingType: "custom", customerName: "C", email: "c@test.local", totalAmount: 1, advanceAmount: 1 },
    });
    assert.equal(res.status, 201);
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.totalAmount, 0);
    assert.equal(booking.advanceAmount, 0);
  });

  test("javascript: URLs are dropped from payment slips", async () => {
    const tour = await createTour();
    const res = await publicBooking(tour, {
      paymentMethod: "bank_transfer",
      manualPayment: { slip: "javascript:alert(document.cookie)", senderName: "x" },
    });
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.manualPayment.slip, "");
  });
});

describe("Card bookings are verified with Stripe on the server", () => {
  const stubIntent = (intent) =>
    setStripeClientForTests({ paymentIntents: { retrieve: async (id) => ({ id, ...intent }) } });

  const cardBooking = (tour, paymentIntentId) => publicBooking(tour, { paymentMethod: "visa_card", paymentIntentId });

  const expectedAdvanceMinor = async (tour) => {
    const quote = await app.request("POST", "/api/bookings/quote/public", {
      body: { tourId: tour._id.toString(), adults: 2, paymentMethod: "visa_card" },
    });
    return Math.round(quote.json.quote.advanceAmount * 100);
  };

  test("an intent for the wrong (smaller) amount is not accepted as payment", async () => {
    const tour = await createTour();
    stubIntent({ status: "succeeded", amount_received: 100, currency: "pkr" });
    const res = await cardBooking(tour, "pi_wrongamount1");
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.paidAmount, 0);
    assert.equal(booking.paymentStatus, "Verification Pending");
    assert.match(res.json.paymentVerificationNote, /does not match/);
  });

  test("an intent that has not succeeded is not accepted", async () => {
    const tour = await createTour();
    stubIntent({ status: "requires_payment_method", amount_received: await expectedAdvanceMinor(tour), currency: "pkr" });
    const res = await cardBooking(tour, "pi_notsucceeded1");
    assert.equal((await Booking.findById(res.json.item.id)).paidAmount, 0);
  });

  test("a valid intent is recorded once, and cannot be reused for a second booking", async () => {
    const tour = await createTour();
    const amount = await expectedAdvanceMinor(tour);
    stubIntent({ status: "succeeded", amount_received: amount, currency: "pkr" });

    const first = await cardBooking(tour, "pi_validpayment1");
    const paid = await Booking.findById(first.json.item.id);
    assert.equal(paid.paidAmount, amount / 100);
    assert.equal(paid.paymentVerified, true);
    assert.equal(paid.paymentHistory.at(-1).provider, "stripe");

    const second = await cardBooking(tour, "pi_validpayment1");
    const reused = await Booking.findById(second.json.item.id);
    assert.equal(reused.paidAmount, 0);
    assert.match(second.json.paymentVerificationNote, /already attached/);
  });
});

describe("JazzCash return endpoint", () => {
  const sign = (fields) => {
    const keys = Object.keys(fields)
      .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash" && String(fields[k]).trim() !== "")
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
    const message = [TEST_JAZZCASH_SALT, ...keys.map((k) => String(fields[k]).trim())].join("&");
    return crypto.createHmac("sha256", TEST_JAZZCASH_SALT).update(message).digest("hex").toUpperCase();
  };

  const bookingWithJazzSession = async () => {
    const tour = await createTour();
    const { json } = await publicBooking(tour, { paymentMethod: "jazzcash" });
    const session = await app.request("POST", "/api/payments/jazzcash/session", { body: { bookingId: json.item.id } });
    assert.equal(session.status, 200);
    return { bookingId: json.item.id, fields: session.json.fields };
  };

  const callback = (fields) => ({
    pp_ResponseCode: "000",
    pp_ResponseMessage: "Approved",
    pp_TxnRefNo: fields.pp_TxnRefNo,
    pp_Amount: fields.pp_Amount,
    pp_TxnCurrency: "PKR",
    ppmpf_1: fields.ppmpf_1,
    ppmpf_2: fields.ppmpf_2,
  });

  test("unsigned success responses are rejected", async () => {
    const { bookingId, fields } = await bookingWithJazzSession();
    const res = await app.request("POST", "/api/payments/jazzcash/return", { form: callback(fields) });
    assert.equal(res.status, 400);
    assert.equal((await Booking.findById(bookingId)).paidAmount, 0);
  });

  test("a forged signature is rejected", async () => {
    const { bookingId, fields } = await bookingWithJazzSession();
    const form = { ...callback(fields), pp_SecureHash: "A".repeat(64) };
    const res = await app.request("POST", "/api/payments/jazzcash/return", { form });
    assert.equal(res.status, 400);
    assert.equal((await Booking.findById(bookingId)).paidAmount, 0);
  });

  test("a correctly signed response for the wrong amount is rejected", async () => {
    const { bookingId, fields } = await bookingWithJazzSession();
    const form = { ...callback(fields), pp_Amount: "100" };
    form.pp_SecureHash = sign(form);
    const res = await app.request("POST", "/api/payments/jazzcash/return", { form });
    assert.equal(res.status, 400);
    assert.equal((await Booking.findById(bookingId)).paidAmount, 0);
  });

  test("a correctly signed response with another transaction reference is rejected", async () => {
    const { bookingId, fields } = await bookingWithJazzSession();
    const form = { ...callback(fields), pp_TxnRefNo: "T20990101000000999" };
    form.pp_SecureHash = sign(form);
    const res = await app.request("POST", "/api/payments/jazzcash/return", { form });
    assert.equal(res.status, 400);
    assert.equal((await Booking.findById(bookingId)).paidAmount, 0);
  });

  test("a valid signed response records the payment", async () => {
    const { bookingId, fields } = await bookingWithJazzSession();
    const form = callback(fields);
    form.pp_SecureHash = sign(form);
    const res = await app.request("POST", "/api/payments/jazzcash/return", { form });
    assert.equal(res.status, 200);
    const booking = await Booking.findById(bookingId);
    assert.equal(booking.paidAmount, Number(fields.pp_Amount) / 100);
    assert.equal(booking.paymentHistory.at(-1).provider, "jazzcash");
  });

  test("the return page escapes attacker-controlled text (no reflected XSS)", async () => {
    const payload = '<script>alert("x")</script>';
    const res = await app.request("POST", "/api/payments/jazzcash/return", {
      form: { pp_ResponseCode: "999", pp_ResponseMessage: payload, ppmpf_2: payload, pp_TxnRefNo: payload },
    });
    assert.equal(res.status, 400);
    assert.ok(!res.text.includes("<script>alert"), "raw script tag must not be reflected");
  });
});
