/**
 * Phase 2 data migration: booking lifecycle, seat ledger, derived payment status,
 * tour option keys. DRY RUN by default — prints what would change.
 *
 *   node src/scripts/migrate-booking-lifecycle.js                 # dry run
 *   node src/scripts/migrate-booking-lifecycle.js --apply         # write (owner runs this)
 *   node src/scripts/migrate-booking-lifecycle.js --grace-hours=48
 *
 * 1. Seats: rebuilds SeatLedger from active bookings that have a tour + travel date.
 *    Confirmed/Completed (or anything with money received) → reserved.
 *    Pending & unpaid → held, with a FRESH hold of --grace-hours from now (so existing
 *    requests are not expired the moment this runs). Cancelled → released.
 * 2. Payments: paidAmount / paymentStatus / paymentVerified recomputed from confirmed
 *    paymentHistory entries (fixes "Paid" with nothing received).
 * 3. Tour options: hotel/vehicle values stored as labels are mapped to settings keys;
 *    values that match nothing are KEPT unchanged and listed for the owner.
 */
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Booking } from "../models/Booking.js";
import { SeatLedger } from "../models/SeatLedger.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { Tour } from "../models/Tour.js";
import { toSeatDate } from "../utils/bookingLifecycle.js";
import { derivePaymentStatus } from "../utils/payments.js";

const APPLY = process.argv.includes("--apply");
const graceArg = process.argv.find((arg) => arg.startsWith("--grace-hours="));
const GRACE_HOURS = graceArg ? Math.max(1, Number(graceArg.split("=")[1]) || 48) : 48;

const norm = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");

