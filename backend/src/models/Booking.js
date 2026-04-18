import mongoose from "mongoose";

const adultTravelerSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: "" },
    age: { type: Number, min: 0, default: null },
    photo: { type: String, default: "" },
  },
  { _id: false },
);

const childrenAgeGroupSchema = new mongoose.Schema(
  {
    range: { type: String, default: "" },
    count: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const localIdentitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["cnic", "passport"], default: "cnic" },
    value: { type: String, default: "" },
  },
  { _id: false },
);

const internationalIdentitySchema = new mongoose.Schema(
  {
    country: { type: String, default: "" },
    passportNumber: { type: String, default: "" },
  },
  { _id: false },
);

const identitySchema = new mongoose.Schema(
  {
    travelerType: { type: String, enum: ["local", "international"], default: "local" },
    local: { type: localIdentitySchema, default: () => ({}) },
    international: { type: internationalIdentitySchema, default: () => ({}) },
  },
  { _id: false },
);

const facilitiesSchema = new mongoose.Schema(
  {
    hotelType: { type: String, default: "" },
    meals: { type: String, default: "" },
    vehicleType: { type: String, default: "" },
    addOns: { type: [String], default: [] },
  },
  { _id: false },
);

const customRequestSchema = new mongoose.Schema(
  {
    preferredDestinations: { type: [String], default: [] },
    sourceTourTitle: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    persons: { type: Number, min: 0, default: 0 },
    childrenBelowThree: { type: Number, min: 0, default: 0 },
    budget: { type: String, default: "" },
    budgetMode: { type: String, default: "" },
    hotelPreference: { type: String, default: "" },
    vehiclePreference: { type: String, default: "" },
    requirements: { type: String, default: "" },
  },
  { _id: false },
);

const customItinerarySchema = new mongoose.Schema(
  {
    planDays: {
      type: [
        new mongoose.Schema(
          {
            title: { type: String, default: "" },
            plan: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    title: { type: String, default: "" },
    route: { type: String, default: "" },
    durationLabel: { type: String, default: "" },
    finalBudget: { type: Number, default: 0 },
    currency: { type: String, default: "PKR" },
    hotelPlan: { type: String, default: "" },
    vehiclePlan: { type: String, default: "" },
    planDetails: { type: String, default: "" },
    status: { type: String, default: "draft" },
    savedAt: { type: Date, default: null },
  },
  { _id: false },
);

const manualPaymentSchema = new mongoose.Schema(
  {
    senderName: { type: String, default: "" },
    senderNumber: { type: String, default: "" },
    sentAmount: { type: Number, default: 0 },
    sentAt: { type: Date, default: null },
    slip: { type: String, default: "" },
    slipName: { type: String, default: "" },
  },
  { _id: false },
);

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    method: { type: String, default: "" },
    status: { type: String, default: "confirmed" },
    reference: { type: String, default: "" },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const pricingBreakdownSchema = new mongoose.Schema(
  {
    days: { type: Number, default: 1 },
    guests: { type: Number, default: 1 },
    baseTourTotal: { type: Number, default: 0 },
    baseDailyCharges: { type: Number, default: 0 },
    guestDailyCharges: { type: Number, default: 0 },
    hotelTotal: { type: Number, default: 0 },
    vehicleTotal: { type: Number, default: 0 },
    mealsTotal: { type: Number, default: 0 },
    insuranceTotal: { type: Number, default: 0 },
    airportTransferTotal: { type: Number, default: 0 },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true, uppercase: true },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    adultDetails: { type: [adultTravelerSchema], default: [] },
    childrenAgeGroups: { type: [childrenAgeGroupSchema], default: [] },
    travelDate: Date,
    travelTime: { type: String, default: "" },
    endDate: Date,
    flexibleDates: { type: Boolean, default: false },
    totalAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    currency: { type: String, default: "PKR" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Verification Pending", "Partially Paid", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "visa_card",
        "easypaisa",
        "jazzcash",
        "pay_on_arrival",
        "bank_transfer",
        "cash",
        "card",
        "bank",
      ],
      default: "visa_card",
    },
    paymentIntentId: { type: String, default: "" },
    paymentVerified: { type: Boolean, default: false },
    transactionReference: { type: String, default: "" },
    manualPayment: { type: manualPaymentSchema, default: () => ({}) },
    paymentHistory: { type: [paymentHistorySchema], default: [] },
    pricingBreakdown: { type: pricingBreakdownSchema, default: () => ({}) },
    specialRequirements: { type: String, default: "" },
    customRequirements: { type: String, default: "" },
    notes: { type: String, default: "" },
    identity: { type: identitySchema, default: () => ({}) },
    facilities: { type: facilitiesSchema, default: () => ({}) },
    customRequest: { type: customRequestSchema, default: () => ({}) },
    customItinerary: { type: customItinerarySchema, default: () => ({}) },
    groupSize: { type: Number, default: 1, min: 1 },
    bookingType: { type: String, enum: ["standard", "custom"], default: "standard" },
    isCustomTour: { type: Boolean, default: false },
    designedTour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    source: { type: String, enum: ["website", "admin"], default: "website" },
  },
  { timestamps: true },
);

bookingSchema.index({ bookingCode: 1, email: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);




