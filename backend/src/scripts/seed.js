import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Blog } from "../models/Blog.js";
import { Booking } from "../models/Booking.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { GalleryItem } from "../models/GalleryItem.js";
import { Notification } from "../models/Notification.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { Testimonial } from "../models/Testimonial.js";
import { Tour } from "../models/Tour.js";
import { User } from "../models/User.js";

const seed = async () => {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Tour.deleteMany({}),
    Blog.deleteMany({}),
    Booking.deleteMany({}),
    GalleryItem.deleteMany({}),
    ContactMessage.deleteMany({}),
    Notification.deleteMany({}),
    Testimonial.deleteMany({}),
    SiteSetting.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: env.adminEmail,
    passwordHash: await User.hashPassword(env.adminPassword),
    role: "Admin",
    status: "Active",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
  });

  const editor = await User.create({
    name: "Sarah Editor",
    email: "editor@northluxe.com",
    passwordHash: await User.hashPassword("Editor@123"),
    role: "Editor",
    status: "Active",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Editor&background=7c3aed&color=fff",
  });

  const tours = await Tour.insertMany([
    {
      title: "Hunza Luxury Escape",
      slug: "hunza-luxury-escape",
      location: "Hunza Valley",
      durationDays: 5,
      durationLabel: "5 Days / 4 Nights",
      price: 1450,
      currency: "USD",
      coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      shortDescription: "Premium mountain retreat with private transport.",
      description: "A curated luxury journey through Hunza Valley.",
      featured: true,
      status: "published",
      availableSeats: 12,
    },
    {
      title: "Skardu Explorer Tour",
      slug: "skardu-explorer-tour",
      location: "Skardu",
      durationDays: 7,
      durationLabel: "7 Days / 6 Nights",
      price: 1950,
      currency: "USD",
      coverImage:
        "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      shortDescription: "High-altitude lakes and resorts in Skardu.",
      description: "Explore Skardu with guided excursions.",
      featured: true,
      status: "published",
      availableSeats: 18,
    },
  ]);

  await Blog.insertMany([
    {
      title: "Best Time to Visit Gilgit-Baltistan",
      slug: "best-time-to-visit-gilgit-baltistan",
      category: "Guides",
      excerpt: "Discover the ideal seasons for mountain travel.",
      content: "Gilgit-Baltistan offers distinct seasons for travelers.",
      coverImage:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      status: "published",
      authorName: admin.name,
      publishedAt: new Date(),
    },
    {
      title: "Packing Essentials for Northern Tours",
      slug: "packing-essentials-northern-tours",
      category: "Travel Tips",
      excerpt: "Exactly what to carry for luxury tours.",
      content: "Layering, hydration and weather planning are key.",
      coverImage:
        "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800",
      status: "draft",
      authorName: editor.name,
    },
  ]);

  await GalleryItem.insertMany([
    {
      title: "Hunza Valley",
      category: "Nature",
      url: "https://images.unsplash.com/photo-1548062005-e50d063943ef?q=80&w=500",
    },
    {
      title: "Skardu Resort",
      category: "Luxury",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=500",
    },
  ]);

  await Booking.create({
    bookingCode: "BK-9901",
    tour: tours[0]._id,
    customerName: "Ali Khan",
    email: "ali.k@example.com",
    phone: "+92 300 1234567",
    adults: 2,
    children: 0,
    status: "pending",
    paymentStatus: "Paid",
    totalAmount: 1450,
    currency: "USD",
    source: "website",
  });

  await ContactMessage.create({
    sender: "Zain Ahmed",
    email: "zain@example.com",
    phone: "+92 300 1234567",
    subject: "Group Tour Inquiry - Skardu",
    message: "Do you offer corporate discounts for 10 travelers?",
    urgency: "High",
  });

  await SiteSetting.create({
    key: "default",
    siteName: "North Luxe",
    siteEmail: "info@northluxetravels.com",
    sitePhone: "+92 300 1234567",
    address: "Main Chowk Danyore, Gilgit-Baltistan",
    currency: "USD",
  });

  await Notification.insertMany([
    {
      type: "Bookings",
      title: "New Booking Alert",
      message: "Ali Khan requested Hunza Luxury Escape.",
    },
    {
      type: "System",
      title: "System Ready",
      message: "Seed data inserted successfully.",
      isRead: true,
    },
  ]);

  await Testimonial.insertMany([
    {
      name: "Sarah Khan",
      role: "Travel Blogger",
      city: "Lahore",
      country: "Pakistan",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      message: "North Luxe made our trip unforgettable. Every detail felt premium and effortless.",
      rating: 5,
      reviewDate: new Date("2026-01-09"),
      status: "published",
    },
    {
      name: "Ali Raza",
      role: "Adventurer",
      city: "Karachi",
      country: "Pakistan",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      message: "The Karakoram itinerary was sharp, reliable, and exceptionally well-managed.",
      rating: 5,
      reviewDate: new Date("2026-01-06"),
      status: "published",
    },
    {
      name: "Fatima Noor",
      role: "Photographer",
      city: "Islamabad",
      country: "Pakistan",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      message: "From sunrise spots to boutique stays, the experience felt curated for storytellers.",
      rating: 5,
      reviewDate: new Date("2025-12-28"),
      status: "published",
    },
  ]);

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
