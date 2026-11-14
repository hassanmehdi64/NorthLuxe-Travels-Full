/**
 * Test harness: an in-memory MongoDB + the real Express app on a random port.
 *
 * Safety: env vars are set explicitly BEFORE any app module is imported, .env is not
 * loaded under NODE_ENV=test (see config/env.js), SMTP/Stripe are blank, and we assert
 * that the connected database is local before any test touches data.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";

// mongodb-memory-server has no binary mapping for Ubuntu releases newer than 24.04 yet.
if (!process.env.MONGOMS_DISTRO && fs.existsSync("/etc/os-release")) {
  const release = fs.readFileSync("/etc/os-release", "utf8");
  const version = Number((release.match(/^VERSION_ID="?([\d.]+)/m) || [])[1]);
  if (/^ID=ubuntu$/m.test(release) && version > 24.04) process.env.MONGOMS_DISTRO = "ubuntu-24.04";
}

export const TEST_JWT_SECRET = crypto.randomBytes(48).toString("base64url");
export const TEST_JAZZCASH_SALT = "test-integrity-salt";

export const startTestApp = async () => {
  const mongo = await MongoMemoryServer.create();

  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGODB_URI: mongo.getUri("north-luxe-test"),
    MONGODB_URI_FALLBACK: "",
    JWT_SECRET: TEST_JWT_SECRET,
    SMTP_HOST: "",
    SMTP_USER: "",
    SMTP_PASS: "",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    JAZZCASH_MERCHANT_ID: "TEST_MERCHANT",
    JAZZCASH_PASSWORD: "test-password",
    JAZZCASH_INTEGRITY_SALT: TEST_JAZZCASH_SALT,
  });

  const { connectDb } = await import("../../src/config/db.js");
  const connection = await connectDb();
  assert.equal(connection.host, "127.0.0.1", "tests must only ever run against the local in-memory database");

  const { default: app } = await import("../../src/app.js");
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const { User } = await import("../../src/models/User.js");
  const jwt = (await import("jsonwebtoken")).default;

  const createUser = async ({ role = "Editor", name = `${role} User`, email } = {}) => {
    const user = await User.create({
      name,
      email: email || `${role.toLowerCase()}-${crypto.randomUUID()}@test.local`,
      passwordHash: await User.hashPassword("Test-Password-123!"),
      role,
      status: "Active",
    });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, TEST_JWT_SECRET, { expiresIn: "1h" });
    return { user, token };
  };

  const request = async (method, path, { body, token, form } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (form) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      payload = new URLSearchParams(form).toString();
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = typeof body === "string" ? body : JSON.stringify(body);
    }
    const res = await fetch(baseUrl + path, { method, headers, body: payload });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* html or empty */ }
    return { status: res.status, json, text };
  };

  const stop = async () => {
    await new Promise((resolve) => server.close(resolve));
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
    await mongo.stop();
  };

  return { baseUrl, request, createUser, stop };
};

/** A minimal published tour (price is a per-day rate). */
export const createTour = async (overrides = {}) => {
  const { Tour } = await import("../../src/models/Tour.js");
  return Tour.create({
    title: "Test Hunza Tour",
    slug: `test-hunza-${crypto.randomUUID().slice(0, 8)}`,
    location: "Hunza",
    durationDays: 3,
    price: 10000,
    discountPercent: 0,
    currency: "PKR",
    coverImage: "https://example.com/cover.jpg",
    status: "published",
    capacity: 10,
    availableSeats: 10,
    ...overrides,
  });
};
