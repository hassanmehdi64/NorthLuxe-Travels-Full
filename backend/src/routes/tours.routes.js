import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Tour } from "../models/Tour.js";
import { slugify } from "../utils/slugify.js";

const router = express.Router();

const normalizeDiscountPercent = (value) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return 0;
  return Math.max(0, Math.min(95, normalized));
};

const sanitizeReviewItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      rating: Math.max(1, Math.min(5, Number(item?.rating || 5))),
      date: String(item?.date || "").trim(),
      tag: String(item?.tag || "").trim(),
      comment: String(item?.comment || "").trim(),
    }))
    .filter((item) => item.name || item.comment || item.tag || item.date);
};

const sanitizeStringList = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const getReviewStats = (items = [], fallbackRating = 4.8, fallbackCount = 0) => {
  if (!items.length) {
    return {
      rating: Number(fallbackRating || 4.8),
      count: Number(fallbackCount || 0),
    };
  }

  const total = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return {
    rating: Number((total / items.length).toFixed(1)),
    count: items.length,
  };
};

const toTourResponse = (tour) => ({
  id: tour._id,
  title: tour.title,
  slug: tour.slug,
  location: tour.location,
  durationDays: tour.durationDays,
  durationLabel: tour.durationLabel || `${tour.durationDays} Days`,
  price: tour.price,
  discountPercent: normalizeDiscountPercent(tour.discountPercent ?? 0),
  currency: tour.currency,
  image: tour.coverImage,
  gallery: tour.gallery,
  shortDescription: tour.shortDescription,
  description: tour.description,
  capacity: tour.capacity,
  availableSeats: tour.availableSeats,
  featured: tour.featured,
  status: tour.status,
  rating: tour.rating,
  reviews: tour.reviewsCount,
  reviewItems: tour.reviewItems || [],
  tags: tour.tags,
  itinerary: tour.itinerary,
  availableOptions: tour.availableOptions || {
    hotelCategories: [],
    vehicleTypes: [],
  },
  createdAt: tour.createdAt,
  updatedAt: tour.updatedAt,
});

router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const { featured, q } = req.query;
    const query = { status: "published" };
    if (featured === "true") query.featured = true;
    if (q) query.$text = { $search: q };
    const tours = await Tour.find(query).sort({ createdAt: -1 });
    res.json({ items: tours.map(toTourResponse) });
  }),
);

router.get(
  "/:slug/public",
  asyncHandler(async (req, res) => {
    const tour = await Tour.findOne({
      slug: req.params.slug,
      status: "published",
    });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ item: toTourResponse(tour) });
  }),
);

router.use(requireAuth, requireRole("Admin", "Editor"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json({ items: tours.map(toTourResponse) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const syncedSeats = Number(payload.availableSeats ?? payload.capacity ?? 20);
    const reviewItems = sanitizeReviewItems(payload.reviewItems);
    const reviewStats = getReviewStats(reviewItems, payload.rating, payload.reviews);
    const title = payload.title?.trim();
    const coverImage = String(payload.image || payload.coverImage || "").trim();
    const gallery = sanitizeStringList(payload.gallery);
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!coverImage) return res.status(400).json({ message: "Cover image is required" });

    const baseSlug = slugify(payload.slug || title);
    let slug = baseSlug;
    let n = 1;
    while (await Tour.exists({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const tour = await Tour.create({
      title,
      slug,
      location: payload.location || "",
      durationDays: Number(payload.durationDays || 1),
      durationLabel: String(payload.durationLabel || "").trim(),
      price: Number(payload.price || 0),
      discountPercent: normalizeDiscountPercent(payload.discountPercent ?? 0),
      currency: String(payload.currency || "PKR").trim() || "PKR",
      coverImage,
      gallery,
      shortDescription: payload.shortDescription || "",
      description: payload.description || "",
      capacity: syncedSeats,
      availableSeats: syncedSeats,
      featured: Boolean(payload.featured),
      status: payload.status || "draft",
      rating: reviewStats.rating,
      reviewsCount: reviewStats.count,
      reviewItems,
      tags: payload.tags || [],
      itinerary: payload.itinerary || [],
      availableOptions: payload.availableOptions || {},
    });

    res.status(201).json({ item: toTourResponse(tour) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const reviewItems = payload.reviewItems !== undefined ? sanitizeReviewItems(payload.reviewItems) : undefined;
    const reviewStats = reviewItems !== undefined
      ? getReviewStats(reviewItems, payload.rating, payload.reviews)
      : null;
    const update = {
      ...payload,
      coverImage: payload.image || payload.coverImage,
      reviewsCount: payload.reviews,
      availableOptions: payload.availableOptions,
      gallery: payload.gallery !== undefined ? sanitizeStringList(payload.gallery) : undefined,
      currency: payload.currency !== undefined ? String(payload.currency || "PKR").trim() || "PKR" : undefined,
      durationLabel:
        payload.durationLabel !== undefined ? String(payload.durationLabel || "").trim() : undefined,
      discountPercent:
        payload.discountPercent === undefined
          ? undefined
          : normalizeDiscountPercent(payload.discountPercent),
    };

    if (reviewItems !== undefined) {
      update.reviewItems = reviewItems;
      update.rating = reviewStats.rating;
      update.reviewsCount = reviewStats.count;
    }

    if (payload.availableSeats !== undefined || payload.capacity !== undefined) {
      const syncedSeats = Number(payload.availableSeats ?? payload.capacity ?? 0);
      update.capacity = syncedSeats;
      update.availableSeats = syncedSeats;
    }

    delete update.image;
    delete update.reviews;
    if (update.availableOptions === undefined) delete update.availableOptions;
    if (update.gallery === undefined) delete update.gallery;
    if (update.currency === undefined) delete update.currency;
    if (update.durationLabel === undefined) delete update.durationLabel;
    if (update.discountPercent === undefined) delete update.discountPercent;

    if (payload.title && !payload.slug) {
      update.slug = slugify(payload.title);
    }

    const tour = await Tour.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ item: toTourResponse(tour) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tour not found" });
    res.status(204).send();
  }),
);

export default router;
