import { connectDb } from "../config/db.js";
import { Tour } from "../models/Tour.js";
import { tourPackageSeedData } from "./data/tourPackageSeedData.js";

const seedTourPackages = async () => {
  await connectDb();

  await Promise.all(
    tourPackageSeedData.map((item) =>
      Tour.findOneAndUpdate(
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

  console.log(`Seeded ${tourPackageSeedData.length} tour packages`);
  process.exit(0);
};

seedTourPackages().catch((error) => {
  console.error(error);
  process.exit(1);
});
