import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Tour } from "../models/Tour.js";
import { User } from "../models/User.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [totalUsers, totalBookings, activeTours, revenueAgg, latestBookings] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Tour.countDocuments({ status: "published" }),
      Booking.aggregate([
        { $match: { paymentStatus: { $in: ["Paid", "Partially Paid"] } } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      Booking.find().populate("tour").sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    res.json({
      stats: {
        totalUsers,
        totalBookings,
        activeTours,
        totalRevenue,
      },
      latestBookings: latestBookings.map((booking) => ({
        id: booking._id,
        bookingCode: booking.bookingCode,
        user: booking.customerName,
        email: booking.email,
        tour: booking.tour?.title || "",
        amount: booking.totalAmount,
        status: booking.status,
        date: booking.createdAt,
      })),
    });
  }),
);

export default router;
