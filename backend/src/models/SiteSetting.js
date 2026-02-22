import mongoose from "mongoose";

const pricedOptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    dailyRate: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    siteName: { type: String, default: "North Luxe" },
    siteEmail: { type: String, default: "info@northluxetravels.com" },
    sitePhone: { type: String, default: "" },
    address: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    maintenanceMode: { type: Boolean, default: false },
    primaryColor: { type: String, default: "#0D8ABC" },
    seoTitle: { type: String, default: "North Luxe | Luxury Travel" },
    seoDescription: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    bookingPricing: {
      dailyBaseFee: { type: Number, default: 0, min: 0 },
      perGuestDailyFee: { type: Number, default: 0, min: 0 },
      mealsDailyRate: { type: Number, default: 0, min: 0 },
      insuranceRate: { type: Number, default: 0, min: 0 },
      airportTransferRate: { type: Number, default: 0, min: 0 },
      hotelCategories: {
        type: [pricedOptionSchema],
        default: [
          { key: "no_hotel", label: "No Hotel", dailyRate: 0, active: true },
          { key: "standard", label: "Standard", dailyRate: 35, active: true },
          { key: "3_star", label: "3-Star", dailyRate: 65, active: true },
          { key: "4_star", label: "4-Star", dailyRate: 95, active: true },
          { key: "5_star", label: "5-Star", dailyRate: 145, active: true },
        ],
      },
      vehicleTypes: {
        type: [pricedOptionSchema],
        default: [
          { key: "standard_suv", label: "Standard SUV", dailyRate: 40, active: true },
          { key: "premium_suv", label: "Premium SUV", dailyRate: 70, active: true },
          { key: "executive_van", label: "Executive Van", dailyRate: 85, active: true },
          { key: "luxury_4x4", label: "Luxury 4x4", dailyRate: 120, active: true },
        ],
      },
    },
    paymentConfig: {
      allowManualVerification: { type: Boolean, default: true },
      requireVerifiedPaymentForCard: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
