import { connectDb } from "../config/db.js";
import { Tour } from "../models/Tour.js";

const defaultTourReviewItems = [
  {
    name: "Ayesha Khan",
    rating: 5,
    date: "Jan 2026",
    tag: "Family Trip",
    comment: "Very smooth coordination, reliable stays, and great route planning.",
  },
  {
    name: "Omar Ahmed",
    rating: 4,
    date: "Dec 2025",
    tag: "Friends Group",
    comment: "Clean itinerary and good support. Overall experience was excellent.",
  },
  {
    name: "Nida Fatima",
    rating: 5,
    date: "Nov 2025",
    tag: "Couple Tour",
    comment: "Loved the balance of comfort and exploration. Team stayed responsive.",
  },
];

const backfillTourReviews = async () => {
  await connectDb();

  const tours = await Tour.find({
    $or: [
      { reviewItems: { $exists: false } },
      { reviewItems: { $size: 0 } },
    ],
  });

  for (const tour of tours) {
    tour.reviewItems = defaultTourReviewItems;
    tour.rating = 4.7;
    tour.reviewsCount = defaultTourReviewItems.length;
    await tour.save();
  }

  console.log(`Backfilled reviews for ${tours.length} tours`);
  process.exit(0);
};

backfillTourReviews().catch((error) => {
  console.error(error);
  process.exit(1);
});
