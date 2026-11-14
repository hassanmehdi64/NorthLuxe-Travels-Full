import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { SeatLedger } from "../models/SeatLedger.js";
import { Tour } from "../models/Tour.js";

/**
 * THE booking lifecycle (owner-approved):
 *
 *   Pending ──confirm──▶ Confirmed ──complete──▶ Completed
 *     │  │                   │
 *     │  └─48h unpaid──▶ Expired          (seats released automatically)
 *     └──cancel──▶ Cancelled ◀──cancel───┘
 *   Admin can reopen Cancelled/Expired → Pending (new 48h hold if seats are free).
 *
 * Seats: held for 48h while Pending, kept while Confirmed/Completed, released on
 * Cancelled/Expired. An admin may confirm with nothing paid ("Unpaid · pay on arrival").
 * Payment status is derived only from recorded payments (utils/payments.js).
 */

export const HOLD_HOURS = 48;
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "expired"];

const TRANSITIONS = {
  confirm: { from: ["pending", "expired"], to: "confirmed" },
  cancel: { from: ["pending", "confirmed", "expired"], to: "cancelled" },
  complete: { from: ["confirmed"], to: "completed" },
  reopen: { from: ["cancelled", "expired"], to: "pending" },
};

export const allowedActions = (status) =>
  Object.entries(TRANSITIONS)
    .filter(([, rule]) => rule.from.includes(status))
    .map(([action]) => action);

const httpError = (status, message) => Object.assign(new Error(message), { status });

/** Normalise any date input to the YYYY-MM-DD departure key (UTC). */
export const toSeatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const tourCapacity = (tour) => Math.max(0, Number(tour?.capacity ?? 0));

export const getAvailability = async (tour, seatDate) => {
  const capacity = tourCapacity(tour);
  const ledger = seatDate ? await SeatLedger.findOne({ tour: tour._id, date: seatDate }).lean() : null;
  const held = Number(ledger?.held || 0);
  return { date: seatDate, capacity, held, available: Math.max(0, capacity - held) };
};

/**
 * Atomically take `seats` for a tour/date. Succeeds only if they still fit within
 * the tour's capacity; throws 409 otherwise. Single-document conditional $inc, so
 * concurrent requests can never oversell.
 */
export const reserveSeats = async ({ tour, seatDate, seats }) => {
  const count = Math.max(0, Number(seats || 0));
  if (!count) return;
  if (!seatDate) throw httpError(400, "Please choose a travel date.");
  const capacity = tourCapacity(tour);
  if (count > capacity) throw httpError(409, `This tour takes at most ${capacity} travellers per departure.`);

  await SeatLedger.updateOne({ tour: tour._id, date: seatDate }, { $setOnInsert: { held: 0 } }, { upsert: true });
  const updated = await SeatLedger.findOneAndUpdate(
    { tour: tour._id, date: seatDate, held: { $lte: capacity - count } },
    { $inc: { held: count } },
    { new: true },
  );
  if (!updated) {
    const { available } = await getAvailability(tour, seatDate);
    throw httpError(409, available > 0 ? `Only ${available} seat${available === 1 ? "" : "s"} left on this date.` : "This date is fully booked.");
  }
};

export const releaseSeats = async ({ tourId, seatDate, seats }) => {
  const count = Math.max(0, Number(seats || 0));
  if (!count || !tourId || !seatDate) return;
  // Never go below zero even if data was edited by hand.
  await SeatLedger.updateOne({ tour: tourId, date: seatDate, held: { $gte: count } }, { $inc: { held: -count } });
};

export const addHistory = (booking, { action, from = "", to = "", note = "", actor = null }) => {
  booking.history.push({
    at: new Date(),
    action,
    from,
    to,
    note: String(note || "").slice(0, 500),
    by: actor?._id || null,
    byName: actor?.name || (actor === "system" ? "System" : actor?.label || ""),
  });
};

const holdUntil = (from = new Date()) => new Date(from.getTime() + HOLD_HOURS * 3600 * 1000);

/** Hold seats for a new website booking (called before the booking is saved). */
export const holdSeatsForNewBooking = async ({ booking, tour }) => {
  if (booking.bookingType === "custom" || !tour) return;
  const seatDate = toSeatDate(booking.travelDate);
  await reserveSeats({ tour, seatDate, seats: booking.groupSize });
  booking.seatDate = seatDate;
  booking.seatsHeld = booking.groupSize;
  booking.seatState = "held";
  booking.holdExpiresAt = holdUntil();
};

