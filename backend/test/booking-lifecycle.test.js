import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createTour, futureDate, startTestApp } from "./helpers/testApp.js";

let app;
let Booking;
let SeatLedger;
let lifecycle;
let admin;

before(async () => {
  app = await startTestApp();
  ({ Booking } = await import("../src/models/Booking.js"));
  ({ SeatLedger } = await import("../src/models/SeatLedger.js"));
  lifecycle = await import("../src/utils/bookingLifecycle.js");
  admin = await app.createUser({ role: "Admin", name: "Sana Admin" });
});
after(async () => app.stop());

const book = (tour, extra = {}) =>
  app.request("POST", "/api/bookings/public", {
    body: { tourId: tour._id.toString(), customerName: "Guest", email: "g@test.local", adults: 2, travelDate: futureDate(20), paymentMethod: "pay_on_arrival", ...extra },
  });
const held = async (tour, date = futureDate(20)) => (await SeatLedger.findOne({ tour: tour._id, date }))?.held ?? 0;
const transition = (id, action, token = admin.token) =>
  app.request("POST", `/api/bookings/${id}/transition`, { token, body: { action } });

describe("Seat holds", () => {
  test("a new booking holds its seats for 48 hours and logs history", async () => {
    const tour = await createTour({ capacity: 10 });
    const res = await book(tour);
    assert.equal(res.status, 201);
    const booking = await Booking.findById(res.json.item.id);
    assert.equal(booking.status, "pending");
    assert.equal(booking.seatState, "held");
    assert.equal(booking.seatsHeld, 2);
    const hours = (booking.holdExpiresAt - Date.now()) / 3600000;
    assert.ok(hours > 47.9 && hours <= 48, `hold ~48h, got ${hours}`);
    assert.equal(await held(tour), 2);
    assert.equal(booking.history[0].action, "created");
  });

  test("a travel date is required and can't be in the past", async () => {
    const tour = await createTour();
    assert.equal((await book(tour, { travelDate: "" })).status, 400);
    assert.equal((await book(tour, { travelDate: "2020-01-01" })).status, 400);
  });

  test("a full date is refused with a clear message", async () => {
    const tour = await createTour({ capacity: 3 });
    assert.equal((await book(tour)).status, 201);
    const second = await book(tour);
    assert.equal(second.status, 409);
    assert.match(second.json.message, /Only 1 seat left/);
  });

  test("concurrent requests can never oversell the last seats", async () => {
    const tour = await createTour({ capacity: 3 });
    const results = await Promise.all(Array.from({ length: 8 }, () => book(tour, { adults: 1 })));
    assert.equal(results.filter((r) => r.status === 201).length, 3);
    assert.equal(results.filter((r) => r.status === 409).length, 5);
    assert.equal(await held(tour), 3);
  });

  test("availability endpoint reports seats left for a date", async () => {
    const tour = await createTour({ capacity: 6 });
    await book(tour);
    const res = await app.request("GET", `/api/tours/${tour.slug}/availability?date=${futureDate(20)}`);
    assert.deepEqual({ capacity: res.json.capacity, held: res.json.held, available: res.json.available }, { capacity: 6, held: 2, available: 4 });
  });
});

describe("48-hour expiry", () => {
  test("an unpaid hold expires after 48h and its seats are released", async () => {
    const tour = await createTour({ capacity: 4 });
    const { json } = await book(tour);
    await Booking.updateOne({ _id: json.item.id }, { holdExpiresAt: new Date(Date.now() - 1000) });
    await lifecycle.expireStaleHolds();
    const booking = await Booking.findById(json.item.id);
    assert.equal(booking.status, "expired");
    assert.equal(booking.seatState, "released");
    assert.equal(await held(tour), 0);
    assert.equal(booking.history.at(-1).action, "expired");
    assert.equal(booking.history.at(-1).byName, "System");
  });

  test("running the sweep twice never releases seats twice", async () => {
    const tour = await createTour({ capacity: 4 });
    const a = await book(tour);
    await book(tour);
    await Booking.updateOne({ _id: a.json.item.id }, { holdExpiresAt: new Date(Date.now() - 1000) });
    await Promise.all([lifecycle.expireStaleHolds(), lifecycle.expireStaleHolds()]);
    assert.equal(await held(tour), 2);
  });

  test("a payment within 48h confirms the booking and keeps the seats", async () => {
    const tour = await createTour({ capacity: 4 });
    const { json } = await book(tour);
    const pay = await app.request("POST", "/api/payments/confirm", {
      token: admin.token,
      body: { bookingId: json.item.id, paidAmount: 1000, paymentMethod: "cash", transactionReference: "CASH-9" },
    });
    assert.equal(pay.status, 200);
    await Booking.updateOne({ _id: json.item.id }, { holdExpiresAt: new Date(Date.now() - 1000) });
    await lifecycle.expireStaleHolds();
    const booking = await Booking.findById(json.item.id);
    assert.equal(booking.status, "confirmed");
    assert.equal(booking.seatState, "reserved");
    assert.equal(await held(tour), 2);
    assert.ok(booking.history.some((h) => h.action === "payment" && h.byName === "Sana Admin"));
  });
});

