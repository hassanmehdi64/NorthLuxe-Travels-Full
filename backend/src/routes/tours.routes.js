import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Tour } from "../models/Tour.js";
import { slugify } from "../utils/slugify.js";

const router = express.Router();

const toTourResponse = (tour) => ({
  id: tour._id,
  title: tour.title,
  slug: tour.slug,
  location: tour.location,
  durationDays: tour.durationDays,
  durationLabel: tour.durationLabel || `${tour.durationDays} Days`,
  price: tour.price,
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
  tags: tour.tags,
  itinerary: tour.itinerary,
  availableOptions: tour.availableOptions || { hotelCategories: [], vehicleTypes: [] },
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
    const tour = await Tour.findOne({ slug: req.params.slug, status: "published" });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ item: toTourResponse(tour) });
  }),
);

router.use(requireAuth);

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
    const title = payload.title?.trim();
    if (!title) return res.status(400).json({ message: "Title is required" });

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
      durationLabel: payload.durationLabel || "",
      price: Number(payload.price || 0),
      currency: payload.currency || "USD",
      coverImage: payload.image || payload.coverImage || "",
      gallery: payload.gallery || [],
      shortDescription: payload.shortDescription || "",
      description: payload.description || "",
      capacity: Number(payload.capacity || 20),
      availableSeats: Number(payload.availableSeats || payload.capacity || 20),
      featured: Boolean(payload.featured),
      status: payload.status || "draft",
      rating: Number(payload.rating || 4.8),
      reviewsCount: Number(payload.reviews || 0),
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
    const update = {
      ...payload,
      coverImage: payload.image || payload.coverImage,
      reviewsCount: payload.reviews,
      availableOptions: payload.availableOptions,
    };
    delete update.image;
    delete update.reviews;
    if (update.availableOptions === undefined) delete update.availableOptions;

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
