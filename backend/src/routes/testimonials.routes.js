import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Testimonial } from "../models/Testimonial.js";

const router = express.Router();

const toResponse = (item) => ({
  id: item._id,
  name: item.name,
  role: item.role,
  city: item.city || "",
  country: item.country || "",
  locationLabel: [item.city, item.country].filter(Boolean).join(", "),
  avatar: item.avatar,
  photo: item.avatar,
  message: item.message,
  rating: item.rating,
  featured: item.featured,
  date: (item.reviewDate || item.createdAt).toISOString(),
  status: item.status,
  createdAt: item.createdAt,
});

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const items = await Testimonial.find({ status: "published" }).sort({ reviewDate: -1, createdAt: -1 });
    res.json({ items: items.map(toResponse) });
  }),
);

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await Testimonial.find().sort({ reviewDate: -1, createdAt: -1 });
    res.json({ items: items.map(toResponse) });
  }),
);

router.post(
  "/",
  requireRole("Admin", "Editor"),
  asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      avatar: req.body.avatar || req.body.photo || "",
      reviewDate: req.body.date || req.body.reviewDate || Date.now(),
    };
    const item = await Testimonial.create(payload);
    res.status(201).json({ item: toResponse(item) });
  }),
);

router.patch(
  "/:id",
  requireRole("Admin", "Editor"),
  asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      avatar: req.body.avatar || req.body.photo || "",
      reviewDate: req.body.date || req.body.reviewDate || undefined,
    };
    if (!payload.reviewDate) delete payload.reviewDate;
    const item = await Testimonial.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ item: toResponse(item) });
  }),
);

router.delete(
  "/:id",
  requireRole("Admin"),
  asyncHandler(async (req, res) => {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Testimonial not found" });
    res.status(204).send();
  }),
);

export default router;
