import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    authorName: { type: String, default: "Admin" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true },
);

blogSchema.index({ title: "text", category: "text", excerpt: "text" });

export const Blog = mongoose.model("Blog", blogSchema);
