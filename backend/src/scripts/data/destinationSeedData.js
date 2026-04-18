const destinationSeedImageExtras = {
  "hunza-valley": [
    "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
    "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
    "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
  ],
  "skardu": [
    "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
  ],
  "fairy-meadows": [
    "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
    "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
    "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
  ],
  "astore-valley": [
    "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
    "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
  ],
  "diamer": [
    "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
    "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
    "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
  ],
  "gilgit": [
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
    "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
  ],
  "khaplu": [
    "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
    "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
    "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
  ],
  "shigar": [
    "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
    "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
  ],
  "ghizer": [
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
    "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
  ],
  "nagar-valley": [
    "https://visitgilgitbaltistan.gov.pk/storage/images/kBAftq4Tk7vARWPMTifPQlDtHehXGV-metaUGlzYW4gQ3JpY2tldCBTdGFkaXVtLmpwZw==-.jpg",
    "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
    "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
  ],
  "deosai": [
    "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
  ],
};

const ensureSeedGallery = (slug, coverImage, gallery = []) =>
  Array.from(
    new Set([coverImage, ...(gallery || []), ...(destinationSeedImageExtras[slug] || [])].filter(Boolean)),
  ).slice(0, 6);
const rawDestinationSeedData = [
  {
    type: "destination",
    title: "Hunza Valley",
    slug: "hunza-valley",
    eyebrow: "Destination Overview",
    shortDescription:
      "Hunza is one of the most iconic valleys in Gilgit-Baltistan, known for dramatic mountain views, historic forts, orchards, and a calm travel rhythm.",
    description:
      "Hunza is ideal for travelers seeking a balanced journey with culture, scenery, and comfortable road access.",
    content: `Hunza has a deep historical identity as one of the most prominent mountain states in the northern belt, positioned along old Silk Route movement paths. Over centuries, the valley developed around fortified settlements, terraced agriculture, and tightly connected communities that adapted to seasonal mountain life. Baltit and Altit Forts still reflect how power, defense, and social structure were organized in this landscape.

As trade routes evolved and modern road links improved, Hunza gradually shifted from a strategic mountain polity to a globally recognized travel destination. Despite growing tourism, the valley continues to preserve local architecture, orchard traditions, and community-led hospitality, which gives visitors a strong sense of living history rather than a purely commercial tourist stop.`,
    coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
    gallery: [
      "https://realpakistan.com.pk/wp-content/uploads/2025/06/hunza-sarena.jpg",
      "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
    ],
    highlights: ["Baltit Fort", "Altit heritage village", "Attabad Lake", "Passu Cones"],
    features: ["Easy sightseeing loops", "Premium valley stays", "Local food and craft markets", "Strong road connectivity"],
    meta: {
      bestTime: "April to October",
      idealFor: "Families, couples, culture-focused and scenic travelers",
    },
    featured: true,
    status: "published",
    sortOrder: 1,
  },
  {
    type: "destination",
    title: "Skardu",
    slug: "skardu",
    eyebrow: "Destination Overview",
    shortDescription:
      "Skardu is the gateway to high-altitude landscapes, alpine lakes, and desert-meets-mountain scenery.",
    description:
      "It offers a strong mix of soft adventure and premium leisure with accessible viewpoints and nature-driven routes.",
    content: `Skardu has long been the historic center of Baltistan, where valley settlements, forts, and trade movement shaped local society over many generations. Its location made it important for administrative control and route coordination across surrounding highland communities. Traditional neighborhoods and heritage structures still carry traces of this political and cultural significance.

With time, Skardu became both a gateway for major mountain expeditions and a central district for regional tourism. The transformation brought roads, services, and broader visitor access, but the area still preserves its older cultural rhythm through local crafts, historic sites, and community customs rooted in Baltistani heritage.`,
    coverImage: "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    gallery: [
      "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
      "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
    ],
    highlights: ["Shigar Fort", "Shangrila", "Upper Kachura Lake", "Katpana Cold Desert"],
    features: ["Wide valley panoramas", "Short and long day routes", "Strong photography spots", "Comfortable mixed-pace itineraries"],
    meta: {
      bestTime: "May to September",
      idealFor: "Adventure starters, photographers, and luxury nature travelers",
    },
    featured: true,
    status: "published",
    sortOrder: 2,
  },
  {
    type: "destination",
    title: "Fairy Meadows",
    slug: "fairy-meadows",
    eyebrow: "Destination Overview",
    shortDescription:
      "Fairy Meadows offers one of the most memorable mountain-front landscapes in Pakistan, with Nanga Parbat views, pine forests, and immersive overnight experiences.",
    description:
      "It is best for travelers who want raw scenery with curated support.",
    content: `Fairy Meadows was historically part of seasonal mountain movement used by shepherd families and local route guides traveling toward higher pastures. Before modern trekking culture, the region was known primarily to nearby communities who navigated these forests and ridgelines through traditional knowledge passed down across generations.

In recent decades, the area gained international recognition as one of the iconic viewpoints for Nanga Parbat. Even with rising popularity, the place has retained its raw alpine character, where simple camps, forest trails, and local guiding traditions continue to define the experience more than heavy built-up tourism.`,
    coverImage:
      "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
    gallery: [
      "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
      "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
      "https://tripako.com/wp-content/uploads/2020/12/Fairy-1-1-scaled.jpg",
    ],
    highlights: ["Nanga Parbat view deck", "Forest trail camps", "Sunrise ridge points", "Stargazing nights"],
    features: ["High-scenic trekking base", "Compact overnight plans", "Adventure + comfort mix", "Strong visual storytelling spots"],
    meta: {
      bestTime: "June to September",
      idealFor: "Trekking lovers, nature-focused groups, and adventure photographers",
    },
    featured: true,
    status: "published",
    sortOrder: 3,
  },
  {
    type: "destination",
    title: "Astore Valley",
    slug: "astore-valley",
    eyebrow: "Destination Overview",
    shortDescription:
      "Astore is a serene mountain district known for green valleys, river plains, and easy access to high-altitude routes toward Deosai.",
    description:
      "It is ideal for travelers who want quieter landscapes, open meadows, and less-crowded scenic drives.",
    content: `Astore developed as a historic valley corridor connecting nearby mountain regions through seasonal routes used for grazing, trade, and community movement. The district's village structure reflects a long-standing relationship with rivers, pasture cycles, and localized farming systems adapted to short summers and long winters.

Over time, Astore became known as a quieter alternative to busier northern circuits, especially due to its access toward Rama and Deosai approaches. Its historical identity remains closely tied to pastoral culture, village cooperation, and a slower travel rhythm that still feels rooted in traditional mountain life.`,
    coverImage: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    gallery: [
      "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
      "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    ],
    highlights: ["Rama Meadows", "Rama Lake", "Astore Valley villages", "Deosai access routes"],
    features: ["Less-crowded routes", "Soft-adventure landscapes", "Family-friendly valley stays", "Strong summer scenery"],
    meta: {
      bestTime: "May to October",
      idealFor: "Nature-focused families, road-trip groups, and relaxed explorers",
    },
    featured: false,
    status: "published",
    sortOrder: 4,
  },
  {
    type: "destination",
    title: "Diamer",
    slug: "diamer",
    eyebrow: "Destination Overview",
    shortDescription:
      "Diamer offers dramatic mountain terrain, historic settlements, and gateway routes toward Fairy Meadows and Nanga Parbat viewpoints.",
    description:
      "The region is suited for travelers who enjoy rugged scenery with guided planning.",
    content: `Diamer has historically functioned as a major transit belt along upper Indus movement corridors, where caravans, traders, and communities crossed between valleys. Its geography encouraged route-based settlement growth, with communities closely linked to river systems, mountain passages, and practical roadside exchange.

As road networks expanded, Diamer became increasingly important as an access zone for northern tourism, especially for routes leading toward Fairy Meadows and adjacent high mountain areas. Even today, the district carries a strong frontier character shaped by mobility, local resilience, and river-valley livelihoods.`,
    coverImage: "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
    gallery: [
      "https://cdn.tripspoint.com/uploads/photos/8183/10-days-fairy-meadows-hunza-valley-pakistan_uJZ6j.jpeg",
      "https://images.squarespace-cdn.com/content/v1/5a815ad2e45a7c1f4ef40fb8/1533222115427-RM0925EGPCZMCCN8T01S/fairy-meadows-1920.jpg",
    ],
    highlights: ["Chilas viewpoints", "Fairy Meadows access", "Nanga Parbat gateway", "Indus-side landscapes"],
    features: ["Adventure gateway routes", "High mountain panoramas", "Cultural roadside stops", "Flexible drive-based itineraries"],
    meta: {
      bestTime: "May to September",
      idealFor: "Adventure travelers, trekkers, and mountain photographers",
    },
    featured: false,
    status: "published",
    sortOrder: 5,
  },
  {
    type: "destination",
    title: "Gilgit",
    slug: "gilgit",
    eyebrow: "Destination Overview",
    shortDescription:
      "Gilgit is the administrative and travel hub of the north, offering riverfront views, bazaars, and strategic connectivity to Hunza, Skardu, and Ghizer.",
    description:
      "It works well as both a stay destination and route base.",
    content: `Gilgit has historically stood at a key crossroads between regional mountain states, acting as a strategic junction for trade and political movement. Its position connected routes heading toward Hunza, Baltistan, Chitral-side belts, and beyond, making it one of the most influential urban centers in the north.

Through different administrative eras, Gilgit evolved into a civic and service hub while retaining historical layers visible in its old quarters, local markets, and surrounding heritage zones. Today, it balances modern transit energy with long-standing cultural memory that reflects its role in regional mountain history.`,
    coverImage: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
    gallery: [
      "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    ],
    highlights: ["Kargah Buddha", "Gilgit Riverfront", "City bazaars", "Historic local neighborhoods"],
    features: ["Central connectivity", "Comfortable city stays", "Multi-route trip planning", "Local food and craft access"],
    meta: {
      bestTime: "April to October",
      idealFor: "Transit travelers, culture explorers, and mixed-pace itineraries",
    },
    featured: false,
    status: "published",
    sortOrder: 6,
  },
  {
    type: "destination",
    title: "Khaplu",
    slug: "khaplu",
    eyebrow: "Destination Overview",
    shortDescription:
      "Khaplu is a heritage-rich destination in Baltistan known for palace architecture, orchards, and peaceful village life along the Shyok corridor.",
    description:
      "It is perfect for travelers seeking culture with calm mountain scenery.",
    content: `Khaplu emerged as an important historical seat in Baltistan, where governance, settlement planning, and cultural life developed around palace and village institutions. The area's built heritage, especially around Khaplu Palace and historic neighborhoods, reflects centuries of social order and architectural adaptation.

The region later transitioned from a political center to a cultural travel destination, yet it has preserved a strong sense of place through local traditions, craft practices, and river-valley community life. Khaplu's historical continuity is still visible in the way heritage spaces remain part of everyday life.`,
    coverImage: "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
    gallery: [
      "https://luxushunza.com/wp-content/uploads/Gojal_Restaurant-1.webp",
      "https://luxushunza.com/wp-content/uploads/slider/cache/da7922896e4ca1abc15bafab13c8151f/DSC_9668-HDR-1-scaled.jpg",
    ],
    highlights: ["Khaplu Palace", "Old village lanes", "Shyok River views", "Chaqchan heritage surroundings"],
    features: ["Heritage-focused stay", "Quiet premium atmosphere", "Strong cultural storytelling", "Scenic village walks"],
    meta: {
      bestTime: "May to October",
      idealFor: "Couples, heritage travelers, and slow-travel itineraries",
    },
    featured: false,
    status: "published",
    sortOrder: 7,
  },
  {
    type: "destination",
    title: "Shigar",
    slug: "shigar",
    eyebrow: "Destination Overview",
    shortDescription:
      "Shigar combines heritage architecture with wide valley landscapes and comfortable boutique stays.",
    description:
      "It offers a refined travel experience for visitors wanting history, scenery, and relaxed pacing in one destination.",
    content: `Shigar developed as a vital valley settlement in Baltistan with strong links to fort-based authority, agricultural communities, and inter-valley travel routes. Its historical footprint can be seen in settlement clusters, water-channel systems, and preserved architecture that supported long-term mountain habitation.

As heritage conservation and tourism initiatives expanded, Shigar gained renewed recognition for its cultural depth and restored fort complex. The valley now represents a successful blend of history and hospitality, where old structures are actively integrated into contemporary travel experiences.`,
    coverImage: "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
    gallery: [
      "https://realpakistan.com.pk/wp-content/uploads/2025/04/shangrila-resort.jpg",
      "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    ],
    highlights: ["Shigar Fort", "River valley viewpoints", "Traditional settlements", "Mountain-backed orchards"],
    features: ["Boutique heritage stays", "Easy valley exploration", "Balanced comfort and culture", "Photography-friendly settings"],
    meta: {
      bestTime: "May to October",
      idealFor: "Luxury seekers, culture travelers, and short scenic escapes",
    },
    featured: false,
    status: "published",
    sortOrder: 8,
  },
  {
    type: "destination",
    title: "Ghizer",
    slug: "ghizer",
    eyebrow: "Destination Overview",
    shortDescription:
      "Ghizer is known for broad valleys, alpine lakes, and turquoise river corridors stretching toward the western mountain belt.",
    description:
      "The district is ideal for scenic drives, nature retreats, and low-density tourism.",
    content: `Ghizer's history is shaped by wide valleys and frontier routes that connected upper settlements through seasonal migration and regional exchange. Communities in this district built their livelihoods around rivers, highland pastures, and cooperative systems that supported life in changing mountain conditions.

Over time, Ghizer remained less urbanized than other northern hubs, which helped preserve its pastoral and ecological character. Its historical identity continues to be tied to nature-based living, local oral traditions, and low-density settlement patterns across scenic valley belts.`,
    coverImage: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
    gallery: [
      "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1670002655/Roundu_Valley_pakistan.jpg",
      "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    ],
    highlights: ["Phander Valley", "Khalti Lake", "Gupis landscapes", "River corridor viewpoints"],
    features: ["Open valley scenery", "Calm travel environment", "Great fishing and nature zones", "Road-trip friendly routes"],
    meta: {
      bestTime: "May to September",
      idealFor: "Nature lovers, photographers, and peaceful long-route travelers",
    },
    featured: false,
    status: "published",
    sortOrder: 9,
  },
  {
    type: "destination",
    title: "Nagar Valley",
    slug: "nagar-valley",
    eyebrow: "Destination Overview",
    shortDescription:
      "Nagar features high mountain vistas, glacier viewpoints, and village terraces opposite Hunza's iconic peaks.",
    description:
      "It offers less-crowded scenic travel with strong visual landscapes and cultural depth.",
    content: `Nagar has a distinct historical identity as a former princely state with strategic positioning along major mountain viewsheds and approach routes. Its legacy includes local governance systems, village fortification patterns, and cultural traditions that developed in close relationship with glaciers and terraced land.

With modern connectivity, Nagar became more accessible to visitors, yet it has retained a comparatively authentic social and landscape character. Historical continuity in the area is reflected through community memory, traditional settlement forms, and strong ties to alpine agriculture.`,
    coverImage: "https://visitgilgitbaltistan.gov.pk/storage/images/kBAftq4Tk7vARWPMTifPQlDtHehXGV-metaUGlzYW4gQ3JpY2tldCBTdGFkaXVtLmpwZw==-.jpg",
    gallery: [
      "https://visitgilgitbaltistan.gov.pk/storage/images/kBAftq4Tk7vARWPMTifPQlDtHehXGV-metaUGlzYW4gQ3JpY2tldCBTdGFkaXVtLmpwZw==-.jpg",
      "https://visitgilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
      "https://visitgilgitbaltistan.gov.pk/storage/images/gTH9WHnKkooBD4lDCkJglPVSGG59Qm-metaQmFzaG8gVmFsbGV5IDIuSlBH-.jpg",
    ],
    highlights: ["Hopar Glacier viewpoints", "Nagar Khas landscapes", "Village terrace routes", "Rakaposhi-facing scenes"],
    features: ["Less-crowded alternatives", "High-altitude visual routes", "Authentic village experiences", "Strong day-tour potential"],
    meta: {
      bestTime: "May to October",
      idealFor: "Scenic explorers, repeat visitors, and route photographers",
    },
    featured: true,
    status: "published",
    sortOrder: 10,
  },
  {
    type: "destination",
    title: "Deosai",
    slug: "deosai",
    eyebrow: "Destination Overview",
    shortDescription:
      "Deosai is a high-altitude plateau famous for wide grasslands, wildflower fields, and dramatic skies at over 4,000 meters.",
    description:
      "It is a signature summer destination for raw nature and open wilderness experiences.",
    content: `Deosai has long been part of seasonal mountain movement, especially for grazing and summer passage by surrounding communities. Due to its altitude and climate, the plateau was historically used only during limited months, which shaped its identity as a remote and powerful highland landscape.

In the modern era, Deosai gained protected status as a national park and became a landmark destination for eco-tourism and conservation-led travel. Its history now combines traditional seasonal use with contemporary environmental stewardship, making it one of the most culturally and ecologically significant plateaus in the region.`,
    coverImage: "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
    gallery: [
      "https://gilgitbaltistan.gov.pk/public/images/river-5688258_1920.jpg",
      "https://clickpakistan.org/wp-content/uploads/2023/11/Best-Things-to-do-in-Skardu.jpg",
    ],
    highlights: ["Sheosar Lake", "Open alpine plains", "Wildlife observation zones", "Panoramic highland drives"],
    features: ["National park setting", "Distinct summer ecosystem", "Unique high-altitude terrain", "Strong camping and day-trip options"],
    meta: {
      bestTime: "July to September",
      idealFor: "Adventure groups, wildlife enthusiasts, and landscape photographers",
    },
    featured: true,
    status: "published",
    sortOrder: 11,
  },
];

export const destinationSeedData = rawDestinationSeedData.map((item) => ({
  ...item,
  gallery: ensureSeedGallery(item.slug, item.coverImage, item.gallery),
}));
