import dotenv from "dotenv";

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);
const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const defaultOrigins = [
  "http://localhost:5173",
  "https://north-luxe-travels-frontend.vercel.app",
  "https://north-luxe.vercel.app",
  "https://northluxe.vercel.app",
];

const defaultOriginPatterns = [/^https:\/\/[a-z0-9-]+\.vercel\.app$/i];

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    (isVercel ? "" : "mongodb://127.0.0.1:27017/north-luxe"),
  mongoUriFallback: process.env.MONGODB_URI_FALLBACK || "",

  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  clientOrigins: Array.from(new Set([...configuredOrigins, ...defaultOrigins])),
  clientOriginPatterns: defaultOriginPatterns,
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@northluxe.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_FROM || "no-reply@northluxe.com",
  smtpHost: process.env.SMTP_HOST || process.env.EMAIL_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || "false") === "true",
  smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  smtpPass:
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  jazzCashMerchantId: process.env.JAZZCASH_MERCHANT_ID || "",
  jazzCashPassword: process.env.JAZZCASH_PASSWORD || "",
  jazzCashIntegritySalt: process.env.JAZZCASH_INTEGRITY_SALT || "",
  jazzCashRedirectUrl:
    process.env.JAZZCASH_REDIRECT_URL ||
    "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
  jazzCashReturnUrl: process.env.JAZZCASH_RETURN_URL || "",
  jazzCashSandboxMode: String(process.env.JAZZCASH_SANDBOX_MODE || "true") !== "false",
};
