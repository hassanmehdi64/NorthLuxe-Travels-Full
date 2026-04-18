import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Blog } from "../models/Blog.js";
import { Booking } from "../models/Booking.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { ContentEntry } from "../models/ContentEntry.js";
import { GalleryItem } from "../models/GalleryItem.js";
import { Notification } from "../models/Notification.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { Testimonial } from "../models/Testimonial.js";
import { Tour } from "../models/Tour.js";
import { User } from "../models/User.js";
import { destinationSeedData } from "./data/destinationSeedData.js";
import { activitySeedData } from "./data/activitySeedData.js";
import { serviceSeedData } from "./data/serviceSeedData.js";

const seed = async () => {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Tour.deleteMany({}),
    Blog.deleteMany({}),
    Booking.deleteMany({}),
    GalleryItem.deleteMany({}),
    ContactMessage.deleteMany({}),
    ContentEntry.deleteMany({}),
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
      currency: "PKR",
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
      currency: "PKR",
      coverImage:
        "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      shortDescription: "High-altitude lakes and resorts in Skardu.",
      description: "Explore Skardu with guided excursions.",
      featured: true,
      status: "published",
      availableSeats: 18,
    },
    {
      title: "Nagar and Hunza Panorama",
      slug: "nagar-hunza-panorama",
      location: "Nagar Valley",
      durationDays: 6,
      durationLabel: "6 Days / 5 Nights",
      price: 1680,
      currency: "PKR",
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      shortDescription: "A balanced itinerary across Nagar viewpoints and Hunza heritage routes.",
      description: "Designed for travelers who want both panoramic scenery and relaxed pacing.",
      featured: true,
      status: "published",
      availableSeats: 14,
      tags: ["Scenic", "Family", "Heritage"],
    },
    {
      title: "Khaplu and Shigar Heritage Route",
      slug: "khaplu-shigar-heritage-route",
      location: "Khaplu",
      durationDays: 7,
      durationLabel: "7 Days / 6 Nights",
      price: 2140,
      currency: "PKR",
      coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      shortDescription: "Historic forts, river valleys, and curated boutique stays in Baltistan.",
      description: "A culture-focused route that combines heritage architecture and premium lodging.",
      featured: false,
      status: "published",
      availableSeats: 10,
      tags: ["Culture", "Premium", "History"],
    },
    {
      title: "Astore and Deosai Summer Escape",
      slug: "astore-deosai-summer-escape",
      location: "Astore Valley",
      durationDays: 5,
      durationLabel: "5 Days / 4 Nights",
      price: 1590,
      currency: "PKR",
      coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      shortDescription: "Seasonal summer journey through meadows, lakes, and highland drives.",
      description: "Built around weather windows for Deosai access and comfortable overnight flow.",
      featured: true,
      status: "published",
      availableSeats: 16,
      tags: ["Nature", "Summer", "Photography"],
    },
    {
      title: "Fairy Meadows Signature Trek",
      slug: "fairy-meadows-signature-trek",
      location: "Fairy Meadows",
      durationDays: 6,
      durationLabel: "6 Days / 5 Nights",
      price: 1890,
      currency: "PKR",
      coverImage:
        "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
      shortDescription: "Signature mountain trek with comfort-led support and route timing.",
      description: "Ideal for adventure travelers looking for high scenic value with practical logistics.",
      featured: false,
      status: "published",
      availableSeats: 12,
      tags: ["Trekking", "Adventure", "Mountains"],
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
    {
      title: "Luxury Stays in Hunza and Skardu",
      slug: "luxury-stays-hunza-skardu",
      category: "Luxury Travel",
      excerpt: "How to choose premium hotels and boutique stays for mountain trips.",
      content:
        "This guide compares location, comfort level, and route access to help you select the right stay category.",
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      status: "published",
      authorName: admin.name,
      featured: true,
      publishedAt: new Date("2026-02-15"),
    },
    {
      title: "Top Scenic Drives in Gilgit-Baltistan",
      slug: "top-scenic-drives-gilgit-baltistan",
      category: "Guides",
      excerpt: "A curated list of the most photogenic and comfortable road routes.",
      content:
        "From Hunza to Astore, these drives combine mountain scenery with practical road planning tips.",
      coverImage:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      status: "published",
      authorName: editor.name,
      featured: true,
      publishedAt: new Date("2026-02-08"),
    },
    {
      title: "How to Plan a Family Tour in the North",
      slug: "plan-family-tour-in-the-north",
      category: "Travel Tips",
      excerpt: "Simple planning framework for safe and smooth family journeys.",
      content:
        "This planning note covers route pacing, stay priorities, and child-friendly stop patterns.",
      coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      status: "published",
      authorName: admin.name,
      featured: false,
      publishedAt: new Date("2026-01-28"),
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
    {
      title: "Hunza Highlight - Attabad Reflections",
      category: "Highlights",
      url: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      alt: "Attabad Lake reflections",
    },
    {
      title: "Skardu Highlight - Upper Kachura",
      category: "Highlights",
      url: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      alt: "Upper Kachura mountain lake",
    },
    {
      title: "Valley Highlight - Meadow Camp",
      category: "Highlights",
      url: "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
      alt: "Meadow camp in northern valley",
    },
    {
      title: "Heritage Highlight - Fort View",
      category: "Highlights",
      url: "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
      alt: "Historic fort with valley backdrop",
    },
    {
      title: "Alpine Highlight - High Plateau",
      category: "Highlights",
      url: "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
      alt: "High alpine plateau",
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
    currency: "PKR",
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
    currency: "PKR",
    primaryColor: "#13DDB4",
    homeHeroImages: [
      "/gb.jpg",
      "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
    ],
    pageHeroImages: {
      tours: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
      about: "https://www.travelertrails.com/wp-content/uploads/2022/11/Gilgit-Baltistan-4.jpg",
      blog: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      contact: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    },
    heroColors: {
      overlay: "rgba(0, 0, 0, 0.45)",
      start: "rgba(7, 19, 38, 0.9)",
      middle: "rgba(7, 19, 38, 0.6)",
      end: "rgba(7, 19, 38, 0.2)",
      homeStart: "rgba(5, 8, 12, 0.24)",
      homeEnd: "rgba(5, 8, 12, 0.56)",
    },
    navbarColors: {
      main: "rgba(9, 20, 41, 0.88)",
      scrolled: "rgba(9, 20, 41, 0.94)",
      mobile: "rgba(9, 20, 41, 0.985)",
    },
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

  await ContentEntry.insertMany([
    ...destinationSeedData,
    {
      type: "activity",
      title: "Hiking Trails",
      slug: "hiking",
      location: "Hunza & Skardu",
      duration: "Half Day to 2 Days",
      level: "Beginner to Intermediate",
      shortDescription: "Guided hiking experiences across scenic valley routes.",
      description:
        "Flexible hiking plans designed around pace, weather, and comfort level for couples, families, and small groups.",
      includes: [
        "Local route guidance",
        "Flexible pace planning",
        "Basic safety briefing",
        "Time-managed trail schedule",
      ],
      gallery: [
        "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
        "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
      ],
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      status: "published",
      sortOrder: 1,
    },
    ...activitySeedData,
    {
      type: "service",
      title: "Itinerary Planning",
      slug: "itinerary-planning",
      category: "Planning",
      shortDescription: "Custom route planning based on dates, pace, and comfort.",
      description:
        "Day-by-day itineraries designed for practical travel windows, rest balance, and scenic value.",
      deliverables: [
        "Route blueprint",
        "Time and distance planning",
        "Stop recommendations",
        "Backup options",
      ],
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      status: "published",
      sortOrder: 1,
    },
    ...serviceSeedData,
    {
      type: "career",
      title: "Join Our Team",
      slug: "join-our-team",
      eyebrow: "Company",
      highlight: "Our Team",
      shortDescription:
        "We are always looking for talent in operations, customer success, and travel planning.",
      content:
        "Share your profile and we will contact you when a relevant opportunity opens. We value ownership, clear communication, and reliable execution.",
      status: "published",
      sortOrder: 1,
    },
    {
      type: "faq",
      title: "How do I confirm a booking?",
      slug: "faq-confirm-booking",
      question: "How do I confirm a booking?",
      answer: "Choose a tour, submit your details, and complete payment to confirm.",
      status: "published",
      sortOrder: 1,
    },
    {
      type: "faq",
      title: "Can I request a custom itinerary?",
      slug: "faq-custom-itinerary",
      question: "Can I request a custom itinerary?",
      answer: "Yes. Use the custom plan request page and our team will prepare one.",
      status: "published",
      sortOrder: 2,
    },
    {
      type: "help-center",
      title: "Help Center",
      slug: "help-center",
      eyebrow: "Support",
      highlight: "Center",
      shortDescription: "Need help with booking, itinerary, or payment? We are available.",
      content:
        "Email: support@northluxetravels.com\nBusiness Hours: Monday to Saturday, 9:00 AM to 7:00 PM\nFor urgent changes, contact us through the Contact page.",
      status: "published",
      sortOrder: 1,
    },
    {
      type: "privacy-policy",
      title: "Privacy Policy",
      slug: "privacy-policy",
      eyebrow: "Legal",
      highlight: "Policy",
      shortDescription: "How we collect, use, and protect user information.",
      content:
        "We collect only the information needed for bookings and support. We do not sell personal data. Payment details are handled by secure third-party providers.",
      status: "published",
      sortOrder: 1,
    },
    {
      type: "terms-of-service",
      title: "Terms of Service",
      slug: "terms-of-service",
      eyebrow: "Legal",
      highlight: "Service",
      shortDescription: "Terms that apply to bookings and site usage.",
      content:
        "Bookings are subject to supplier and destination availability. Refund/cancellation terms vary by package. Travelers are responsible for valid documents and compliance.",
      status: "published",
      sortOrder: 1,
    },
  ]);

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});