/** Payments keep the hold forever (a paid booking is never expired). */
export const markSeatsReserved = (booking) => {
  if (booking.seatState === "held") {
    booking.seatState = "reserved";
    booking.holdExpiresAt = null;
  }
};

/**
 * Apply a staff action. Validates the transition, moves seats, writes history.
 * The caller saves nothing: this function saves the booking.
 */
export const applyTransition = async ({ booking, action, actor, note = "" }) => {
  const rule = TRANSITIONS[action];
  if (!rule) throw httpError(400, "Unknown action.");
  if (!rule.from.includes(booking.status)) {
    throw httpError(409, `A ${booking.status} booking cannot be ${rule.to === "pending" ? "reopened" : rule.to}.`);
  }
  const from = booking.status;
  const tourId = booking.tour?._id || booking.tour;

  if (action === "confirm") {
    if (booking.seatState === "held") {
      booking.seatState = "reserved";
      booking.holdExpiresAt = null;
    } else if (booking.seatState === "released" && tourId && booking.seatDate) {
      const tour = await Tour.findById(tourId);
      await reserveSeats({ tour, seatDate: booking.seatDate, seats: booking.seatsHeld || booking.groupSize });
      booking.seatState = "reserved";
      booking.holdExpiresAt = null;
    }
  }

  if (action === "cancel" && ["held", "reserved"].includes(booking.seatState)) {
    await releaseSeats({ tourId, seatDate: booking.seatDate, seats: booking.seatsHeld });
    booking.seatState = "released";
    booking.holdExpiresAt = null;
  }

  if (action === "reopen" && booking.seatState === "released" && tourId && booking.seatDate) {
    const tour = await Tour.findById(tourId);
    await reserveSeats({ tour, seatDate: booking.seatDate, seats: booking.seatsHeld || booking.groupSize });
    booking.seatState = "held";
    booking.holdExpiresAt = holdUntil();
  }

  booking.status = rule.to;
  addHistory(booking, { action: rule.to === "pending" ? "reopened" : rule.to, from, to: rule.to, note, actor });
  await booking.save();
  return booking;
};

/**
 * Expire unpaid Pending bookings whose 48h hold has lapsed and release their seats.
 * Idempotent; called lazily (before availability checks, quotes and admin lists)
 * and on an interval in server.js, so it also works on serverless hosting.
 */
export const expireStaleHolds = async (now = new Date()) => {
  const stale = await Booking.find({
    status: "pending",
    seatState: "held",
    holdExpiresAt: { $ne: null, $lte: now },
    paidAmount: { $lte: 0 },
  }).limit(200);

  for (const booking of stale) {
    // Re-check atomically: only the request that flips the state releases the seats.
    const claimed = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "pending", seatState: "held", paidAmount: { $lte: 0 } },
      {
        $set: { status: "expired", seatState: "released", holdExpiresAt: null },
        $push: {
          history: {
            at: now,
            action: "expired",
            from: "pending",
            to: "expired",
            note: `Unpaid after ${HOLD_HOURS} hours; seats released.`,
            byName: "System",
          },
        },
      },
      { new: true },
    );
    if (!claimed) continue;
    await releaseSeats({ tourId: claimed.tour, seatDate: claimed.seatDate, seats: claimed.seatsHeld });
    await Notification.create({
      type: "Bookings",
      title: "Booking hold expired",
      message: `${claimed.bookingCode} was unpaid after ${HOLD_HOURS}h; its seats were released.`,
    });
  }
  return stale.length;
};

/**
 * One label for payment state, shown everywhere (admin and customer).
 * "Unpaid · pay on arrival" = an admin confirmed it with nothing paid.
 */
export const describePayment = (booking) => {
  const paid = Number(booking?.paidAmount || 0);
  const total = Number(booking?.totalAmount || 0);
  if (paid <= 0) {
    if (booking?.status === "confirmed" || booking?.status === "completed") return "Unpaid · pay on arrival";
    if (booking?.paymentStatus === "Verification Pending") return "Awaiting verification";
    return "Unpaid";
  }
  if (total > 0 && paid >= total) return "Paid";
  return "Partially paid";
};
