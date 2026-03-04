import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ContentEntry } from "../models/ContentEntry.js";
import { slugify } from "../utils/slugify.js";

const router = express.Router();

const toContentResponse = (item) => ({
  id: item._id,
  type: item.type,
  title: item.title,
  slug: item.slug,
  eyebrow: item.eyebrow,
  highlight: item.highlight,
  shortDescription: item.shortDescription,
  description: item.description,
  content: item.content,
  image: item.coverImage,
  coverImage: item.coverImage,
  gallery: item.gallery,
  location: item.location,
  category: item.category,
  duration: item.duration,
  level: item.level,
  question: item.question,
  answer: item.answer,
  highlights: item.highlights,
  features: item.features,
  includes: item.includes,
  deliverables: item.deliverables,
  blocks: item.blocks,
  meta: item.meta || {},
  featured: item.featured,
  status: item.status,
  sortOrder: item.sortOrder || 0,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const buildFilters = (query, includeDraft = false) => {
  const filters = {};
  if (query.type) filters.type = query.type;
  if (!includeDraft) {
    filters.status = "published";
  } else if (query.status && ["draft", "published"].includes(query.status)) {
    filters.status = query.status;
  }
  if (query.featured === "true") filters.featured = true;
  if (query.q) filters.$text = { $search: query.q };
  return filters;
};

const ensureUniqueSlug = async (base, excludeId) => {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await ContentEntry.findOne({ slug }).select("_id");
    if (!existing || String(existing._id) === String(excludeId || "")) {
      return slug;
    }
    slug = `${base}-${counter++}`;
  }
};

router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 200), 500));
    const items = await ContentEntry.find(buildFilters(req.query))
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit);
    res.json({ items: items.map(toContentResponse) });
  }),
);

router.get(
  "/:slug/public",
  asyncHandler(async (req, res) => {
    const filters = buildFilters(req.query);
    filters.slug = req.params.slug;
    const item = await ContentEntry.findOne(filters);
    if (!item) return res.status(404).json({ message: "Content not found" });
    res.json({ item: toContentResponse(item) });
  }),
);

router.use(requireAuth, requireRole("Admin", "Editor"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await ContentEntry.find(buildFilters(req.query, true)).sort({
      sortOrder: 1,
      createdAt: -1,
    });
    res.json({ items: items.map(toContentResponse) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    if (!payload.type) return res.status(400).json({ message: "Type is required" });
    if (!payload.title?.trim()) return res.status(400).json({ message: "Title is required" });

    const baseSlug = slugify(payload.slug || payload.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const item = await ContentEntry.create({
      type: payload.type,
      title: payload.title.trim(),
      slug,
      eyebrow: payload.eyebrow || "",
      highlight: payload.highlight || "",
      shortDescription: payload.shortDescription || "",
      description: payload.description || "",
      content: payload.content || "",
      coverImage: payload.image || payload.coverImage || "",
      gallery: payload.gallery || [],
      location: payload.location || "",
      category: payload.category || "",
      duration: payload.duration || "",
      level: payload.level || "",
      question: payload.question || "",
      answer: payload.answer || "",
      highlights: payload.highlights || [],
      features: payload.features || [],
      includes: payload.includes || [],
      deliverables: payload.deliverables || [],
      blocks: payload.blocks || [],
      meta: payload.meta || {},
      featured: Boolean(payload.featured),
      status: payload.status || "published",
      sortOrder: Number(payload.sortOrder || 0),
    });

    res.status(201).json({ item: toContentResponse(item) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const item = await ContentEntry.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Content not found" });

    if (payload.slug || (payload.title && !payload.slug)) {
      const baseSlug = slugify(payload.slug || payload.title);
      item.slug = await ensureUniqueSlug(baseSlug, item._id);
    }

    if (payload.type !== undefined) item.type = payload.type;
    if (payload.title !== undefined) item.title = payload.title;
    if (payload.eyebrow !== undefined) item.eyebrow = payload.eyebrow;
    if (payload.highlight !== undefined) item.highlight = payload.highlight;
    if (payload.shortDescription !== undefined) item.shortDescription = payload.shortDescription;
    if (payload.description !== undefined) item.description = payload.description;
    if (payload.content !== undefined) item.content = payload.content;
    if (payload.image !== undefined || payload.coverImage !== undefined) {
      item.coverImage = payload.image || payload.coverImage || "";
    }
    if (payload.gallery !== undefined) item.gallery = payload.gallery;
    if (payload.location !== undefined) item.location = payload.location;
    if (payload.category !== undefined) item.category = payload.category;
    if (payload.duration !== undefined) item.duration = payload.duration;
    if (payload.level !== undefined) item.level = payload.level;
    if (payload.question !== undefined) item.question = payload.question;
    if (payload.answer !== undefined) item.answer = payload.answer;
    if (payload.highlights !== undefined) item.highlights = payload.highlights;
    if (payload.features !== undefined) item.features = payload.features;
    if (payload.includes !== undefined) item.includes = payload.includes;
    if (payload.deliverables !== undefined) item.deliverables = payload.deliverables;
    if (payload.blocks !== undefined) item.blocks = payload.blocks;
    if (payload.meta !== undefined) item.meta = payload.meta;
    if (payload.featured !== undefined) item.featured = Boolean(payload.featured);
    if (payload.status !== undefined) item.status = payload.status;
    if (payload.sortOrder !== undefined) item.sortOrder = Number(payload.sortOrder || 0);

    await item.save();
    res.json({ item: toContentResponse(item) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await ContentEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Content not found" });
    res.status(204).send();
  }),
);

export default router;
