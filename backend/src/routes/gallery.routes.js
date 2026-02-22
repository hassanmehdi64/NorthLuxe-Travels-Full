import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { GalleryItem } from "../models/GalleryItem.js";

const router = express.Router();

const toMedia = (item) => ({
  id: item._id,
  title: item.title,
  category: item.category,
  url: item.url,
  alt: item.alt,
  createdAt: item.createdAt,
});

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ items: items.map(toMedia) });
  }),
);

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ items: items.map(toMedia) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const item = await GalleryItem.create(req.body);
    res.status(201).json({ item: toMedia(item) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Media not found" });
    res.json({ item: toMedia(item) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Media not found" });
    res.status(204).send();
  }),
);

export default router;
