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

const paymentMethodConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    accountKey: { type: String, default: "", trim: true },
    referenceLabel: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const receivingAccountSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    accountTitle: { type: String, default: "", trim: true },
    accountNumber: { type: String, default: "", trim: true },
    bankName: { type: String, default: "", trim: true },
    contactNumber: { type: String, default: "", trim: true },
    iban: { type: String, default: "", trim: true },
    branchCode: { type: String, default: "", trim: true },
    swiftCode: { type: String, default: "", trim: true },
    beneficiaryAddress: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
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
    currency: { type: String, default: "PKR" },
    maintenanceMode: { type: Boolean, default: false },
    primaryColor: { type: String, default: "#13DDB4" },
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
    homeHeroImages: {
      type: [String],
      default: [
        "/gb.jpg",
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
        "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
        "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
      ],
    },
    pageHeroImages: {
      tours: { type: String, default: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg" },
      about: { type: String, default: "https://www.travelertrails.com/wp-content/uploads/2022/11/Gilgit-Baltistan-4.jpg" },
      blog: { type: String, default: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg" },
      contact: { type: String, default: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg" },
    },
    heroColors: {
      overlay: { type: String, default: "rgba(0, 0, 0, 0.45)" },
      start: { type: String, default: "rgba(7, 19, 38, 0.9)" },
      middle: { type: String, default: "rgba(7, 19, 38, 0.6)" },
      end: { type: String, default: "rgba(7, 19, 38, 0.2)" },
      homeStart: { type: String, default: "rgba(5, 8, 12, 0.24)" },
      homeEnd: { type: String, default: "rgba(5, 8, 12, 0.56)" },
    },
    navbarColors: {
      main: { type: String, default: "rgba(9, 20, 41, 0.88)" },
      scrolled: { type: String, default: "rgba(9, 20, 41, 0.94)" },
      mobile: { type: String, default: "rgba(9, 20, 41, 0.985)" },
    },
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
      methods: {
        type: [paymentMethodConfigSchema],
        default: [
          { key: "visa_card", label: "Debit Card", active: true, accountKey: "", referenceLabel: "", instructions: "" },
          { key: "easypaisa", label: "EasyPaisa", active: true, accountKey: "", referenceLabel: "Transaction ID", instructions: "" },
          { key: "jazzcash", label: "JazzCash", active: true, accountKey: "", referenceLabel: "Transaction ID", instructions: "" },
          { key: "bank_transfer", label: "Bank Transfer", active: true, accountKey: "", referenceLabel: "Transfer Reference", instructions: "" },
          { key: "pay_on_arrival", label: "Pay on Arrival", active: true, accountKey: "", referenceLabel: "", instructions: "" },
        ],
      },
      accounts: {
        type: [receivingAccountSchema],
        default: [],
      },
    },
  },
  { timestamps: true },
);

export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);


