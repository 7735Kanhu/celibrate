import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.enquiryStatusHistory.deleteMany();
  await prisma.enquiryService.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.venuePackage.deleteMany();
  await prisma.venueAmenity.deleteMany();
  await prisma.venueImage.deleteMany();
  await prisma.venueCategoryMapping.deleteMany();
  await prisma.venueCategory.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.area.deleteMany();
  await prisma.city.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.vendorService.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo Customer User
  const hashedPassword = await bcrypt.hash("Demo@123", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "customer@celibrate.demo",
      password: hashedPassword,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      city: "Bhubaneswar",
      role: "CUSTOMER",
    },
  });

  console.log("Demo user created:", demoUser.email);

  // Cities Data
  const citiesData = [
    {
      name: "Bhubaneswar",
      slug: "bhubaneswar",
      state: "Odisha",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1000",
      venueCount: 45,
      isPopular: true,
      areas: ["Chandrasekharpur", "Patia", "Saheed Nagar", "Jayadev Vihar", "Nayapalli", "Khandagiri", "Mancheswar"],
    },
    {
      name: "Cuttack",
      slug: "cuttack",
      state: "Odisha",
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1000",
      venueCount: 28,
      isPopular: true,
      areas: ["CDA Sector 9", "Link Road", "Cantonment Road", "Badambadi"],
    },
    {
      name: "Puri",
      slug: "puri",
      state: "Odisha",
      image: "https://images.unsplash.com/photo-1627894043065-45617894d510?q=80&w=1000",
      venueCount: 20,
      isPopular: true,
      areas: ["VIP Road", "Marine Drive", "Grand Road", "Baliapanda"],
    },
    {
      name: "Rourkela",
      slug: "rourkela",
      state: "Odisha",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
      venueCount: 15,
      isPopular: true,
      areas: ["Civil Township", "Chhend Colony", "Udit Nagar"],
    },
    {
      name: "Berhampur",
      slug: "berhampur",
      state: "Odisha",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000",
      venueCount: 12,
      isPopular: false,
      areas: ["Giri Road", "Courtpeta", "Engineering School Road"],
    },
    {
      name: "Kolkata",
      slug: "kolkata",
      state: "West Bengal",
      image: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1000",
      venueCount: 65,
      isPopular: true,
      areas: ["Salt Lake", "New Town", "Park Street", "EM Bypass"],
    },
    {
      name: "Hyderabad",
      slug: "hyderabad",
      state: "Telangana",
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1000",
      venueCount: 80,
      isPopular: true,
      areas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Hitech City"],
    },
    {
      name: "Bangalore",
      slug: "bangalore",
      state: "Karnataka",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000",
      venueCount: 95,
      isPopular: true,
      areas: ["Indiranagar", "Koramangala", "Whitefield", "JP Nagar"],
    },
    {
      name: "Mumbai",
      slug: "mumbai",
      state: "Maharashtra",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1000",
      venueCount: 110,
      isPopular: true,
      areas: ["Juhu", "Bandra West", "Andheri East", "Powai"],
    },
    {
      name: "Delhi",
      slug: "delhi",
      state: "Delhi NCR",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1000",
      venueCount: 120,
      isPopular: true,
      areas: ["South Extension", "Chattarpur", "Dwarka", "Vasant Kunj"],
    },
  ];

  const cityMap: Record<string, { id: string; areas: Record<string, string> }> = {};

  for (const c of citiesData) {
    const city = await prisma.city.create({
      data: {
        name: c.name,
        slug: c.slug,
        state: c.state,
        image: c.image,
        venueCount: c.venueCount,
        isPopular: c.isPopular,
      },
    });

    const areaMap: Record<string, string> = {};
    for (const aName of c.areas) {
      const area = await prisma.area.create({
        data: {
          name: aName,
          slug: aName.toLowerCase().replace(/\s+/g, "-"),
          cityId: city.id,
        },
      });
      areaMap[aName] = area.id;
    }

    cityMap[c.name] = { id: city.id, areas: areaMap };
  }

  // Event Categories Data
  const eventCategoriesData = [
    {
      name: "Wedding",
      slug: "wedding",
      description: "Beautiful venues for your special day with grand decor and dining",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000",
      icon: "Heart",
    },
    {
      name: "Birthday",
      slug: "birthday",
      description: "Vibrant party halls and venues for unforgettable birthday celebrations",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000",
      icon: "Cake",
    },
    {
      name: "Engagement",
      slug: "engagement",
      description: "Elegant banquet spaces for ring ceremony and family gatherings",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000",
      icon: "Sparkles",
    },
    {
      name: "Reception",
      slug: "reception",
      description: "Grand reception halls with spacious stage, seating and catering options",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000",
      icon: "GlassWater",
    },
    {
      name: "Anniversary",
      slug: "anniversary",
      description: "Intimate and grand places to celebrate milestones of love",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1000",
      icon: "Award",
    },
    {
      name: "Corporate Event",
      slug: "corporate-event",
      description: "Professional venues with AV facilities for corporate dinners and meets",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000",
      icon: "Briefcase",
    },
    {
      name: "Conference",
      slug: "conference",
      description: "High-tech auditoriums and halls equipped for business conventions",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000",
      icon: "Presentation",
    },
    {
      name: "Party",
      slug: "party",
      description: "Trendy party spaces, lawns and rooftops with DJ and lounge setup",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
      icon: "Music",
    },
    {
      name: "Baby Shower",
      slug: "baby-shower",
      description: "Warm and cozy celebration spaces for welcoming the little one",
      image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000",
      icon: "Baby",
    },
    {
      name: "Cultural Event",
      slug: "cultural-event",
      description: "Spacious convention centres for traditional, cultural and community functions",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000",
      icon: "Users",
    },
  ];

  const eventCategoryMap: Record<string, string> = {};
  for (const ec of eventCategoriesData) {
    const created = await prisma.eventCategory.create({ data: ec });
    eventCategoryMap[ec.slug] = created.id;
  }

  // Venue Types
  const venueTypes = [
    "Kalyan Mandap",
    "Banquet Hall",
    "Hotel",
    "Resort",
    "Lawn",
    "Convention Centre",
    "Party Hall",
  ];

  const venueCategoryMap: Record<string, string> = {};
  for (const vt of venueTypes) {
    const vc = await prisma.venueCategory.create({
      data: {
        name: vt,
        slug: vt.toLowerCase().replace(/\s+/g, "-"),
        description: `Premium ${vt} options for celebrations`,
      },
    });
    venueCategoryMap[vt] = vc.id;
  }

  // Venues Data (20 Venues)
  const venuesData = [
    {
      name: "Royal Celebration Mandap",
      slug: "royal-celebration-mandap-bhubaneswar",
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Chandrasekharpur",
      rating: 4.8,
      reviewCount: 126,
      capacity: 500,
      indoorCap: 500,
      outdoorCap: 300,
      parkingCap: 100,
      roomCount: 10,
      startingPrice: 100000,
      isVerified: true,
      isFeatured: true,
      description: "Royal Celebration Mandap is a premium event venue in Bhubaneswar suitable for weddings, receptions, birthdays and corporate events. It features grand air-conditioned halls, magnificent stage design, luxurious guest rooms, and a dedicated dining zone.",
      address: "Plot 124, Near KIIT Square, Chandrasekharpur, Bhubaneswar, Odisha 751024",
      latitude: 20.354,
      longitude: 85.816,
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
        "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1000",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Sound System", "Wi-Fi", "Dining Area", "Guest Rooms", "Lift"],
      packages: [
        { name: "Basic", price: 100000, description: "Standard hall rental with basic setup", includes: JSON.stringify(["AC Main Hall (500 capacity)", "100 Guest Chairs & 15 Tables", "Basic Stage Setup", "Generator Backup", "Parking Area for 50 vehicles"]) },
        { name: "Premium", price: 175000, description: "Enhanced decoration and stage lighting", includes: JSON.stringify(["AC Hall + Dining Zone", "Premium Floral Stage Decoration", "Bridal Room + 4 AC Rooms", "Sound & Ambient Lighting", "Valet Parking Assistant"]) },
        { name: "Luxury", price: 275000, description: "Full luxury wedding package with rooms & DJ", includes: JSON.stringify(["Whole Venue Exclusive Access", "Luxury Theme Floral Decor & Entrance Gate", "10 Deluxe AC Guest Rooms", "DJ & Intelligent Moving Lights", "Dedicated Event Manager On-site"]) },
      ],
    },
    {
      name: "Grand Palace Banquet",
      slug: "grand-palace-banquet-bhubaneswar",
      type: "Banquet Hall",
      cityName: "Bhubaneswar",
      areaName: "Patia",
      rating: 4.7,
      reviewCount: 98,
      capacity: 800,
      indoorCap: 800,
      outdoorCap: 400,
      parkingCap: 150,
      roomCount: 12,
      startingPrice: 150000,
      isVerified: true,
      isFeatured: true,
      description: "Grand Palace Banquet offers opulent banquet halls with crystal chandeliers, state-of-the-art audio visual equipment, and multi-cuisine catering support. Ideal for lavish wedding receptions and large corporate conventions.",
      address: "Infocity Road, Patia, Bhubaneswar, Odisha 751024",
      latitude: 20.358,
      longitude: 85.819,
      images: [
        "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1200",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000",
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Sound System", "Wi-Fi", "Guest Rooms", "Lift", "Wheelchair Access"],
      packages: [
        { name: "Basic", price: 150000, description: "Banquet hall rental with standard seating", includes: JSON.stringify(["Grand AC Banquet Hall", "Stage & LED Backdrop Screen", "Basic Lighting & AC", "Bridal Green Room"]) },
        { name: "Premium", price: 220000, description: "Complete reception setup package", includes: JSON.stringify(["Grand Banquet Hall + Lawn", "Royal Stage Decor & Entry Tunnel", "6 Deluxe Rooms", "In-house Sound System & DJ Setup"]) },
      ],
    },
    {
      name: "Green Garden Resort",
      slug: "green-garden-resort-cuttack",
      type: "Resort",
      cityName: "Cuttack",
      areaName: "Cantonment Road",
      rating: 4.9,
      reviewCount: 214,
      capacity: 1000,
      indoorCap: 400,
      outdoorCap: 1000,
      parkingCap: 250,
      roomCount: 25,
      startingPrice: 180000,
      isVerified: true,
      isFeatured: true,
      description: "Green Garden Resort is a sprawling eco-friendly resort in Cuttack featuring lush green lawns, poolside party space, and tranquil luxury cottages for destination wedding experiences.",
      address: "Cantonment Road, Near Mahanadi River Front, Cuttack, Odisha 753001",
      latitude: 20.462,
      longitude: 85.882,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Swimming Pool", "Guest Rooms", "Kitchen", "Wi-Fi"],
      packages: [
        { name: "Standard Lawn Package", price: 180000, description: "Lawn & Banquet combined access", includes: JSON.stringify(["15,000 sq ft Open Lawn", "AC Indoor Banquet Hall", "10 Luxury Cottages", "Illumination & Garden Lights"]) },
        { name: "Destination Wedding Special", price: 350000, description: "2-Day full resort booking", includes: JSON.stringify(["Exclusive 2-Day Resort Access", "25 Luxury Cottages for Guests", "Poolside Haldi/Sangeet Area", "Grand Wedding Lawn Setup"]) },
      ],
    },
    {
      name: "The Orchid Hotel",
      slug: "the-orchid-hotel-bhubaneswar",
      type: "Hotel",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.6,
      reviewCount: 87,
      capacity: 300,
      indoorCap: 300,
      outdoorCap: 100,
      parkingCap: 80,
      roomCount: 40,
      startingPrice: 75000,
      isVerified: true,
      isFeatured: false,
      description: "The Orchid Hotel offers sophisticated micro-banquets and conference halls perfect for intimate engagement ceremonies, birthday bashes, and executive business conferences.",
      address: "Jayadev Vihar Square, NH-16, Bhubaneswar, Odisha 751013",
      latitude: 20.296,
      longitude: 85.824,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Sound System", "Wi-Fi", "Guest Rooms", "Lift", "Restaurant Catering"],
      packages: [
        { name: "Party Package", price: 75000, description: "Ideal for birthdays & anniversaries", includes: JSON.stringify(["AC Banquet Hall for 4 hours", "Standard Sound & Mic", "Complimentary 2 AC Rooms", "Dedicated Service Staff"]) },
      ],
    },
    {
      name: "Royal Heritage Convention",
      slug: "royal-heritage-convention-puri",
      type: "Convention Centre",
      cityName: "Puri",
      areaName: "Marine Drive",
      rating: 4.8,
      reviewCount: 156,
      capacity: 1200,
      indoorCap: 1200,
      outdoorCap: 800,
      parkingCap: 300,
      roomCount: 30,
      startingPrice: 250000,
      isVerified: true,
      isFeatured: true,
      description: "Royal Heritage Convention is Puri's flagship seaside convention complex with massive pillarless halls, grand ocean view lawns, and complete royal hospitality amenities.",
      address: "New Marine Drive Road, Near Light House, Puri, Odisha 752001",
      latitude: 19.798,
      longitude: 85.814,
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Stage", "Sound System", "Outdoor Lawn", "Guest Rooms", "Lift", "Wheelchair Access"],
      packages: [
        { name: "Grand Heritage Package", price: 250000, description: "Exclusive access to main convention hall & beach lawn", includes: JSON.stringify(["Pillarless Hall (1200 Cap)", "Seaside Outdoor Lawn", "15 Ocean View Rooms", "Helipad Access & Valet"]) },
      ],
    },
    {
      name: "Celebration Palace",
      slug: "celebration-palace-bhubaneswar",
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Saheed Nagar",
      rating: 4.7,
      reviewCount: 76,
      capacity: 600,
      indoorCap: 600,
      outdoorCap: 200,
      parkingCap: 120,
      roomCount: 8,
      startingPrice: 120000,
      isVerified: true,
      isFeatured: false,
      description: "Celebration Palace is a centrally located Kalyan Mandap in Saheed Nagar known for excellent connectivity, hygienic kitchen setup, and spacious dining facility.",
      address: "Janpath Road, Saheed Nagar, Bhubaneswar, Odisha 751007",
      latitude: 20.288,
      longitude: 85.843,
      images: [
        "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1200",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Sound System", "Wi-Fi", "Lift"],
      packages: [
        { name: "Mandap Standard", price: 120000, description: "Full day Mandap hall rental", includes: JSON.stringify(["Central AC Hall", "Separate Dining Floor", "8 Guest AC Rooms", "Generator Backup"]) },
      ],
    },
    {
      name: "Lotus Grand Hall",
      slug: "lotus-grand-hall-cuttack",
      type: "Banquet Hall",
      cityName: "Cuttack",
      areaName: "Link Road",
      rating: 4.5,
      reviewCount: 64,
      capacity: 450,
      indoorCap: 450,
      outdoorCap: 100,
      parkingCap: 70,
      roomCount: 6,
      startingPrice: 90000,
      isVerified: true,
      isFeatured: false,
      description: "Lotus Grand Hall features elegant contemporary interior aesthetics, adjustable mood lighting, and flexible seating layouts for weddings and social events.",
      address: "Near Badambadi Bus Stand, Link Road, Cuttack, Odisha 753012",
      latitude: 20.455,
      longitude: 85.875,
      images: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Stage", "Sound System", "Wi-Fi", "Lift"],
      packages: [
        { name: "Lotus Basic", price: 90000, description: "Hall rental for 12 hours", includes: JSON.stringify(["Main Hall AC", "Stage Lightings", "4 Deluxe AC Rooms"]) },
      ],
    },
    {
      name: "Dreamland Resort",
      slug: "dreamland-resort-puri",
      type: "Resort",
      cityName: "Puri",
      areaName: "VIP Road",
      rating: 4.8,
      reviewCount: 110,
      capacity: 900,
      indoorCap: 300,
      outdoorCap: 900,
      parkingCap: 180,
      roomCount: 20,
      startingPrice: 195000,
      isVerified: true,
      isFeatured: true,
      description: "Dreamland Resort provides a magical tropical landscape with palm trees, open-air lawns, and beachside breeze for romantic wedding celebrations.",
      address: "VIP Road, Near District Court, Puri, Odisha 752002",
      latitude: 19.805,
      longitude: 85.825,
      images: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Guest Rooms", "Swimming Pool", "Wi-Fi"],
      packages: [
        { name: "Resort Wedding", price: 195000, description: "Lawn and pool area package", includes: JSON.stringify(["Outdoor Wedding Lawn", "Poolside Function Space", "12 Air Conditioned Rooms"]) },
      ],
    },
    {
      name: "Silver Pearl Banquet",
      slug: "silver-pearl-banquet-bhubaneswar",
      type: "Party Hall",
      cityName: "Bhubaneswar",
      areaName: "Nayapalli",
      rating: 4.6,
      reviewCount: 52,
      capacity: 250,
      indoorCap: 250,
      outdoorCap: 0,
      parkingCap: 50,
      roomCount: 4,
      startingPrice: 60000,
      isVerified: true,
      isFeatured: false,
      description: "Silver Pearl Banquet is a cozy party hall tailor-made for birthdays, ring ceremonies, baby showers, and get-togethers.",
      address: "IRC Village, Nayapalli, Bhubaneswar, Odisha 751015",
      latitude: 20.301,
      longitude: 85.811,
      images: [
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Stage", "Sound System", "Wi-Fi", "Lift"],
      packages: [
        { name: "Party Standard", price: 60000, description: "Hall rental with basic audio", includes: JSON.stringify(["AC Hall", "Music system with Mic", "2 Changing Rooms"]) },
      ],
    },
    {
      name: "Utsav Palace",
      slug: "utsav-palace-rourkela",
      type: "Kalyan Mandap",
      cityName: "Rourkela",
      areaName: "Civil Township",
      rating: 4.7,
      reviewCount: 89,
      capacity: 700,
      indoorCap: 700,
      outdoorCap: 300,
      parkingCap: 150,
      roomCount: 15,
      startingPrice: 110000,
      isVerified: true,
      isFeatured: false,
      description: "Utsav Palace is Rourkela's premier celebration hall boasting traditional architectural charm, spacious grounds, and warm hospitality.",
      address: "Main Road, Civil Township, Rourkela, Odisha 769004",
      latitude: 22.227,
      longitude: 84.856,
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Guest Rooms"],
      packages: [
        { name: "Utsav Special", price: 110000, description: "Mandap and room package", includes: JSON.stringify(["AC Main Hall", "10 Deluxe Rooms", "Generators & Kitchen"]) },
      ],
    },
    {
      name: "Emerald Garden & Convention",
      slug: "emerald-garden-kolkata",
      type: "Lawn",
      cityName: "Kolkata",
      areaName: "Salt Lake",
      rating: 4.9,
      reviewCount: 140,
      capacity: 1500,
      indoorCap: 600,
      outdoorCap: 1500,
      parkingCap: 300,
      roomCount: 18,
      startingPrice: 220000,
      isVerified: true,
      isFeatured: true,
      description: "Emerald Garden is a premier high-end wedding lawn and banquet setup in Salt Lake Sector V, offering serene water features and grand fairy-light lawn setups.",
      address: "Near KIIT Campus, Bhubaneswar",
      latitude: 22.572,
      longitude: 88.437,
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Stage", "Sound System", "Wi-Fi", "Guest Rooms"],
      packages: [
        { name: "Royal Lawn", price: 220000, description: "Lawn and hall combined rental", includes: JSON.stringify(["20,000 sqft Lawns", "AC Glass House Banquet", "10 Rooms"]) },
      ],
    },
    {
      name: "Sapphire Luxury Hall",
      slug: "sapphire-luxury-hall-hyderabad",
      type: "Banquet Hall",
      cityName: "Hyderabad",
      areaName: "Banjara Hills",
      rating: 4.8,
      reviewCount: 175,
      capacity: 650,
      indoorCap: 650,
      outdoorCap: 200,
      parkingCap: 200,
      roomCount: 15,
      startingPrice: 190000,
      isVerified: true,
      isFeatured: true,
      description: "Located in the heart of Banjara Hills, Sapphire Luxury Hall delivers unmatched elegance, high ceilings, custom lighting rigs, and VIP valet services.",
      address: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
      latitude: 17.415,
      longitude: 78.434,
      images: [
        "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Sound System", "Wi-Fi", "Lift", "Wheelchair Access"],
      packages: [
        { name: "Sapphire VIP", price: 190000, description: "Full luxury banquet hall", includes: JSON.stringify(["Central AC Banquet", "VIP Lounge", "Valet Service", "Stage & LED Tech"]) },
      ],
    },
    {
      name: "Hotel Swosti Premium Convention",
      slug: "hotel-swosti-premium-bhubaneswar",
      type: "Hotel",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.9,
      reviewCount: 230,
      capacity: 1000,
      indoorCap: 1000,
      outdoorCap: 400,
      parkingCap: 250,
      roomCount: 100,
      startingPrice: 300000,
      isVerified: true,
      isFeatured: true,
      description: "5-Star luxury hospitality venue in Bhubaneswar offering pillarless ballrooms, international catering menu options, and world-class luxury accommodations.",
      address: "P1 Jayadev Vihar, Nandankanan Rd, Bhubaneswar, Odisha 751013",
      latitude: 20.302,
      longitude: 85.827,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Stage", "Sound System", "Wi-Fi", "Guest Rooms", "Lift", "Restaurant Catering", "Wheelchair Access"],
      packages: [
        { name: "5-Star Wedding Experience", price: 300000, description: "Ballroom & Suite Rooms package", includes: JSON.stringify(["Pillarless Grand Ballroom", "Presidential Suite for Couple", "15 Deluxe Guest Rooms", "5-Star Chef Menu Consultation"]) },
      ],
    },
    {
      name: "Crystal Palace Banquet",
      slug: "crystal-palace-bangalore",
      type: "Banquet Hall",
      cityName: "Bangalore",
      areaName: "Indiranagar",
      rating: 4.7,
      reviewCount: 95,
      capacity: 400,
      indoorCap: 400,
      outdoorCap: 100,
      parkingCap: 90,
      roomCount: 8,
      startingPrice: 135000,
      isVerified: true,
      isFeatured: false,
      description: "Crystal Palace is a sleek modern banquet facility in Indiranagar featuring mood-synced lighting, modern acoustic panels, and premium decor options.",
      address: "100 Feet Road, Indiranagar, Bangalore, Karnataka 560038",
      latitude: 12.978,
      longitude: 77.641,
      images: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Stage", "Sound System", "Wi-Fi", "Lift"],
      packages: [
        { name: "Crystal Luxe", price: 135000, description: "Banquet hall with high-tech AV", includes: JSON.stringify(["AC Hall", "In-built DJ console", "4 AC Rooms"]) },
      ],
    },
    {
      name: "Mayfair Convention",
      slug: "mayfair-convention-bhubaneswar",
      type: "Convention Centre",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.9,
      reviewCount: 310,
      capacity: 2000,
      indoorCap: 1500,
      outdoorCap: 1000,
      parkingCap: 400,
      roomCount: 60,
      startingPrice: 350000,
      isVerified: true,
      isFeatured: true,
      description: "Mayfair Convention is one of Eastern India's largest and most prestigious event venues, featuring expansive convention halls, lagoon views, and world-class luxury.",
      address: "Near Jayadev Vihar, Mayfair Lagoon Rd, Bhubaneswar, Odisha 751013",
      latitude: 20.305,
      longitude: 85.829,
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Stage", "Sound System", "Wi-Fi", "Guest Rooms", "Lift", "Wheelchair Access"],
      packages: [
        { name: "Mayfair Royal Convention", price: 350000, description: "Mega convention hall package", includes: JSON.stringify(["Grand Convention Hall (2000 Cap)", "Lagoon Lawn Access", "Executive Suites"]) },
      ],
    },
    {
      name: "Galaxy Party Lawn",
      slug: "galaxy-party-lawn-mumbai",
      type: "Lawn",
      cityName: "Mumbai",
      areaName: "Juhu",
      rating: 4.8,
      reviewCount: 160,
      capacity: 750,
      indoorCap: 200,
      outdoorCap: 750,
      parkingCap: 120,
      roomCount: 10,
      startingPrice: 280000,
      isVerified: true,
      isFeatured: true,
      description: "Galaxy Party Lawn in Juhu offers open-to-sky beachside lawn vibes with palm trees, wooden gazebos, and luxury lounge seating for celebrity-style parties.",
      address: "Juhu Tara Road, Juhu, Mumbai, Maharashtra 400049",
      latitude: 19.098,
      longitude: 72.826,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Sound System", "Wi-Fi", "Guest Rooms"],
      packages: [
        { name: "Juhu Beach Lawn", price: 280000, description: "Open lawn evening rental", includes: JSON.stringify(["Beachfront Lawn", "AC Lounge", "Green Room", "Valet Parking"]) },
      ],
    },
    {
      name: "Golden Pavilion",
      slug: "golden-pavilion-delhi",
      type: "Kalyan Mandap",
      cityName: "Delhi",
      areaName: "Chattarpur",
      rating: 4.8,
      reviewCount: 205,
      capacity: 1500,
      indoorCap: 800,
      outdoorCap: 1500,
      parkingCap: 500,
      roomCount: 20,
      startingPrice: 320000,
      isVerified: true,
      isFeatured: true,
      description: "Golden Pavilion Chattarpur is a sprawling farm house wedding venue with majestic palace facade, sparkling fountain entry, and huge lawn capacity.",
      address: "Main Chattarpur Temple Road, New Delhi 110074",
      latitude: 28.502,
      longitude: 77.185,
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Outdoor Lawn", "Stage", "Sound System", "Wi-Fi", "Guest Rooms"],
      packages: [
        { name: "Palace Farmhouse Package", price: 320000, description: "Full farmhouse lawn & hall", includes: JSON.stringify(["Palace Lawns", "AC Indoor Hall", "15 Deluxe Rooms", "Fountain Illumination"]) },
      ],
    },
    {
      name: "Marigold Banquet",
      slug: "marigold-banquet-berhampur",
      type: "Banquet Hall",
      cityName: "Berhampur",
      areaName: "Giri Road",
      rating: 4.6,
      reviewCount: 48,
      capacity: 500,
      indoorCap: 500,
      outdoorCap: 150,
      parkingCap: 80,
      roomCount: 8,
      startingPrice: 85000,
      isVerified: true,
      isFeatured: false,
      description: "Marigold Banquet is Berhampur's trusted celebration venue with elegant interiors, central location, and friendly service.",
      address: "Giri Road, Near City High School, Berhampur, Odisha 760005",
      latitude: 19.315,
      longitude: 84.794,
      images: [
        "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Sound System"],
      packages: [
        { name: "Marigold Standard", price: 85000, description: "Full day banquet hall", includes: JSON.stringify(["AC Hall", "Stage Setup", "6 Rooms"]) },
      ],
    },
    {
      name: "Divine Celebration Hall",
      slug: "divine-celebration-hall-bhubaneswar",
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Khandagiri",
      rating: 4.7,
      reviewCount: 68,
      capacity: 550,
      indoorCap: 550,
      outdoorCap: 200,
      parkingCap: 100,
      roomCount: 10,
      startingPrice: 95000,
      isVerified: true,
      isFeatured: false,
      description: "Divine Celebration Hall is situated near Khandagiri square offering serene hill views, spacious parking, and well-maintained event infrastructure.",
      address: "Khandagiri Square, NH-16, Bhubaneswar, Odisha 751030",
      latitude: 20.258,
      longitude: 85.789,
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Kitchen", "Stage", "Guest Rooms", "Lift"],
      packages: [
        { name: "Divine Basic", price: 95000, description: "Mandap package with 8 AC rooms", includes: JSON.stringify(["Main AC Mandap", "Separate Dining Zone", "8 AC Rooms"]) },
      ],
    },
    {
      name: "Pride Convention Center",
      slug: "pride-convention-center-cuttack",
      type: "Convention Centre",
      cityName: "Cuttack",
      areaName: "CDA Sector 9",
      rating: 4.8,
      reviewCount: 92,
      capacity: 1100,
      indoorCap: 1100,
      outdoorCap: 400,
      parkingCap: 200,
      roomCount: 14,
      startingPrice: 160000,
      isVerified: true,
      isFeatured: true,
      description: "Pride Convention Center in CDA Sector 9 Cuttack is designed for massive wedding receptions, corporate expos, and cultural conventions with top-tier acoustic engineering.",
      address: "CDA Sector 9, Cuttack, Odisha 753014",
      latitude: 20.472,
      longitude: 85.845,
      images: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
      ],
      amenities: ["Air Conditioning", "Parking", "Generator Backup", "Bridal Room", "Stage", "Sound System", "Wi-Fi", "Guest Rooms", "Lift", "Wheelchair Access"],
      packages: [
        { name: "Convention Premier", price: 160000, description: "Main convention hall rental", includes: JSON.stringify(["Grand AC Convention Hall", "Audio Visual Setup", "10 Deluxe AC Rooms"]) },
      ],
    },
  ];

  const createdVenues = [];

  for (const vData of venuesData) {
    const cityInfo = cityMap[vData.cityName];
    const cityId = cityInfo ? cityInfo.id : Object.values(cityMap)[0].id;
    const areaId = cityInfo && cityInfo.areas[vData.areaName] ? cityInfo.areas[vData.areaName] : undefined;

    const venue = await prisma.venue.create({
      data: {
        name: vData.name,
        slug: vData.slug,
        type: vData.type,
        description: vData.description,
        address: vData.address,
        cityId,
        areaId,
        rating: vData.rating,
        reviewCount: vData.reviewCount,
        capacity: vData.capacity,
        indoorCap: vData.indoorCap,
        outdoorCap: vData.outdoorCap,
        parkingCap: vData.parkingCap,
        roomCount: vData.roomCount,
        startingPrice: vData.startingPrice,
        isVerified: vData.isVerified,
        isFeatured: vData.isFeatured,
        latitude: vData.latitude,
        longitude: vData.longitude,
        nearbyInfo: JSON.stringify({
          airport: "Biju Patnaik International Airport (12 km)",
          railway: "Bhubaneswar Railway Station (8 km)",
          bus: "Baramunda ISBT (6 km)",
        }),
        policies: JSON.stringify([
          "Advance deposit: 25% required to confirm booking via coordinator",
          "Cancellation policy: Refundable up to 30 days prior to event date",
          "Outside catering allowed with kitchen utility fee",
          "DJ allowed till 10:00 PM per city noise regulations",
          "Alcohol permitted only with requisite excise license",
        ]),
        faqs: JSON.stringify([
          { q: "Is outside catering allowed at this venue?", a: "Yes, outside catering is permitted with prior approval from venue management." },
          { q: "How many rooms are included with the venue rental?", a: "Standard package includes 6 to 10 complimentary AC guest rooms depending on the package." },
          { q: "Is there sufficient parking space available?", a: "Yes, dedicated paved parking is available on-site with optional valet assistant staff." },
          { q: "What is the policy on loud music and DJ?", a: "DJ and amplification system can be operated inside the air-conditioned hall until 10 PM." },
        ]),
      },
    });

    createdVenues.push(venue);

    // Images
    for (let i = 0; i < vData.images.length; i++) {
      await prisma.venueImage.create({
        data: {
          venueId: venue.id,
          url: vData.images[i],
          isPrimary: i === 0,
          sortOrder: i,
          caption: `${venue.name} View ${i + 1}`,
        },
      });
    }

    // Amenities
    for (const am of vData.amenities) {
      await prisma.venueAmenity.create({
        data: {
          venueId: venue.id,
          name: am,
        },
      });
    }

    // Packages
    for (const pkg of vData.packages) {
      await prisma.venuePackage.create({
        data: {
          venueId: venue.id,
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          includes: pkg.includes,
        },
      });
    }

    // Map to Venue Category
    const catId = venueCategoryMap[vData.type];
    if (catId) {
      await prisma.venueCategoryMapping.create({
        data: {
          venueId: venue.id,
          categoryId: catId,
        },
      });
    }

    // Create Demo Reviews for Venue (at least 2-3 reviews per venue)
    const demoReviewers = [
      { name: "Rahul S.", rating: 5, comment: "Beautiful venue and very helpful staff. Our wedding function went extremely smooth!" },
      { name: "Priya M.", rating: 5, comment: "Excellent place for a wedding reception. Huge dining area and great stage setup." },
      { name: "Amit Kumar", rating: 4, comment: "Spacious AC hall with ample parking. Celibrate team made coordination seamless." },
      { name: "Sasmita Rout", rating: 5, comment: "Highly recommended Kalyan Mandap! Rooms were pristine and spacious." },
    ];

    for (let rIdx = 0; rIdx < 2; rIdx++) {
      const r = demoReviewers[(createdVenues.length + rIdx) % demoReviewers.length];
      await prisma.review.create({
        data: {
          venueId: venue.id,
          userId: demoUser.id,
          userName: r.name,
          rating: r.rating,
          comment: r.comment,
          isVerified: true,
        },
      });
    }
  }

  console.log(`Created ${createdVenues.length} venues with images, amenities, packages & reviews.`);

  // Demo Vendors (15 Vendors)
  const vendorsData = [
    { name: "Royal Feast Caterers", category: "Catering", city: "Bhubaneswar", rating: 4.9, reviewCount: 88, startingPrice: "₹450 per plate", image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800", description: "Authentic Odia, North Indian & Chinese buffet live catering specialists.", phone: "+91 98111 22233" },
    { name: "Aura Floral & Event Decor", category: "Decoration", city: "Bhubaneswar", rating: 4.8, reviewCount: 64, startingPrice: "₹35,000 per event", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800", description: "Bespoke mandap design, theme floral arches, photobooth, and entrance decor.", phone: "+91 98222 33344" },
    { name: "Cinematic Memories Studio", category: "Photography", city: "Bhubaneswar", rating: 4.9, reviewCount: 112, startingPrice: "₹40,000 per day", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800", description: "Candid wedding photography, 4K cinematic film, drone shots & pre-wedding shoots.", phone: "+91 98333 44455" },
    { name: "DJ beats & Lighting Crew", category: "DJ", city: "Bhubaneswar", rating: 4.7, reviewCount: 45, startingPrice: "₹15,000 per event", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800", description: "High-energy sound setup, intelligent moving head lights, smoke machines & DJ mix.", phone: "+91 98444 55566" },
    { name: "Glamour Touch Bridal Makeover", category: "Makeup", city: "Bhubaneswar", rating: 4.9, reviewCount: 78, startingPrice: "₹12,000 per look", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800", description: "HD & Airbrush bridal makeup, saree draping, and hair styling experts.", phone: "+91 98555 66677" },
    { name: "Traditional Mehendi Artistry", category: "Mehendi", city: "Cuttack", rating: 4.8, reviewCount: 52, startingPrice: "₹3,500 per bride", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800", description: "Intricate Arabic, Rajasthani, and figure bridal mehendi designs.", phone: "+91 98666 77788" },
    { name: "Subh Vibah Event Planners", category: "Event Planner", city: "Bhubaneswar", rating: 4.9, reviewCount: 95, startingPrice: "₹50,000 management fee", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800", description: "Turnkey wedding management, guest hospitality, vendor coordination & RSVP.", phone: "+91 98777 88899" },
    { name: "Royal Cards & Digital Invites", category: "Invitation", city: "Bhubaneswar", rating: 4.6, reviewCount: 34, startingPrice: "₹45 per card", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800", description: "Traditional wedding invitation boxes, laser-cut acrylic cards, and digital animated videos.", phone: "+91 98888 99900" },
    { name: "Celebration Express Cabs & Luxury Cars", category: "Transportation", city: "Bhubaneswar", rating: 4.8, reviewCount: 60, startingPrice: "₹8,000 per car", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800", description: "Luxury vintage cars for groom entry, Mercedes/Audi wedding rentals & guest Tempo Travellers.", phone: "+91 98999 00011" },
    { name: "Shree Jagannath Catering", category: "Catering", city: "Puri", rating: 4.9, reviewCount: 73, startingPrice: "₹400 per plate", image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800", description: "Traditional Mahaprasad-style pure vegetarian and traditional feasts.", phone: "+91 99000 11122" },
    { name: "Blossom Events & Stage Crafts", category: "Decoration", city: "Cuttack", rating: 4.7, reviewCount: 41, startingPrice: "₹28,000 per event", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800", description: "Modern pastel wedding stage themes, Haldi/Sangeet decor installations.", phone: "+91 99111 22233" },
    { name: "Pixel Perfect Photographers", category: "Photography", city: "Kolkata", rating: 4.8, reviewCount: 130, startingPrice: "₹45,000 per day", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800", description: "Creative wedding storytellers capturing authentic emotion.", phone: "+91 99222 33344" },
    { name: "Groove Nation DJ & Live Band", category: "DJ", city: "Hyderabad", rating: 4.9, reviewCount: 88, startingPrice: "₹22,000 per event", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800", description: "Celebrity DJs and live percussionist performance team.", phone: "+91 99333 44455" },
    { name: "Velvet Touch Makeup Art", category: "Makeup", city: "Bangalore", rating: 4.8, reviewCount: 92, startingPrice: "₹15,000 per look", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800", description: "Modern editorial and classic south-indian bride makeovers.", phone: "+91 99444 55566" },
    { name: "Starline Event Management", category: "Event Planner", city: "Delhi", rating: 4.9, reviewCount: 140, startingPrice: "₹1,00,000 management fee", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800", description: "Full scale destination wedding planners across India.", phone: "+91 99555 66677" },
  ];

  for (const vd of vendorsData) {
    await prisma.vendor.create({
      data: {
        name: vd.name,
        category: vd.category,
        city: vd.city,
        rating: vd.rating,
        reviewCount: vd.reviewCount,
        startingPrice: vd.startingPrice,
        image: vd.image,
        description: vd.description,
        phone: vd.phone,
        isVerified: true,
      },
    });
  }

  console.log("Created 15 vendors.");

  // Create Demo Enquiries (20 Enquiries)
  const firstVenue = createdVenues[0];
  const demoEnquiry = await prisma.enquiry.create({
    data: {
      enquiryNumber: "ENQ-202609-10245",
      userId: demoUser.id,
      venueId: firstVenue.id,
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      customerEmail: "customer@celibrate.demo",
      eventType: "Wedding",
      eventDate: new Date("2026-12-25"),
      guestCount: 500,
      preferredTime: "Evening",
      budget: "₹1–2 Lakh",
      message: "Looking for full mandap booking with catering and bridal room facilities.",
      status: "Discussion",
    },
  });

  // Services requested for demo enquiry
  const reqServices = ["Venue", "Catering", "Decoration", "Photography"];
  for (const sName of reqServices) {
    await prisma.enquiryService.create({
      data: {
        enquiryId: demoEnquiry.id,
        serviceName: sName,
      },
    });
  }

  // Status History
  await prisma.enquiryStatusHistory.createMany({
    data: [
      { enquiryId: demoEnquiry.id, status: "Submitted", note: "Enquiry submitted by customer online", createdAt: new Date("2026-09-29T10:00:00Z") },
      { enquiryId: demoEnquiry.id, status: "Received", note: "Enquiry assigned to Celibrate Event Coordinator", createdAt: new Date("2026-09-29T10:30:00Z") },
      { enquiryId: demoEnquiry.id, status: "Contacted", note: "Customer contacted via phone to discuss date availability", createdAt: new Date("2026-09-29T11:15:00Z") },
      { enquiryId: demoEnquiry.id, status: "Discussion", note: "Venue discussion in progress for custom package pricing", createdAt: new Date("2026-09-29T12:00:00Z") },
    ],
  });

  // Add 19 more diverse enquiries for admin & history demonstration
  const statuses = ["Submitted", "Received", "Contacted", "Discussion", "Quotation", "Confirmed"];
  const eventTypes = ["Wedding", "Birthday", "Reception", "Corporate Event", "Engagement"];

  for (let eIdx = 1; eIdx < 20; eIdx++) {
    const venue = createdVenues[eIdx % createdVenues.length];
    const status = statuses[eIdx % statuses.length];
    const num = 10245 + eIdx;

    const enq = await prisma.enquiry.create({
      data: {
        enquiryNumber: `ENQ-202609-${num}`,
        userId: demoUser.id,
        venueId: venue.id,
        customerName: demoUser.name,
        customerPhone: demoUser.phone || "+91 98765 43210",
        customerEmail: demoUser.email,
        eventType: eventTypes[eIdx % eventTypes.length],
        eventDate: new Date(2026, 11, 10 + eIdx),
        guestCount: 200 + (eIdx * 50),
        preferredTime: eIdx % 2 === 0 ? "Evening" : "Full Day",
        budget: eIdx % 2 === 0 ? "₹1–2 Lakh" : "₹2–5 Lakh",
        message: `Special inquiry for ${venue.name} regarding package availability and custom decorations.`,
        status,
      },
    });

    await prisma.enquiryService.create({
      data: { enquiryId: enq.id, serviceName: "Venue" },
    });
    if (eIdx % 2 === 0) {
      await prisma.enquiryService.create({
        data: { enquiryId: enq.id, serviceName: "Catering" },
      });
    }

    await prisma.enquiryStatusHistory.create({
      data: { enquiryId: enq.id, status: "Submitted", note: "Enquiry submitted" },
    });
    if (status !== "Submitted") {
      await prisma.enquiryStatusHistory.create({
        data: { enquiryId: enq.id, status, note: `Status updated to ${status}` },
      });
    }
  }

  console.log("Created 20 demo enquiries.");

  // Demo Favorites
  await prisma.favorite.create({
    data: {
      userId: demoUser.id,
      venueId: createdVenues[0].id,
    },
  });
  await prisma.favorite.create({
    data: {
      userId: demoUser.id,
      venueId: createdVenues[1].id,
    },
  });
  await prisma.favorite.create({
    data: {
      userId: demoUser.id,
      venueId: createdVenues[2].id,
    },
  });

  // Blog Posts (10 Blog Posts)
  const blogPostsData = [
    {
      title: "How to Choose the Perfect Wedding Venue in 7 Easy Steps",
      slug: "how-to-choose-the-perfect-wedding-venue",
      category: "Wedding Advice",
      excerpt: "Selecting your dream wedding venue requires balancing guest count, location accessibility, budget, and season. Here is your definitive checklist.",
      content: `
Selecting a wedding venue is one of the biggest decisions in your wedding planning journey. Your venue sets the tone, decor aesthetics, guest comfort, and photo backdrops for your big day.

### 1. Estimate Your Guest Count First
Before visiting any venue, finalize an approximate guest list. Booking a 1000-capacity hall for 200 guests makes the hall look empty, while fitting 500 guests into a 300-capacity mandap creates congestion.

### 2. Determine Your Overall Budget
Remember that venue costs typically account for 25% to 30% of your total celebration budget. Keep room for catering, floral decoration, bridal makeup, and photography.

### 3. Consider Location & Accessibility
Choose a location easily accessible via main roads or railway stations, especially for outstation guests coming for the ceremony.

### 4. Check Amenities & AC Infrastructure
In cities like Bhubaneswar or Kolkata, reliable air conditioning, power backup generators, and spacious dining floors are absolute must-haves.

### 5. Inquire About Parking and Guest Rooms
Adequate parking space for 100+ vehicles and 6 to 10 guest rooms for immediate family makes the event stress-free.

At **Celibrate**, our event coordinators help you compare venues and negotiate the best package tailored to your exact event date!
      `,
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000",
      readTime: "6 min read",
    },
    {
      title: "Top 10 Best Wedding Venues & Kalyan Mandaps in Bhubaneswar",
      slug: "best-wedding-venues-in-bhubaneswar",
      category: "Destination Guides",
      excerpt: "Explore the most sought-after Kalyan Mandaps, luxury hotels, and banquet halls in Bhubaneswar for an unforgettable wedding.",
      content: "Bhubaneswar is home to majestic venues blending temple city tradition with modern 5-star luxury. Discover top picks like Royal Celebration Mandap, Grand Palace Banquet, and Hotel Swosti Premium.",
      image: "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1000",
      readTime: "8 min read",
    },
    {
      title: "How Much Does a Wedding Venue Cost in Odisha? Complete Price Breakdown",
      slug: "wedding-venue-cost-guide-odisha",
      category: "Budget & Pricing",
      excerpt: "Detailed breakdown of Kalyan Mandap rental costs, decorator pricing, AC charges, and seasonal price variations across Odisha.",
      content: "Understanding venue rental charges from ₹75,000 micro-banquets to ₹3,500,000 resort wedding setups in Bhubaneswar, Cuttack, and Puri.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000",
      readTime: "5 min read",
    },
    {
      title: "The Ultimate Indian Wedding Planning Checklist (12-Month Timeline)",
      slug: "ultimate-indian-wedding-planning-checklist",
      category: "Checklists",
      excerpt: "Month-by-month guide from venue discovery to bidai, ensuring zero last-minute panic for families.",
      content: "Step by step timeline covering muhurat dates, venue enquiry submission on Celibrate, catering tasting, sangeet choreographers, and invitation cards.",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000",
      readTime: "10 min read",
    },
    {
      title: "Best Birthday Party Venues & Halls for Unforgettable Celebrations",
      slug: "best-birthday-party-venues",
      category: "Parties",
      excerpt: "From kids themed birthday parties to milestone 50th birthday galas, find the right party space with DJ and catering.",
      content: "Explore party halls with vibrant lighting, balloons decor setup, customized kid-friendly menus, and DJ sound systems.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000",
      readTime: "4 min read",
    },
    {
      title: "How Many Guests Should I Plan For? Smart RSVP Estimation",
      slug: "how-many-guests-to-plan-for",
      category: "Planning Tips",
      excerpt: "Learn the 80% rule of wedding invitations and how to accurately calculate food plates and venue seating capacity.",
      content: "Avoid overpaying for unconsumed plates or creating crowded seating by following Celibrate's guest estimation formulas.",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1000",
      readTime: "5 min read",
    },
    {
      title: "Indoor Banquet vs Outdoor Lawn: Which Venue Type is Right for You?",
      slug: "indoor-banquet-vs-outdoor-lawn",
      category: "Venue Comparison",
      excerpt: "Weighing weather factors, air conditioning, photography lighting, and decor potential for open air vs AC halls.",
      content: "Detailed comparison matrix covering monsoon protection, summer heat, stage lighting options, and lawn rental dynamics.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
      readTime: "7 min read",
    },
    {
      title: "Top Corporate Event & Conference Venues with AV Tech Infrastructure",
      slug: "top-corporate-event-venues",
      category: "Corporate",
      excerpt: "Discover venues with high-speed Wi-Fi, LED wall screens, break-out conference rooms, and executive buffet setups.",
      content: "Top venues equipped for annual corporate conventions, product launches, award nights, and regional dealer meets.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000",
      readTime: "5 min read",
    },
    {
      title: "Destination Weddings in Puri: Beachside Mandaps & Ocean View Resorts",
      slug: "destination-weddings-in-puri",
      category: "Destination Guides",
      excerpt: "Why Puri is fast becoming Eastern India's favorite seaside wedding destination for auspicious celebrations.",
      content: "Combining divine blessings of Jagannath Dham with luxury oceanfront resorts like Royal Heritage and Dreamland Resort.",
      image: "https://images.unsplash.com/photo-1627894043065-45617894d510?q=80&w=1000",
      readTime: "6 min read",
    },
    {
      title: "Questions You MUST Ask Before Submitting a Venue Enquiry",
      slug: "questions-to-ask-venue-before-enquiry",
      category: "Checklists",
      excerpt: "Crucial questions on power backup duration, kitchen usage fees, DJ timing limits, and overnight room availability.",
      content: "Never submit an enquiry without keeping these 10 essential questions ready for your Celibrate coordinator.",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000",
      readTime: "4 min read",
    },
  ];

  for (const bp of blogPostsData) {
    await prisma.blogPost.create({ data: bp });
  }

  console.log("Created 10 blog posts.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
