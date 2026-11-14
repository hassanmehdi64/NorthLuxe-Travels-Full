import { connectDb } from "../config/db.js";
import { assertSafeSeedTarget } from "../config/validateEnv.js";
import { ContentEntry } from "../models/ContentEntry.js";
import { destinationSeedData } from "./data/destinationSeedData.js";

const seedDestinations = async () => {
  assertSafeSeedTarget("seed-destinations");
  await connectDb();

  const activeSlugs = destinationSeedData.map((item) => item.slug);

  await Promise.all(
    destinationSeedData.map((item) =>
      ContentEntry.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ),
    ),
  );

  await ContentEntry.deleteMany({
    type: "destination",
    slug: { $nin: activeSlugs },
  });

  console.log(`Seeded ${destinationSeedData.length} destinations`);
  process.exit(0);
};

seedDestinations().catch((error) => {
  console.error(error);
  process.exit(1);
});

