import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

const toNotification = (item) => ({
  id: item._id,
  type: item.type,
  title: item.title,
  message: item.message,
  isRead: item.isRead,
  time: item.createdAt,
  createdAt: item.createdAt,
});

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await Notification.find().sort({ createdAt: -1 });
    res.json({ items: items.map(toNotification) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Notification not found" });
    res.json({ item: toNotification(item) });
  }),
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    if (req.body.markAllRead) {
      await Notification.updateMany({}, { isRead: true });
    }
    const items = await Notification.find().sort({ createdAt: -1 });
    res.json({ items: items.map(toNotification) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.status(204).send();
  }),
);

export default router;
