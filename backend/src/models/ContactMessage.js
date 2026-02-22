import mongoose from "mongoose";

const contactReplySchema = new mongoose.Schema(
  {
    message: String,
    repliedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const contactMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Unread", "Replied"], default: "Unread" },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    replies: { type: [contactReplySchema], default: [] },
  },
  { timestamps: true },
);

contactMessageSchema.index({ sender: "text", subject: "text", message: "text" });

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
