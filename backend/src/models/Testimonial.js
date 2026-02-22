import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "Guest", trim: true },
    city: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    featured: { type: Boolean, default: true },
    reviewDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true },
);

testimonialSchema.index({ name: "text", role: "text", message: "text" });

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
