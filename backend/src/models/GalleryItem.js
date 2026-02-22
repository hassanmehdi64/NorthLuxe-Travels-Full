import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { timestamps: true },
);

galleryItemSchema.index({ category: 1, title: "text" });

export const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);
