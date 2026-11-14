import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createTour, futureDate, startTestApp } from "./helpers/testApp.js";

let app;
let User;
let Booking;
let Tour;

before(async () => {
  app = await startTestApp();
  ({ User } = await import("../src/models/User.js"));
  ({ Booking } = await import("../src/models/Booking.js"));
  ({ Tour } = await import("../src/models/Tour.js"));
});
after(async () => app.stop());

describe("Role escalation via PATCH /api/users/:id", () => {
  test('the "$set" exploit is rejected and the Editor stays an Editor', async () => {
    const { user, token } = await app.createUser({ role: "Editor" });
    const res = await app.request("PATCH", `/api/users/${user._id}`, { token, body: { $set: { role: "Admin" } } });
    assert.equal(res.status, 400);
    assert.equal((await User.findById(user._id)).role, "Editor");
  });

  test("operator keys nested deeper in the body are rejected too", async () => {
    const { user, token } = await app.createUser({ role: "Editor" });
    const res = await app.request("PATCH", `/api/users/${user._id}`, { token, body: { name: "x", avatar: { $gt: "" } } });
    assert.equal(res.status, 400);
  });

  test("an Editor cannot change their own role or status", async () => {
    const { user, token } = await app.createUser({ role: "Editor" });
    const res = await app.request("PATCH", `/api/users/${user._id}`, { token, body: { role: "Admin" } });
    assert.equal(res.status, 403);
    assert.equal((await User.findById(user._id)).role, "Editor");
  });

  test("an Admin cannot change their own role", async () => {
    const { user, token } = await app.createUser({ role: "Admin" });
    const res = await app.request("PATCH", `/api/users/${user._id}`, { token, body: { role: "Editor" } });
    assert.equal(res.status, 403);
  });

  test("an Editor cannot edit another user", async () => {
    const { token } = await app.createUser({ role: "Editor" });
    const { user: other } = await app.createUser({ role: "Editor" });
    const res = await app.request("PATCH", `/api/users/${other._id}`, { token, body: { name: "Hacked" } });
    assert.equal(res.status, 403);
  });

  test("passwordHash and timestamps in the body are ignored", async () => {
    const { user, token } = await app.createUser({ role: "Editor" });
    const before = await User.findById(user._id);
    const res = await app.request("PATCH", `/api/users/${user._id}`, {
      token,
      body: { name: "New Name", passwordHash: "attacker-hash", createdAt: "2000-01-01" },
    });
    assert.equal(res.status, 200);
    const after = await User.findById(user._id);
    assert.equal(after.name, "New Name");
    assert.equal(after.passwordHash, before.passwordHash);
    assert.equal(after.createdAt.getTime(), before.createdAt.getTime());
  });

  test("an Admin can change another user's role", async () => {
    const { token } = await app.createUser({ role: "Admin" });
    const { user: other } = await app.createUser({ role: "Editor" });
    const res = await app.request("PATCH", `/api/users/${other._id}`, { token, body: { role: "Admin" } });
    assert.equal(res.status, 200);
    assert.equal((await User.findById(other._id)).role, "Admin");
  });
});

describe("Other update endpoints use field whitelists", () => {
  test("PATCH /api/bookings/:id ignores payment fields", async () => {
    const tour = await createTour();
    const created = await app.request("POST", "/api/bookings/public", {
      body: { tourId: tour._id.toString(), customerName: "C", email: "c@test.local", adults: 1, travelDate: futureDate() },
    });
    const { token } = await app.createUser({ role: "Admin" });
    const res = await app.request("PATCH", `/api/bookings/${created.json.item.id}`, {
      token,
      body: { adminNote: "checked", paidAmount: 999999, paymentVerified: true, paymentStatus: "Paid", totalAmount: 1 },
    });
    assert.equal(res.status, 200);
    const booking = await Booking.findById(created.json.item.id);
    assert.equal(booking.adminNote, "checked");
    assert.equal(booking.paidAmount, 0);
    assert.equal(booking.paymentVerified, false);
    assert.notEqual(booking.paymentStatus, "Paid");
    assert.notEqual(booking.totalAmount, 1);
  });

  test("PATCH /api/tours/:id cannot set rating directly, even via $set", async () => {
    const tour = await createTour();
    const { token } = await app.createUser({ role: "Editor" });
    const viaSet = await app.request("PATCH", `/api/tours/${tour._id}`, { token, body: { $set: { rating: 5, reviewsCount: 99 } } });
    assert.equal(viaSet.status, 400);
    const direct = await app.request("PATCH", `/api/tours/${tour._id}`, { token, body: { rating: 5, reviewsCount: 99, title: "Renamed" } });
    assert.equal(direct.status, 200);
    const stored = await Tour.findById(tour._id);
    assert.equal(stored.rating, 0);
    assert.equal(stored.reviewsCount, 0);
  });

  test("the public contact form cannot set status or fake replies", async () => {
    const { ContactMessage } = await import("../src/models/ContactMessage.js");
    const res = await app.request("POST", "/api/contacts/public", {
      body: { sender: "S", email: "s@test.local", subject: "Hi", message: "Hello", status: "Replied", replies: [{ message: "fake" }] },
    });
    assert.equal(res.status, 201);
    const stored = await ContactMessage.findOne({ email: "s@test.local" });
    assert.notEqual(stored.status, "Replied");
    assert.equal(stored.replies.length, 0);
  });
});
