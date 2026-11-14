import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMediaList } from "./mediaList.mjs";

const upload = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

test("keeps an embedded upload whole when the box is split on commas", () => {
  assert.deepEqual(parseMediaList(`https://a.test/1.jpg, ${upload}\nhttps://a.test/2.jpg`), ["https://a.test/1.jpg", upload, "https://a.test/2.jpg"]);
});

test("repairs a list that was already saved in two halves", () => {
  assert.deepEqual(parseMediaList(["data:image/jpeg;base64", "/9j/4AAQSkZJRg==", "https://a.test/1.jpg"]), [upload, "https://a.test/1.jpg"]);
});

test("drops a dangling data header, blanks and duplicates", () => {
  assert.deepEqual(parseMediaList(["https://a.test/1.jpg", " ", "https://a.test/1.jpg", "data:image/png;base64"]), ["https://a.test/1.jpg"]);
});
