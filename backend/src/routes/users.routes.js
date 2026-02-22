import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = express.Router();

const toUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  joined: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

router.use(requireAuth, requireRole("Admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ items: users.map(toUser) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const passwordHash = await User.hashPassword(req.body.password || "Pass@123");
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash,
      role: req.body.role || "Editor",
      status: req.body.status || "Active",
      avatar: req.body.avatar || "",
    });
    res.status(201).json({ item: toUser(user) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (payload.password) {
      payload.passwordHash = await User.hashPassword(payload.password);
      delete payload.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ item: toUser(user) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(204).send();
  }),
);

export default router;
