import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createTour, startTestApp } from "./helpers/testApp.js";

let app;
let editor;

before(async () => {
  app = await startTestApp();
  editor = await app.createUser({ role: "Editor", name: "Tour Editor" });
});
after(async () => app.stop());

describe("Tour inclusions / exclusions", () => {
  test("an editor can set them; lists are trimmed, de-blanked and returned publicly", async () => {
    const tour = await createTour();
    const res = await app.request("PATCH", `/api/tours/${tour._id}`, {
      token: editor.token,
      body: { inclusions: ["  Private transport ", "", "Driver"], exclusions: ["Flights", "   "] },
    });
    assert.equal(res.status, 200);

    const pub = await app.request("GET", `/api/tours/${tour.slug}/public`);
    assert.equal(pub.status, 200);
    assert.deepEqual(pub.json.item.inclusions, ["Private transport", "Driver"]);
    assert.deepEqual(pub.json.item.exclusions, ["Flights"]);
  });

  test("tours without them return empty lists (the page hides the section)", async () => {
    const tour = await createTour();
    const pub = await app.request("GET", `/api/tours/${tour.slug}/public`);
    assert.deepEqual(pub.json.item.inclusions, []);
    assert.deepEqual(pub.json.item.exclusions, []);
  });
});

describe("Seat availability endpoint", () => {
  test("requires a valid date", async () => {
    const tour = await createTour();
    const res = await app.request("GET", `/api/tours/${tour.slug}/availability?date=not-a-date`);
    assert.equal(res.status, 400);
  });

  test("returns capacity and seats left for a published tour", async () => {
    const tour = await createTour({ capacity: 7 });
    const res = await app.request("GET", `/api/tours/${tour.slug}/availability?date=2030-01-15`);
    assert.equal(res.status, 200);
    assert.equal(res.json.capacity, 7);
    assert.equal(res.json.available, 7);
  });
});
