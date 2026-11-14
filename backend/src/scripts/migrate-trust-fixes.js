/**
 * One-off data fixes for the "trust" pass (Phase 1).
 *
 *   node src/scripts/migrate-trust-fixes.js            # dry run: prints what would change
 *   node src/scripts/migrate-trust-fixes.js --apply    # writes a JSON backup, then applies
 *
 * 1. Removes the placeholder reviews that backfill-tour-reviews.js copied onto every
 *    tour (matched exactly by name + comment) and recomputes rating / count from what's left.
 * 2. Ensures every tour has a `places` array (empty → "Places covered" section is hidden).
 * 3. Fixes the "Baltisatan" typo in the site address.
 * 4. Clears the Khaplu destination cover, which showed a Hunza restaurant photo
 *    (the site now renders a branded "photo coming soon" placeholder instead).
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Tour } from "../models/Tour.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { ContentEntry } from "../models/ContentEntry.js";

const APPLY = process.argv.includes("--apply");

const PLACEHOLDER_REVIEWS = [
  ["Ayesha Khan", "Very smooth coordination, reliable stays, and great route planning."],
  ["Omar Ahmed", "Clean itinerary and good support. Overall experience was excellent."],
  ["Nida Fatima", "Loved the balance of comfort and exploration. Team stayed responsive."],
];
const isPlaceholderReview = (item) =>
  PLACEHOLDER_REVIEWS.some(([name, comment]) => item?.name === name && item?.comment === comment);

const WRONG_KHAPLU_COVER = "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp";

const run = async () => {
  await connectDb();

  const [tours, settings, khaplu] = await Promise.all([
    Tour.find().lean(),
    SiteSetting.findOne({ key: "default" }).lean(),
    ContentEntry.findOne({ type: "destination", slug: "khaplu" }).lean(),
  ]);

  const tourChanges = tours
    .map((tour) => {
      const reviewItems = (tour.reviewItems || []).filter((item) => !isPlaceholderReview(item));
      const count = reviewItems.length;
      const rating = count
        ? Number((reviewItems.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count).toFixed(1))
        : 0;
      const set = {};
      if (count !== (tour.reviewItems || []).length || tour.rating !== rating || tour.reviewsCount !== count) {
        Object.assign(set, { reviewItems, rating, reviewsCount: count });
      }
      if (!Array.isArray(tour.places)) set.places = [];
      return { tour, set };
    })
    .filter(({ set }) => Object.keys(set).length);

  const fixedAddress = String(settings?.address || "").replace(/Baltisatan/g, "Baltistan");
  const addressChange = settings && fixedAddress !== settings.address;
  const khapluChange = khaplu && khaplu.coverImage === WRONG_KHAPLU_COVER;

  console.log(`Mode: ${APPLY ? "APPLY" : "dry run"}`);
  tourChanges.forEach(({ tour, set }) => {
    console.log(
      `  tour ${tour.slug}: reviews ${(tour.reviewItems || []).length} → ${set.reviewItems?.length ?? "unchanged"},` +
        ` rating ${tour.rating} → ${set.rating ?? "unchanged"}${set.places ? ", places → []" : ""}`,
    );
  });
  if (addressChange) console.log(`  settings.address: "${settings.address}" → "${fixedAddress}"`);
  if (khapluChange) console.log(`  destination khaplu.coverImage: "${khaplu.coverImage}" → ""`);
  if (!tourChanges.length && !addressChange && !khapluChange) console.log("  Nothing to change.");

  if (!APPLY) return;

  const backupDir = path.resolve("backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `trust-fixes-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        tours: tourChanges.map(({ tour }) => ({
          _id: tour._id,
          slug: tour.slug,
          reviewItems: tour.reviewItems,
          rating: tour.rating,
          reviewsCount: tour.reviewsCount,
          places: tour.places,
        })),
        settings: settings ? { _id: settings._id, address: settings.address } : null,
        khaplu: khaplu ? { _id: khaplu._id, coverImage: khaplu.coverImage } : null,
      },
      null,
      2,
    ),
  );
  console.log(`Backup written: ${backupFile}`);

  for (const { tour, set } of tourChanges) {
    await Tour.updateOne({ _id: tour._id }, { $set: set });
  }
  if (addressChange) await SiteSetting.updateOne({ _id: settings._id }, { $set: { address: fixedAddress } });
  if (khapluChange) await ContentEntry.updateOne({ _id: khaplu._id }, { $set: { coverImage: "" } });
  console.log("Applied.");
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