describe("Staff transitions", () => {
  test("an admin can confirm with nothing paid; it shows 'Unpaid · pay on arrival'", async () => {
    const tour = await createTour();
    const { json } = await book(tour);
    const res = await transition(json.item.id, "confirm");
    assert.equal(res.status, 200);
    assert.equal(res.json.item.status, "confirmed");
    assert.equal(res.json.item.paymentLabel, "Unpaid · pay on arrival");
    assert.equal(res.json.item.seatState, "reserved");
    assert.equal(res.json.item.holdExpiresAt, null);
  });

  test("cancel releases seats; reopen holds them again; history records who", async () => {
    const tour = await createTour({ capacity: 5 });
    const { json } = await book(tour);
    await transition(json.item.id, "cancel");
    assert.equal(await held(tour), 0);
    const reopened = await transition(json.item.id, "reopen");
    assert.equal(reopened.json.item.status, "pending");
    assert.equal(reopened.json.item.seatState, "held");
    assert.equal(await held(tour), 2);
    const actions = reopened.json.item.history.map((h) => `${h.action}:${h.byName}`);
    assert.deepEqual(actions.slice(-2), ["cancelled:Sana Admin", "reopened:Sana Admin"]);
  });

  test("reopening fails if the date filled up meanwhile", async () => {
    const tour = await createTour({ capacity: 2 });
    const first = await book(tour);
    await transition(first.json.item.id, "cancel");
    assert.equal((await book(tour)).status, 201);
    const res = await transition(first.json.item.id, "reopen");
    assert.equal(res.status, 409);
  });

  test("invalid transitions are refused", async () => {
    const tour = await createTour();
    const { json } = await book(tour);
    assert.equal((await transition(json.item.id, "complete")).status, 409); // pending → completed not allowed
    assert.equal((await transition(json.item.id, "teleport")).status, 400);
  });

  test("Editors and anonymous callers cannot change status", async () => {
    const tour = await createTour();
    const { json } = await book(tour);
    const editor = await app.createUser({ role: "Editor" });
    assert.equal((await transition(json.item.id, "confirm", editor.token)).status, 403);
    assert.equal((await transition(json.item.id, "confirm", null)).status, 401);
  });

  test("PATCH can no longer change status directly", async () => {
    const tour = await createTour();
    const { json } = await book(tour);
    await app.request("PATCH", `/api/bookings/${json.item.id}`, { token: admin.token, body: { status: "completed" } });
    assert.equal((await Booking.findById(json.item.id)).status, "pending");
  });

  test("deleting a booking releases its seats", async () => {
    const tour = await createTour({ capacity: 5 });
    const { json } = await book(tour);
    await app.request("DELETE", `/api/bookings/${json.item.id}`, { token: admin.token });
    assert.equal(await held(tour), 0);
  });
});

describe("Quotes use real option prices", () => {
  test("tour options stored as labels are matched to settings keys", async () => {
    const tour = await createTour({ availableOptions: { vehicleTypes: ["Premium SUV"], hotelCategories: ["3-Star"] } });
    const res = await app.request("POST", "/api/bookings/quote/public", {
      body: { tourId: tour._id.toString(), adults: 2, facilities: { hotelType: "3_star" } },
    });
    assert.equal(res.status, 200);
    assert.ok(res.json.quote.breakdown.vehicleTotal > 0, "vehicle is priced");
    assert.ok(res.json.quote.breakdown.hotelTotal > 0, "hotel is priced");
    assert.deepEqual(res.json.quote.options.vehicleTypes.map((v) => v.key), ["premium_suv"]);
  });

  test("an option that isn't offered is refused instead of quoted at 0", async () => {
    const tour = await createTour({ availableOptions: { vehicleTypes: ["Premium SUV"] } });
    const res = await app.request("POST", "/api/bookings/quote/public", {
      body: { tourId: tour._id.toString(), adults: 2, facilities: { vehicleType: "coaster" } },
    });
    assert.equal(res.status, 400);
  });
});
