import { env } from "./env.js";

/**
 * Startup checks for secrets. They throw with a clear message and never print
 * the secret value itself.
 */

const KNOWN_WEAK_VALUES = new Set([
  "change-me",
  "changeme",
  "secret",
  "jwt-secret",
  "jwt_secret",
  "your-secret",
  "your_jwt_secret",
  "replace-me",
  "password",
  "admin@123",
  "admin123",
]);

export const MIN_JWT_SECRET_LENGTH = 32;

const isPlaceholder = (value) => /^<.*>$/s.test(String(value || "").trim());

export const getJwtSecretProblem = (value) => {
  const secret = String(value || "");
  if (!secret) return "JWT_SECRET is not set.";
  if (isPlaceholder(secret)) return "JWT_SECRET still contains the .env.example placeholder.";
  if (KNOWN_WEAK_VALUES.has(secret.toLowerCase())) return "JWT_SECRET is a known default/placeholder value.";
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    return `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters (got ${secret.length}).`;
  }
  if (new Set(secret).size < 10) return "JWT_SECRET is too repetitive; use a random value.";
  return "";
};

export const getAdminPasswordProblem = (value) => {
  const password = String(value || "");
  if (!password) return "ADMIN_PASSWORD is not set.";
  if (isPlaceholder(password)) return "ADMIN_PASSWORD still contains the .env.example placeholder.";
  if (KNOWN_WEAK_VALUES.has(password.toLowerCase())) return "ADMIN_PASSWORD is a known default value.";
  if (password.length < 12) return "ADMIN_PASSWORD must be at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "ADMIN_PASSWORD must mix upper and lower case letters, a digit and a symbol.";
  }
  return "";
};

const fail = (problem, hint) => {
  const error = new Error(`[config] ${problem} ${hint}`.trim());
  error.code = "WEAK_CONFIG";
  throw error;
};

/** Called when the API starts (server.js and the Vercel entry, via app.js). */
export const validateServerEnv = () => {
  const jwtProblem = getJwtSecretProblem(env.jwtSecret);
  if (jwtProblem) {
    fail(jwtProblem, 'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"');
  }
};

/** Called by seed/create-admin scripts before they create an admin account. */
export const requireAdminSeedCredentials = () => {
  const email = String(env.adminEmail || "").toLowerCase().trim();
  if (!email) fail("ADMIN_EMAIL is not set.", "Set it in backend/.env before seeding.");
  const passwordProblem = getAdminPasswordProblem(env.adminPassword);
  if (passwordProblem) fail(passwordProblem, "Set a strong ADMIN_PASSWORD in backend/.env before seeding.");
  return { email, password: String(env.adminPassword) };
};

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

export const isLocalMongoUri = (uri) => {
  const match = String(uri || "").match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?]+)/i);
  if (!match) return false;
  const hosts = match[1].split(",").map((host) => host.replace(/:\d+$/, "").toLowerCase());
  return hosts.length > 0 && hosts.every((host) => LOCAL_HOSTS.has(host));
};

/**
 * Seed scripts delete and recreate data. Refuse to run them against anything but a
 * local database unless the operator explicitly opts in for this one run.
 */
export const assertSafeSeedTarget = (scriptName) => {
  if (isLocalMongoUri(env.mongoUri)) return;
  if (process.env.ALLOW_REMOTE_SEED === "yes-i-understand") {
    console.warn(`[${scriptName}] ALLOW_REMOTE_SEED set: running against a REMOTE database.`);
    return;
  }
  fail(
    `${scriptName} refuses to run against a non-local MongoDB (MONGODB_URI is remote).`,
    "Point MONGODB_URI at a local/dev database, or set ALLOW_REMOTE_SEED=yes-i-understand for a deliberate one-off run.",
  );
};
