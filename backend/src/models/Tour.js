import mongoose from "mongoose";

const itineraryItemSchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    description: String,
  },
  { _id: false },
);

const availableOptionsSchema = new mongoose.Schema(
  {
    hotelCategories: { type: [String], default: [] },
    vehicleTypes: { type: [String], default: [] },
  },
  { _id: false },
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    location: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    durationLabel: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    coverImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    capacity: { type: Number, default: 20 },
    availableSeats: { type: Number, default: 20 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    itinerary: { type: [itineraryItemSchema], default: [] },
    availableOptions: { type: availableOptionsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

tourSchema.index({ title: "text", location: "text", tags: "text" });

export const Tour = mongoose.model("Tour", tourSchema);
