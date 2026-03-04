import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const contentEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "destination",
        "activity",
        "service",
        "career",
        "faq",
        "help-center",
        "privacy-policy",
        "terms-of-service",
      ],
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    eyebrow: { type: String, trim: true, default: "" },
    highlight: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    content: { type: String, trim: true, default: "" },
    coverImage: { type: String, trim: true, default: "" },
    gallery: { type: [String], default: [] },
    location: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    duration: { type: String, trim: true, default: "" },
    level: { type: String, trim: true, default: "" },
    question: { type: String, trim: true, default: "" },
    answer: { type: String, trim: true, default: "" },
    highlights: { type: [String], default: [] },
    features: { type: [String], default: [] },
    includes: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    blocks: { type: [blockSchema], default: [] },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

contentEntrySchema.index({
  title: "text",
  shortDescription: "text",
  description: "text",
  content: "text",
  location: "text",
  category: "text",
  question: "text",
  answer: "text",
});

export const ContentEntry = mongoose.model("ContentEntry", contentEntrySchema);
