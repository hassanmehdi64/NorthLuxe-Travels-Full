import mongoose from "mongoose";

/**
 * Seats taken per tour per travel date (one document per departure).
 * `held` counts seats of Pending (48h hold) AND Confirmed bookings.
 * Updated only with single-document atomic $inc guarded by capacity
 * (see utils/bookingLifecycle.js), so two bookings can't take the same seat.
 */
const seatLedgerSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (travel date, UTC)
    held: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

seatLedgerSchema.index({ tour: 1, date: 1 }, { unique: true });

export const SeatLedger = mongoose.model("SeatLedger", seatLedgerSchema);
