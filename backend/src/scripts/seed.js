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
    {
      title: "Nagar and Hunza Panorama",
      slug: "nagar-hunza-panorama",
      location: "Nagar Valley",
      durationDays: 6,
      durationLabel: "6 Days / 5 Nights",
      price: 1680,
      currency: "USD",
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
      currency: "USD",
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
      currency: "USD",
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
      currency: "USD",
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
    primaryColor: "#13DDB4",
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
    {
      type: "destination",
      title: "Hunza Valley",
      slug: "hunza",
      eyebrow: "Destination Overview",
      shortDescription: "Snow-capped peaks, heritage forts, and premium valley stays.",
      description: "Hunza is ideal for culture-rich mountain travel with comfortable road access.",
      content:
        "Hunza has a deep mountain history shaped by fortified settlements and Silk Route trade movement. Today it blends heritage, scenery, and modern hospitality.",
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      highlights: ["Baltit Fort", "Altit Village", "Attabad Lake", "Passu Cones"],
      features: ["Comfort-focused stays", "Family-friendly routes", "Strong local support", "Scenic day loops"],
      meta: { bestTime: "April to October", idealFor: "Families and couples" },
      status: "published",
      sortOrder: 1,
    },
    {
      type: "destination",
      title: "Skardu",
      slug: "skardu",
      eyebrow: "Destination Overview",
      shortDescription: "Alpine lakes, cold desert views, and curated adventure routes.",
      description: "Skardu offers a strong adventure-leisure mix with premium nature experiences.",
      content:
        "Skardu has long been the center of Baltistan route movement and now serves as a key mountain travel hub for lake, valley, and heritage circuits.",
      coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      highlights: ["Shigar Fort", "Shangrila", "Upper Kachura", "Katpana Desert"],
      features: ["Wide valley panoramas", "Adventure-ready routes", "Luxury-friendly stays", "Photography hotspots"],
      meta: { bestTime: "May to September", idealFor: "Adventure and scenic travelers" },
      status: "published",
      sortOrder: 2,
    },
    {
      type: "destination",
      title: "Nagar Valley",
      slug: "nagar-valley",
      eyebrow: "Destination Overview",
      shortDescription: "Glacier-facing villages, quiet landscapes, and panoramic mountain viewpoints.",
      description: "Nagar offers a calmer, scenery-first route with wide views and cultural touchpoints.",
      content:
        "Nagar has evolved from an isolated mountain settlement zone into a high-value scenic destination. The region is known for glacier-facing fields, village terraces, and route links toward major peaks.",
      coverImage: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      highlights: ["Hopar Glacier", "Nagar viewpoints", "Village terraces", "Rakaposhi-facing routes"],
      features: ["Low-crowd routes", "Photo-focused stops", "Flexible pacing", "Comfort-friendly stays"],
      meta: { bestTime: "May to October", idealFor: "Scenery and photography travelers" },
      status: "published",
      sortOrder: 3,
    },
    {
      type: "destination",
      title: "Khaplu",
      slug: "khaplu",
      eyebrow: "Destination Overview",
      shortDescription: "Heritage architecture, orchard landscapes, and refined valley hospitality.",
      description: "Khaplu is ideal for culture-rich trips with relaxed pace and historical depth.",
      content:
        "Khaplu retains a strong heritage identity shaped by palace architecture and river-valley settlements. It is a preferred destination for travelers seeking meaningful cultural experiences.",
      coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      highlights: ["Khaplu Palace", "Old village lanes", "Shyok river views", "Heritage landmarks"],
      features: ["Culture-first itinerary", "Boutique stays", "Slow travel friendly", "Family suitable"],
      meta: { bestTime: "April to October", idealFor: "Culture and couples travel" },
      status: "published",
      sortOrder: 4,
    },
    {
      type: "destination",
      title: "Astore Valley",
      slug: "astore-valley",
      eyebrow: "Destination Overview",
      shortDescription: "Green meadows, alpine lakes, and seasonal access to Deosai routes.",
      description: "Astore blends open landscapes with route flexibility for summer nature trips.",
      content:
        "Astore remains one of the most scenic highland valleys for summer tours, combining meadow circuits with access corridors toward Deosai and surrounding alpine zones.",
      coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      highlights: ["Rama Meadows", "Rama Lake", "Valley village routes", "Deosai approach roads"],
      features: ["Summer-special circuits", "Wide open scenery", "Nature-driven stays", "Road-trip friendly"],
      meta: { bestTime: "June to September", idealFor: "Nature and family tours" },
      status: "published",
      sortOrder: 5,
    },
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
    {
      type: "activity",
      title: "Mountain Trekking",
      slug: "trekking",
      location: "Fairy Meadows & Beyond",
      duration: "2 to 5 Days",
      level: "Intermediate",
      shortDescription: "Multi-day trekking with route planning and coordination.",
      description:
        "Trekking itineraries built around realistic altitude pacing, rest windows, and on-ground support.",
      includes: [
        "Pre-planned trek route",
        "Daily checkpoint coordination",
        "Rest and overnight planning",
      ],
      gallery: [
        "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
      ],
      coverImage:
        "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
      status: "published",
      sortOrder: 2,
    },
    {
      type: "activity",
      title: "Lakeside Camping",
      slug: "lakeside-camping",
      location: "Deosai & Upper Valleys",
      duration: "1 to 2 Nights",
      level: "Easy",
      shortDescription: "Comfort-focused camping with curated locations and weather-aware planning.",
      description:
        "Camp experiences designed for scenic overnights with smooth logistics, timing support, and family-friendly comfort.",
      includes: [
        "Camp location planning",
        "Night stay coordination",
        "Weather and timing support",
        "Comfort-first activity flow",
      ],
      gallery: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Shangrila_resort_skardu.jpg/1024px-Shangrila_resort_skardu.jpg",
        "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      ],
      coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      status: "published",
      sortOrder: 3,
    },
    {
      type: "activity",
      title: "Cultural Walks",
      slug: "cultural-walks",
      location: "Old Towns & Heritage Spots",
      duration: "Half Day",
      level: "Easy",
      shortDescription: "Explore local culture, markets, and heritage areas with guided context.",
      description:
        "Slow-paced cultural walks through traditional neighborhoods, local markets, and heritage points for mixed-age groups.",
      includes: [
        "Local area orientation",
        "Heritage route guidance",
        "Flexible session timing",
        "Family-friendly pacing",
      ],
      gallery: [
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
        "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
      ],
      coverImage: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      status: "published",
      sortOrder: 4,
    },
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
    {
      type: "service",
      title: "On-Ground Concierge",
      slug: "on-ground-concierge",
      category: "Support",
      shortDescription: "Trip-time support for schedule and route adjustments.",
      description:
        "Concierge assistance during travel for timing changes, local coordination, and issue escalation.",
      deliverables: [
        "Live trip support",
        "Schedule adjustment help",
        "Local coordination",
        "Issue escalation handling",
      ],
      coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      status: "published",
      sortOrder: 2,
    },
    {
      type: "service",
      title: "Hotel Booking Support",
      slug: "hotel-booking-support",
      category: "Stays",
      shortDescription: "Curated stay options aligned with budget, comfort level, and route flow.",
      description:
        "Hotel support including category-based shortlists, better location matching, and smoother check-in planning.",
      deliverables: [
        "Category-based hotel shortlist",
        "Location convenience matching",
        "Check-in and check-out planning",
        "Upgrade assistance guidance",
      ],
      coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      status: "published",
      sortOrder: 3,
    },
    {
      type: "service",
      title: "Transport Arrangement",
      slug: "transport-arrangement",
      category: "Mobility",
      shortDescription: "Vehicle planning for private groups, families, and comfort-focused trips.",
      description:
        "End-to-end transport planning based on route, group size, and luggage profile with practical daily movement support.",
      deliverables: [
        "Vehicle type recommendation",
        "Route-ready movement plan",
        "Group-size optimization",
        "Daily stop coordination support",
      ],
      coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      status: "published",
      sortOrder: 4,
    },
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
