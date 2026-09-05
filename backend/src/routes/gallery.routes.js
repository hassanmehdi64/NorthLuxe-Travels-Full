import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { GalleryItem } from "../models/GalleryItem.js";

const router = express.Router();

const toMedia = (item) => ({
  id: item._id,
  title: item.title,
  category: item.category,
  url: item.url,
  alt: item.alt,
  status: item.status || "published",
  sortOrder: Number(item.sortOrder || 0),
  createdAt: item.createdAt,
});

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const items = await GalleryItem.find({ status: "published" }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ items: items.map(toMedia) });
  }),
);

router.use(requireAuth, requireRole("Admin", "Editor"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ items: items.map(toMedia) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const item = await GalleryItem.create({
      title: String(payload.title || "").trim(),
      category: String(payload.category || "").trim(),
      url: String(payload.url || "").trim(),
      alt: String(payload.alt || "").trim(),
      status: payload.status === "draft" ? "draft" : "published",
      sortOrder: Number(payload.sortOrder || 0),
    });
    res.status(201).json({ item: toMedia(item) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const update = {
      ...payload,
      sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder || 0) : undefined,
    };
    if (update.title !== undefined) update.title = String(update.title || "").trim();
    if (update.category !== undefined) update.category = String(update.category || "").trim();
    if (update.url !== undefined) update.url = String(update.url || "").trim();
    if (update.alt !== undefined) update.alt = String(update.alt || "").trim();
    if (update.status !== undefined) {
      update.status = update.status === "draft" ? "draft" : "published";
    }
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, update, {
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
