import test from "node:test";
import assert from "node:assert/strict";
import { homeDestinations, featuredTours, contentCards, internationalDestinations } from "./homeData.mjs";

test("homepage keeps published CMS destination images, copy, and detail routes", () => {
  const result = homeDestinations([{ location: "Fallback", image: "fallback.jpg" }], [
    { id: "cms-1", slug: "shigar", title: "Shigar", coverImage: "/uploads/shigar.jpg", shortDescription: "CMS description", status: "published" },
    { slug: "draft", title: "Draft", status: "draft" },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].image, "/uploads/shigar.jpg");
  assert.equal(result[0].description, "CMS description");
  assert.equal(result[0].href, "/destinations/shigar");
});

test("tour-derived destinations remain available when the CMS list is empty", () => {
  const result = homeDestinations([{ id: "tour-1", location: "Hunza", image: "/tour.jpg", title: "Hunza escape" }]);
  assert.equal(result[0].title, "Hunza");
  assert.equal(result[0].image, "/tour.jpg");
  assert.equal(result[0].href, "/destinations/hunza");
});

test("featured packages retain original price, availability, and identity", () => {
  const tour = { id: "real-id", slug: "real-tour", featured: true, price: 72000, currency: "PKR", availableSeats: 0 };
  assert.deepEqual(featuredTours([{ id: "ordinary" }, tour, { id: "draft", featured: true, status: "draft" }]), [tour]);
  assert.equal(featuredTours([]).length, 0);
  assert.equal(featuredTours([{ id: "ordinary" }])[0].id, "ordinary");
});

test("activity and service links target published item details", () => {
  const item = { id: "item-1", slug: "guided-hike", coverImage: "/cms/hike.jpg", shortDescription: "A guided hike" };
  assert.equal(contentCards([item], "activities")[0].href, "/activities/guided-hike");
  assert.equal(contentCards([item], "services")[0].image, "/cms/hike.jpg");
  assert.deepEqual(contentCards([], "services"), []);
});

test("international section uses CMS classifications rather than fabricated destinations", () => {
  const entries = [{ slug: "hunza", meta: { country: "Pakistan" } }, { slug: "turkey", meta: { country: "Turkey" } }, { slug: "dubai", category: "International tours" }];
  assert.deepEqual(internationalDestinations(entries).map((item) => item.slug), ["turkey", "dubai"]);
  assert.deepEqual(internationalDestinations([]), []);
});
