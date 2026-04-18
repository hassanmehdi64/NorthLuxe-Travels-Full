import { connectDb } from "../config/db.js";
import { ContentEntry } from "../models/ContentEntry.js";
import { serviceSeedData } from "./data/serviceSeedData.js";

const seedServices = async () => {
  await connectDb();

  const activeSlugs = serviceSeedData.map((item) => item.slug);

  await Promise.all(
    serviceSeedData.map((item) =>
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
    type: "service",
    slug: { $nin: activeSlugs },
  });

  console.log(`Seeded ${serviceSeedData.length} services`);
  process.exit(0);
};

seedServices().catch((error) => {
  console.error(error);
  process.exit(1);
});