const run = async () => {
  const connection = await connectDb();
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"} · database host: ${connection.host} · db: ${connection.name}`);

  const [bookings, tours, settings] = await Promise.all([
    Booking.find(),
    Tour.find(),
    SiteSetting.findOne({ key: "default" }).lean(),
  ]);
  const tourById = new Map(tours.map((tour) => [String(tour._id), tour]));

  // ---------- 1 + 2: bookings ----------
  const ledger = new Map(); // `${tourId}|${date}` → seats
  const noDate = [];
  const paymentFixes = [];
  const seatChanges = { reserved: 0, held: 0, released: 0, none: 0 };
  const now = new Date();

  for (const booking of bookings) {
    const confirmedPayments = (booking.paymentHistory || []).filter((p) => p.status === "confirmed");
    const paid = confirmedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const derived = paid > 0 ? derivePaymentStatus(paid, booking.totalAmount) : booking.paymentStatus === "Verification Pending" ? "Verification Pending" : "Pending";
    if (paid !== Number(booking.paidAmount || 0) || derived !== booking.paymentStatus || (paid > 0) !== Boolean(booking.paymentVerified)) {
      paymentFixes.push(`${booking.bookingCode}: paid ${booking.paidAmount}→${paid}, status "${booking.paymentStatus}"→"${derived}"`);
      booking.paidAmount = paid;
      booking.remainingAmount = Math.max(0, Number(booking.totalAmount || 0) - paid);
      booking.paymentStatus = derived;
      booking.paymentVerified = paid > 0;
    }

    const tourId = String(booking.tour || "");
    const seatDate = toSeatDate(booking.travelDate);
    const isStandard = booking.bookingType !== "custom" && tourById.has(tourId);
    let seatState = "none";
    if (isStandard && !seatDate && ["pending", "confirmed"].includes(booking.status)) noDate.push(booking.bookingCode);
    if (isStandard && seatDate) {
      if (["confirmed", "completed"].includes(booking.status) || paid > 0) seatState = "reserved";
      else if (booking.status === "pending") seatState = "held";
      else seatState = "released";
      if (seatState !== "released") {
        const key = `${tourId}|${seatDate}`;
        ledger.set(key, (ledger.get(key) || 0) + Number(booking.groupSize || 1));
      }
    }
    seatChanges[seatState] += 1;
    booking.seatDate = seatState === "none" ? "" : seatDate;
    booking.seatsHeld = seatState === "none" ? 0 : Number(booking.groupSize || 1);
    booking.seatState = seatState;
    booking.holdExpiresAt = seatState === "held" ? new Date(now.getTime() + GRACE_HOURS * 3600000) : null;
    if (!booking.history?.length) {
      booking.history = [{ at: booking.createdAt || now, action: "created", to: booking.status, note: "Recorded before history tracking", byName: "System" }];
    }
  }

  const overbooked = [];
  for (const [key, seats] of ledger) {
    const [tourId, date] = key.split("|");
    const capacity = Number(tourById.get(tourId)?.capacity || 0);
    if (seats > capacity) overbooked.push(`${tourById.get(tourId)?.title} on ${date}: ${seats} booked, capacity ${capacity}`);
  }

  // ---------- 3: tour options ----------
  const pricing = settings?.bookingPricing || {};
  const hotelOpts = (pricing.hotelCategories || []).filter((o) => o?.key);
  const vehicleOpts = (pricing.vehicleTypes || []).filter((o) => o?.key);
  const optionFixes = [];
  const unmapped = [];
  const mapList = (values, options, tour, kind) => {
    const out = [];
    for (const value of values || []) {
      const hit = options.find((o) => norm(o.key) === norm(value) || norm(o.label) === norm(value));
      if (hit) out.push(hit.key);
      else {
        out.push(value); // keep it: removing would silently widen what the tour offers
        unmapped.push(`${tour.title}: ${kind} "${value}"`);
      }
    }
    return [...new Set(out)];
  };
  for (const tour of tours) {
    const hotels = mapList(tour.availableOptions?.hotelCategories, hotelOpts, tour, "hotel");
    const vehicles = mapList(tour.availableOptions?.vehicleTypes, vehicleOpts, tour, "vehicle");
    const before = JSON.stringify([tour.availableOptions?.hotelCategories || [], tour.availableOptions?.vehicleTypes || []]);
    if (before !== JSON.stringify([hotels, vehicles])) {
      optionFixes.push(`${tour.title}: hotels ${JSON.stringify(tour.availableOptions?.hotelCategories || [])}→${JSON.stringify(hotels)}, vehicles ${JSON.stringify(tour.availableOptions?.vehicleTypes || [])}→${JSON.stringify(vehicles)}`);
      tour.availableOptions = { hotelCategories: hotels, vehicleTypes: vehicles };
    }
  }

  // ---------- report ----------
  console.log(`\nBookings: ${bookings.length}  · seat states → reserved ${seatChanges.reserved}, held ${seatChanges.held} (fresh ${GRACE_HOURS}h), released ${seatChanges.released}, none ${seatChanges.none}`);
  console.log(`Seat ledger rows: ${ledger.size}`);
  if (overbooked.length) console.log(`⚠ Already over capacity (review manually):\n  ${overbooked.join("\n  ")}`);
  if (noDate.length) console.log(`⚠ Active standard bookings with no travel date (no seats counted): ${noDate.join(", ")}`);
  console.log(`\nPayment status fixes: ${paymentFixes.length}${paymentFixes.length ? `\n  ${paymentFixes.join("\n  ")}` : ""}`);
  console.log(`\nTour option fixes: ${optionFixes.length}${optionFixes.length ? `\n  ${optionFixes.join("\n  ")}` : ""}`);
  if (unmapped.length) console.log(`⚠ Options that match no priced setting (add them in Settings → Payments & pricing, or remove from the tour):\n  ${unmapped.join("\n  ")}`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to write these changes.");
    return;
  }
  for (const booking of bookings) await booking.save({ validateBeforeSave: false });
  for (const tour of tours) if (tour.isModified("availableOptions")) await tour.save();
  await SeatLedger.deleteMany({});
  for (const [key, seats] of ledger) {
    const [tour, date] = key.split("|");
    await SeatLedger.create({ tour, date, held: seats });
  }
  console.log("\nApplied.");
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
