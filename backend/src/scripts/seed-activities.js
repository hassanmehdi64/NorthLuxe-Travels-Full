import { connectDb } from "../config/db.js";
import { ContentEntry } from "../models/ContentEntry.js";
import { activitySeedData } from "./data/activitySeedData.js";

const seedActivities = async () => {
  await connectDb();

  const activeSlugs = activitySeedData.map((item) => item.slug);

  await Promise.all(
    activitySeedData.map((item) =>
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
    type: "activity",
    slug: { $nin: activeSlugs },
  });

  console.log(`Seeded ${activitySeedData.length} activities`);
  process.exit(0);
};

seedActivities().catch((error) => {
  console.error(error);
  process.exit(1);
});
