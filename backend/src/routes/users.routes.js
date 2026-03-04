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
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "").trim();

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const emailExists = await User.findOne({ email }).select("_id");
    if (emailExists) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
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
    const targetUser = await User.findById(req.params.id).select("role");
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const payload = { ...req.body };

    if (payload.email !== undefined) {
      payload.email = String(payload.email || "").toLowerCase().trim();
      if (!payload.email) return res.status(400).json({ message: "Email is required" });
      const emailExists = await User.findOne({
        email: payload.email,
        _id: { $ne: req.params.id },
      }).select("_id");
      if (emailExists) return res.status(409).json({ message: "Email already exists" });
    }

    if (payload.name !== undefined) {
      payload.name = String(payload.name || "").trim();
      if (!payload.name) return res.status(400).json({ message: "Name is required" });
    }

    if (payload.password) {
      if (String(payload.password).length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      payload.passwordHash = await User.hashPassword(payload.password);
      delete payload.password;
    }

    const isSelf = String(req.user?._id) === String(req.params.id);
    if (isSelf && payload.status === "Suspended") {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }

    if (isSelf && payload.role && payload.role !== targetUser.role) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (
      targetUser.role === "Admin" &&
      (payload.role === "Editor" || payload.status === "Suspended")
    ) {
      const activeAdmins = await User.countDocuments({ role: "Admin", status: "Active" });
      if (activeAdmins <= 1) {
        return res.status(400).json({ message: "At least one active admin is required" });
      }
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
    const isSelf = String(req.user?._id) === String(req.params.id);
    if (isSelf) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "Admin") {
      const activeAdmins = await User.countDocuments({ role: "Admin", status: "Active" });
      if (activeAdmins <= 1) {
        return res.status(400).json({ message: "At least one active admin is required" });
      }
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(204).send();
  }),
);

export default router;
