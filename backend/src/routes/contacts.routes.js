import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

const toContact = (item) => ({
  id: item._id,
  sender: item.sender,
  email: item.email,
  phone: item.phone,
  subject: item.subject,
  message: item.message,
  status: item.status,
  urgency: item.urgency,
  replies: item.replies,
  date: item.createdAt,
});

router.post(
  "/public",
  asyncHandler(async (req, res) => {
    const item = await ContactMessage.create(req.body);
    await Notification.create({
      type: "System",
      title: "New Contact Message",
      message: `${item.sender} sent a message.`,
    });
    res.status(201).json({ item: toContact(item) });
  }),
);

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    const query = {};
    if (q) {
      query.$or = [
        { sender: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
      ];
    }
    const items = await ContactMessage.find(query).sort({ createdAt: -1 });
    res.json({ items: items.map(toContact) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Message not found" });
    res.json({ item: toContact(item) });
  }),
);

router.post(
  "/:id/reply",
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Reply is required" });

    const item = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        $push: { replies: { message } },
        status: "Replied",
      },
      { new: true },
    );
    if (!item) return res.status(404).json({ message: "Message not found" });
    res.json({ item: toContact(item) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.status(204).send();
  }),
);

export default router;
