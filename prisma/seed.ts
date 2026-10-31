import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Celibrate multi-role platform database...");

  // Clean existing tables in proper order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.eventExpense.deleteMany();
  await prisma.event.deleteMany();
  await prisma.paymentSchedule.deleteMany();
  await prisma.bookingPayment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.enquiryFollowUp.deleteMany();
  await prisma.enquiryActivity.deleteMany();
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
  await prisma.venueOwnerProfile.deleteMany();
  await prisma.area.deleteMany();
  await prisma.city.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.vendorService.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data.");

  // 1. Platform Settings
  const settingsData = [
    { key: "platform_name", value: "Celibrate", description: "Platform display name" },
    { key: "tagline", value: "Find the Perfect Place for Every Celebration", description: "Platform tagline" },
    { key: "contact_phone", value: "+91 98765 43210", description: "Customer care support phone" },
    { key: "contact_email", value: "support@celibrate.in", description: "Customer care support email" },
    { key: "whatsapp_number", value: "919876543210", description: "Official WhatsApp support number" },
    { key: "commission_type", value: "PERCENTAGE", description: "Commission calculation type (PERCENTAGE / FIXED)" },
    { key: "commission_rate", value: "5.0", description: "Platform commission rate in % or fixed amount" },
    { key: "currency", value: "INR", description: "Default currency code" },
    { key: "currency_symbol", value: "₹", description: "Default currency symbol" },
    { key: "tax_rate", value: "18.0", description: "Default GST/Tax percentage" },
    { key: "allow_instant_booking", value: "false", description: "Whether customers can book directly without enquiry (enforce false)" },
  ];

  for (const s of settingsData) {
    await prisma.platformSetting.create({ data: s });
  }

  // 2. Platform Users (Admin & Venue Owners)
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const ownerPasswordHash = await bcrypt.hash("Owner@123", 10);

  // ADMIN USER
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@celibrate.demo",
      password: adminPasswordHash,
      name: "Celibrate Platform Admin",
      phone: "+91 98765 00001",
      city: "Bhubaneswar",
      role: "ADMIN",
      isActive: true,
      isVerified: true,
    },
  });

  // MAIN VENUE OWNER: Rajesh Kumar (Royal Celebration Group)
  const mainOwnerUser = await prisma.user.create({
    data: {
      email: "owner@celibrate.demo",
      password: ownerPasswordHash,
      name: "Rajesh Kumar",
      phone: "+91 98765 11111",
      city: "Bhubaneswar",
      role: "VENUE_OWNER",
      isActive: true,
      isVerified: true,
    },
  });

  const mainOwnerProfile = await prisma.venueOwnerProfile.create({
    data: {
      userId: mainOwnerUser.id,
      businessName: "Royal Celebration Group",
      ownerName: "Rajesh Kumar",
      phone: "+91 98765 11111",
      email: "owner@celibrate.demo",
      city: "Bhubaneswar",
      address: "Plot 124, Near KIIT Square, Chandrasekharpur, Bhubaneswar",
      status: "APPROVED",
      verifiedAt: new Date("2026-01-10"),
    },
  });

  console.log("Seed Accounts Created:");
  console.log("  Admin:    admin@celibrate.demo / Admin@123");
  console.log("  Owner:    owner@celibrate.demo / Owner@123");

  // 9 Additional Venue Owners (total 10 owners)
  const additionalOwnersData = [
    { name: "Suresh Mohapatra", email: "suresh.palace@celibrate.demo", business: "Grand Palace Banquets Pvt Ltd", city: "Bhubaneswar", status: "APPROVED" },
    { name: "Debabrata Nayak", email: "debabrata.mayfair@celibrate.demo", business: "Mayfair Hospitality Group", city: "Bhubaneswar", status: "APPROVED" },
    { name: "Ananya Patnaik", email: "ananya.swosti@celibrate.demo", business: "Swosti Venues & Resorts", city: "Bhubaneswar", status: "APPROVED" },
    { name: "Pradeep Jena", email: "pradeep.pride@celibrate.demo", business: "Pride Conventions Cuttack", city: "Cuttack", status: "APPROVED" },
    { name: "Bikash Choudhury", email: "bikash.cuttack@celibrate.demo", business: "Heritage Celebrations Ltd", city: "Cuttack", status: "APPROVED" },
    { name: "Manoj Mishra", email: "manoj.puri@celibrate.demo", business: "Sea Pearl Destination Resorts", city: "Puri", status: "APPROVED" },
    { name: "Soumya Das", email: "soumya.rourkela@celibrate.demo", business: "Steel City Banquets", city: "Rourkela", status: "APPROVED" },
    { name: "Alok Senapati", email: "alok.pending@celibrate.demo", business: "Kalinga Royal Mandap", city: "Bhubaneswar", status: "PENDING_APPROVAL" },
    { name: "Pooja Mohanty", email: "pooja.suspended@celibrate.demo", business: "Golden Leaf Lawns", city: "Cuttack", status: "SUSPENDED" },
  ];

  const ownerUsers: { user: any; profile: any }[] = [{ user: mainOwnerUser, profile: mainOwnerProfile }];

  for (const o of additionalOwnersData) {
    const oUser = await prisma.user.create({
      data: {
        email: o.email,
        password: ownerPasswordHash,
        name: o.name,
        phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
        city: o.city,
        role: "VENUE_OWNER",
        isActive: o.status === "APPROVED",
        isVerified: o.status === "APPROVED",
      },
    });

    const oProfile = await prisma.venueOwnerProfile.create({
      data: {
        userId: oUser.id,
        businessName: o.business,
        ownerName: o.name,
        phone: oUser.phone || "+91 9800000000",
        email: o.email,
        city: o.city,
        address: `${o.city} Commercial Zone`,
        status: o.status,
        verifiedAt: o.status === "APPROVED" ? new Date("2026-02-15") : null,
      },
    });

    ownerUsers.push({ user: oUser, profile: oProfile });
  }



  // 3. Cities & Areas Data
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

  // 4. Event Categories
  const eventCategoriesData = [
    { name: "Wedding", slug: "wedding", description: "Beautiful venues for your special day with grand decor and dining", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", icon: "Heart" },
    { name: "Birthday", slug: "birthday", description: "Vibrant party halls and venues for unforgettable birthday celebrations", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000", icon: "Cake" },
    { name: "Engagement", slug: "engagement", description: "Elegant banquet spaces for ring ceremony and family gatherings", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000", icon: "Sparkles" },
    { name: "Reception", slug: "reception", description: "Grand reception halls with spacious stage, seating and catering options", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000", icon: "GlassWater" },
    { name: "Anniversary", slug: "anniversary", description: "Intimate and grand places to celebrate milestones of love", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1000", icon: "Award" },
    { name: "Corporate Event", slug: "corporate-event", description: "Professional venues with AV facilities for corporate dinners and meets", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000", icon: "Briefcase" },
    { name: "Conference", slug: "conference", description: "High-tech auditoriums and halls equipped for business conventions", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000", icon: "Presentation" },
    { name: "Party", slug: "party", description: "Trendy party spaces, lawns and rooftops with DJ and lounge setup", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000", icon: "Music" },
    { name: "Baby Shower", slug: "baby-shower", description: "Warm and cozy celebration spaces for welcoming the little one", image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000", icon: "Baby" },
    { name: "Cultural Event", slug: "cultural-event", description: "Spacious convention centres for traditional, cultural and community functions", image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000", icon: "Users" },
  ];

  const eventCategoryMap: Record<string, string> = {};
  for (const ec of eventCategoriesData) {
    const created = await prisma.eventCategory.create({ data: ec });
    eventCategoryMap[ec.slug] = created.id;
  }

  // 5. Venue Categories
  const venueTypes = ["Kalyan Mandap", "Banquet Hall", "Hotel", "Resort", "Lawn", "Convention Centre", "Party Hall"];
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

  // 6. 20 Venues with exact owners assigned
  const rawVenuesData = [
    {
      name: "Royal Celebration Mandap",
      slug: "royal-celebration-mandap-bhubaneswar",
      ownerIdx: 0, // Rajesh Kumar (main demo owner)
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
      description: "Royal Celebration Mandap is a premier flagship wedding venue in Bhubaneswar. It features grand air-conditioned halls, majestic royal mandap stage, luxury bridal suites, and a dedicated dining zone.",
      address: "Plot 124, Near KIIT Square, Chandrasekharpur, Bhubaneswar, Odisha 751024",
      status: "APPROVED",
      images: [
        { url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", category: "Exterior" },
        { url: "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1000", category: "Main Hall" },
        { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000", category: "Stage" },
        { url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000", category: "Dining" },
      ],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Dining Area", "Lift"],
      packages: [
        { name: "Basic Package", price: 100000, guestLimit: 250, description: "Standard mandap hall rental with basic setup", includes: JSON.stringify(["AC Main Hall (300 cap)", "Stage platform", "Generator Backup", "100 Guest Chairs", "Parking Space"]) },
        { name: "Premium Package", price: 175000, guestLimit: 500, description: "Enhanced decoration, stage lighting and dining access", includes: JSON.stringify(["Venue", "Decoration", "Stage", "Lighting", "Generator", "Parking", "Bridal Room", "4 Guest Rooms"]) },
        { name: "Luxury Package", price: 275000, guestLimit: 750, description: "Full luxury wedding package with 10 deluxe rooms & DJ", includes: JSON.stringify(["Full Mandap Exclusive Access", "Grand Floral Stage & Arch", "10 AC Deluxe Rooms", "DJ Sound & Moving Heads", "Valet Parking"]) },
      ],
    },
    {
      name: "Grand Palace Banquet",
      slug: "grand-palace-banquet-bhubaneswar",
      ownerIdx: 1,
      type: "Banquet Hall",
      cityName: "Bhubaneswar",
      areaName: "Patia",
      rating: 4.7,
      reviewCount: 98,
      capacity: 700,
      indoorCap: 700,
      outdoorCap: 200,
      parkingCap: 150,
      roomCount: 12,
      startingPrice: 125000,
      isVerified: true,
      isFeatured: true,
      description: "Grand Palace Banquet in Patia offers sophisticated banquet space with ornate crystal chandeliers and centralized air conditioning.",
      address: "Patia Main Road, Near Infocity, Bhubaneswar, Odisha 751024",
      status: "APPROVED",
      images: [
        { url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200", category: "Main Hall" },
        { url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", category: "Stage" },
      ],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Sound System", "Dining Area", "Lift"],
      packages: [
        { name: "Silver Banquet", price: 125000, guestLimit: 300, description: "Hall rental for up to 300 guests", includes: JSON.stringify(["AC Banquet Hall", "Stage Setup", "Bridal Suite"]) },
        { name: "Gold Banquet", price: 210000, guestLimit: 600, description: "Full banquet with dining zone and lights", includes: JSON.stringify(["Whole Hall", "Floral Decor", "6 AC Rooms", "Sound System"]) },
      ],
    },
    {
      name: "Mayfair Lagoon Convention",
      slug: "mayfair-lagoon-convention-bhubaneswar",
      ownerIdx: 2,
      type: "Hotel",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.9,
      reviewCount: 215,
      capacity: 1200,
      indoorCap: 800,
      outdoorCap: 1200,
      parkingCap: 300,
      roomCount: 40,
      startingPrice: 350000,
      isVerified: true,
      isFeatured: true,
      description: "5-star luxury property with lush lagoon-side lawns and high-ceilinged pillarless banquet halls.",
      address: "8-B, Jayadev Vihar, Bhubaneswar, Odisha 751013",
      status: "APPROVED",
      images: [
        { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200", category: "Exterior" },
        { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000", category: "Garden" },
      ],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Dining Area", "Lift", "Outdoor Area", "Wheelchair Access"],
      packages: [
        { name: "Lagoon Royal", price: 350000, guestLimit: 500, description: "5-star lawn and banquet combination", includes: JSON.stringify(["Lagoon Lawn + AC Hall", "Luxury Decor", "10 Deluxe Lake-view Rooms", "Valet Parking"]) },
      ],
    },
    {
      name: "Swosti Premium Grand Ballroom",
      slug: "swosti-premium-grand-ballroom-bhubaneswar",
      ownerIdx: 3,
      type: "Hotel",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.8,
      reviewCount: 174,
      capacity: 800,
      indoorCap: 800,
      outdoorCap: 300,
      parkingCap: 200,
      roomCount: 25,
      startingPrice: 200000,
      isVerified: true,
      isFeatured: true,
      description: "Renowned 5-star venue with state-of-the-art audiovisual setups, versatile partitions, and gourmet catering.",
      address: "P-1, Jayadev Vihar, Bhubaneswar, Odisha 751013",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Dining Area", "Lift"],
      packages: [{ name: "Grand Ballroom Royale", price: 200000, guestLimit: 400, description: "Ballroom with luxury setup", includes: JSON.stringify(["Grand Ballroom", "Stage & LED Backdrop", "4 Club Rooms"]) }],
    },
    {
      name: "Pride Convention Center",
      slug: "pride-convention-center-cuttack",
      ownerIdx: 4,
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
      description: "Massive air-conditioned convention center in CDA Cuttack designed for mega weddings and conventions.",
      address: "CDA Sector 9, Cuttack, Odisha 753014",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Dining Area", "Lift"],
      packages: [{ name: "Convention Standard", price: 160000, guestLimit: 600, description: "Mega hall rental", includes: JSON.stringify(["Convention Hall", "Audio System", "8 AC Rooms"]) }],
    },
    {
      name: "Sea Pearl Beach Resort",
      slug: "sea-pearl-beach-resort-puri",
      ownerIdx: 6,
      type: "Resort",
      cityName: "Puri",
      areaName: "Marine Drive",
      rating: 4.9,
      reviewCount: 145,
      capacity: 900,
      indoorCap: 400,
      outdoorCap: 900,
      parkingCap: 150,
      roomCount: 30,
      startingPrice: 280000,
      isVerified: true,
      isFeatured: true,
      description: "Enchanting ocean-facing resort for destination beach weddings on Puri Marine Drive.",
      address: "Marine Drive Road, Near Lighthouse, Puri, Odisha 752001",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200", category: "Exterior" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Guest Rooms", "Stage", "Outdoor Area", "Dining Area"],
      packages: [{ name: "Beachside Nuptials", price: 280000, guestLimit: 400, description: "Beach lawn package with rooms", includes: JSON.stringify(["Beachfront Lawn", "Floral Mandap", "12 AC Sea View Rooms"]) }],
    },
    {
      name: "Silver Oak Celebration Mandap",
      slug: "silver-oak-mandap-bhubaneswar",
      ownerIdx: 0, // Also owned by Rajesh Kumar! (Multi-venue support demonstration)
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Nayapalli",
      rating: 4.6,
      reviewCount: 64,
      capacity: 400,
      indoorCap: 400,
      outdoorCap: 150,
      parkingCap: 80,
      roomCount: 8,
      startingPrice: 85000,
      isVerified: true,
      isFeatured: false,
      description: "Affordable luxury kalyan mandap located in Nayapalli, operated by the Royal Celebration Group.",
      address: "VIP Road, Nayapalli, Bhubaneswar, Odisha 751012",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Bridal Room", "Stage", "Dining Area"],
      packages: [{ name: "Silver Basic", price: 85000, guestLimit: 250, description: "Standard Nayapalli mandap booking", includes: JSON.stringify(["AC Hall", "Stage", "Kitchen", "4 AC Rooms"]) }],
    },
    {
      name: "Heritage Garden Lawns",
      slug: "heritage-garden-lawns-cuttack",
      ownerIdx: 5,
      type: "Lawn",
      cityName: "Cuttack",
      areaName: "Cantonment Road",
      rating: 4.7,
      reviewCount: 77,
      capacity: 1000,
      indoorCap: 300,
      outdoorCap: 1000,
      parkingCap: 250,
      roomCount: 10,
      startingPrice: 140000,
      isVerified: true,
      isFeatured: false,
      description: "Sprawling manicured open-air lawns with vintage colonial aesthetic.",
      address: "Cantonment Road, Cuttack, Odisha 753001",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", category: "Garden" }],
      amenities: ["Parking", "Generator", "Bridal Room", "Stage", "Outdoor Area", "Dining Area"],
      packages: [{ name: "Garden Gala", price: 140000, guestLimit: 500, description: "Full lawn rental", includes: JSON.stringify(["Manicured Lawn", "Canopy setup", "Kitchen Area"]) }],
    },
    {
      name: "Steel City Banquet Hall",
      slug: "steel-city-banquet-rourkela",
      ownerIdx: 7,
      type: "Banquet Hall",
      cityName: "Rourkela",
      areaName: "Civil Township",
      rating: 4.6,
      reviewCount: 54,
      capacity: 600,
      indoorCap: 600,
      outdoorCap: 200,
      parkingCap: 120,
      roomCount: 8,
      startingPrice: 90000,
      isVerified: true,
      isFeatured: false,
      description: "Modern wedding and corporate banquet in Rourkela Civil Township.",
      address: "Civil Township, Rourkela, Odisha 769004",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Sound System", "Dining Area"],
      packages: [{ name: "Steel City Royale", price: 90000, guestLimit: 300, description: "Banquet package", includes: JSON.stringify(["AC Hall", "Lighting", "Stage"]) }],
    },
    {
      name: "Kalinga Royal Mandap",
      slug: "kalinga-royal-mandap-bhubaneswar",
      ownerIdx: 8, // Pending Approval Owner
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Mancheswar",
      rating: 4.5,
      reviewCount: 12,
      capacity: 450,
      indoorCap: 450,
      outdoorCap: 100,
      parkingCap: 70,
      roomCount: 6,
      startingPrice: 80000,
      isVerified: false,
      isFeatured: false,
      description: "New kalyan mandap awaiting administrative verification before public launch.",
      address: "Sector B, Mancheswar IE, Bhubaneswar 751010",
      status: "PENDING",
      images: [{ url: "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1000", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Stage"],
      packages: [{ name: "Introductory Package", price: 80000, guestLimit: 250, description: "Mandap launch rental", includes: JSON.stringify(["Hall", "Generator", "Stage"]) }],
    },
    {
      name: "Golden Leaf Lawns",
      slug: "golden-leaf-lawns-cuttack",
      ownerIdx: 9, // Suspended Owner
      type: "Lawn",
      cityName: "Cuttack",
      areaName: "Badambadi",
      rating: 4.2,
      reviewCount: 30,
      capacity: 500,
      indoorCap: 150,
      outdoorCap: 500,
      parkingCap: 60,
      roomCount: 4,
      startingPrice: 70000,
      isVerified: false,
      isFeatured: false,
      description: "Party lawn suspended due to license renewal.",
      address: "Badambadi Bus Stand Road, Cuttack 753012",
      status: "SUSPENDED",
      images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", category: "Garden" }],
      amenities: ["Parking", "Stage", "Dining Area"],
      packages: [{ name: "Suspended Package", price: 70000, guestLimit: 300, description: "Lawn rental", includes: JSON.stringify(["Lawn"]) }],
    },
    {
      name: "Vedic Villa Banquet",
      slug: "vedic-villa-banquet-bhubaneswar",
      ownerIdx: 1,
      type: "Banquet Hall",
      cityName: "Bhubaneswar",
      areaName: "Saheed Nagar",
      rating: 4.7,
      reviewCount: 82,
      capacity: 450,
      indoorCap: 450,
      outdoorCap: 100,
      parkingCap: 80,
      roomCount: 6,
      startingPrice: 95000,
      isVerified: true,
      isFeatured: false,
      description: "Centrally located AC banquet hall in Saheed Nagar ideal for receptions and engagements.",
      address: "Plot 34, Saheed Nagar, Bhubaneswar 751007",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Dining Area"],
      packages: [{ name: "Vedic Gold", price: 95000, guestLimit: 300, description: "Full AC hall", includes: JSON.stringify(["AC Hall", "Stage", "Bridal Room"]) }],
    },
    {
      name: "Puri Beach Resort & Convention",
      slug: "puri-beach-resort-convention",
      ownerIdx: 6,
      type: "Resort",
      cityName: "Puri",
      areaName: "VIP Road",
      rating: 4.8,
      reviewCount: 110,
      capacity: 800,
      indoorCap: 500,
      outdoorCap: 800,
      parkingCap: 180,
      roomCount: 20,
      startingPrice: 220000,
      isVerified: true,
      isFeatured: true,
      description: "Destination wedding resort near Puri golden beach.",
      address: "VIP Road, Near Sea Beach, Puri 752002",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200", category: "Exterior" }],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Guest Rooms", "Stage", "Outdoor Area"],
      packages: [{ name: "Puri Royale", price: 220000, guestLimit: 400, description: "Beach resort wedding package", includes: JSON.stringify(["Lawn + Hall", "8 Deluxe Rooms", "Beachside Mandap"]) }],
    },
    {
      name: "Bhubaneswar Club Grand Hall",
      slug: "bhubaneswar-club-grand-hall",
      ownerIdx: 2,
      type: "Banquet Hall",
      cityName: "Bhubaneswar",
      areaName: "Jayadev Vihar",
      rating: 4.9,
      reviewCount: 135,
      capacity: 650,
      indoorCap: 650,
      outdoorCap: 250,
      parkingCap: 150,
      roomCount: 10,
      startingPrice: 150000,
      isVerified: true,
      isFeatured: true,
      description: "Prestigious elite banquet with heritage colonial decor and manicured gardens.",
      address: "Club Road, Bhubaneswar 751001",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Sound System", "Dining Area"],
      packages: [{ name: "Elite Club Gala", price: 150000, guestLimit: 350, description: "Club hall package", includes: JSON.stringify(["Hall", "Catering Kitchen", "Stage", "4 Rooms"]) }],
    },
    {
      name: "Crown Plaza Convention Center",
      slug: "crown-plaza-convention-center-bhubaneswar",
      ownerIdx: 3,
      type: "Convention Centre",
      cityName: "Bhubaneswar",
      areaName: "Nayapalli",
      rating: 4.7,
      reviewCount: 89,
      capacity: 850,
      indoorCap: 850,
      outdoorCap: 200,
      parkingCap: 170,
      roomCount: 12,
      startingPrice: 180000,
      isVerified: true,
      isFeatured: false,
      description: "High-tech convention center with acoustic soundproofing and LED video walls.",
      address: "IRC Village, Nayapalli, Bhubaneswar 751015",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Lift"],
      packages: [{ name: "High-Tech Convention", price: 180000, guestLimit: 500, description: "Convention hall with AV", includes: JSON.stringify(["Acoustic Hall", "LED Wall", "Sound Tech"]) }],
    },
    {
      name: "Cuttack Club Heritage Banquet",
      slug: "cuttack-club-heritage-banquet",
      ownerIdx: 4,
      type: "Banquet Hall",
      cityName: "Cuttack",
      areaName: "Cantonment Road",
      rating: 4.8,
      reviewCount: 72,
      capacity: 550,
      indoorCap: 550,
      outdoorCap: 200,
      parkingCap: 100,
      roomCount: 8,
      startingPrice: 110000,
      isVerified: true,
      isFeatured: false,
      description: "Historic heritage banquet by the banks of the Mahanadi river.",
      address: "Barabati Fort Road, Cuttack 753001",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Dining Area"],
      packages: [{ name: "Heritage Classic", price: 110000, guestLimit: 300, description: "Classic banquet setup", includes: JSON.stringify(["River-facing Hall", "Stage", "Bridal Suite"]) }],
    },
    {
      name: "Rourkela Club Celebration Lawn",
      slug: "rourkela-club-celebration-lawn",
      ownerIdx: 7,
      type: "Lawn",
      cityName: "Rourkela",
      areaName: "Udit Nagar",
      rating: 4.6,
      reviewCount: 48,
      capacity: 750,
      indoorCap: 200,
      outdoorCap: 750,
      parkingCap: 130,
      roomCount: 6,
      startingPrice: 80000,
      isVerified: true,
      isFeatured: false,
      description: "Open sky landscaped lawn for grand weddings in Rourkela.",
      address: "Udit Nagar, Rourkela 769012",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000", category: "Garden" }],
      amenities: ["Parking", "Generator", "Stage", "Outdoor Area", "Kitchen"],
      packages: [{ name: "Lawn Festive", price: 80000, guestLimit: 400, description: "Lawn venue rental", includes: JSON.stringify(["Open Lawn", "Stage Platform", "Kitchen Area"]) }],
    },
    {
      name: "Kolkata City Center Banquet",
      slug: "kolkata-city-center-banquet",
      ownerIdx: 1,
      type: "Banquet Hall",
      cityName: "Kolkata",
      areaName: "Salt Lake",
      rating: 4.8,
      reviewCount: 160,
      capacity: 900,
      indoorCap: 900,
      outdoorCap: 300,
      parkingCap: 220,
      roomCount: 15,
      startingPrice: 220000,
      isVerified: true,
      isFeatured: true,
      description: "Modern upscale banquet in Salt Lake Sector 1, Kolkata.",
      address: "Block DC, Salt Lake, Kolkata 700064",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Dining Area", "Lift"],
      packages: [{ name: "Kolkata Royale", price: 220000, guestLimit: 500, description: "Full banquet hall rental", includes: JSON.stringify(["Grand Banquet", "Stage & Lights", "6 Deluxe Rooms"]) }],
    },
    {
      name: "Divine Celebration Hall",
      slug: "divine-celebration-hall-bhubaneswar",
      ownerIdx: 0, // 3rd venue for Rajesh Kumar! Demonstrating multi-venue portfolio
      type: "Kalyan Mandap",
      cityName: "Bhubaneswar",
      areaName: "Khandagiri",
      rating: 4.7,
      reviewCount: 78,
      capacity: 550,
      indoorCap: 550,
      outdoorCap: 200,
      parkingCap: 100,
      roomCount: 10,
      startingPrice: 95000,
      isVerified: true,
      isFeatured: false,
      description: "Serene mandap offering hill views, spacious parking, and well-maintained event infrastructure near Khandagiri.",
      address: "Khandagiri Square, NH-16, Bhubaneswar, Odisha 751030",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Kitchen", "Bridal Room", "Guest Rooms", "Stage", "Dining Area"],
      packages: [{ name: "Divine Basic", price: 95000, guestLimit: 300, description: "Mandap package with 8 AC rooms", includes: JSON.stringify(["Main AC Mandap", "Separate Dining Zone", "8 AC Rooms"]) }],
    },
    {
      name: "Regal Vista Banquets",
      slug: "regal-vista-banquets-cuttack",
      ownerIdx: 5,
      type: "Banquet Hall",
      cityName: "Cuttack",
      areaName: "Link Road",
      rating: 4.6,
      reviewCount: 65,
      capacity: 500,
      indoorCap: 500,
      outdoorCap: 150,
      parkingCap: 90,
      roomCount: 7,
      startingPrice: 105000,
      isVerified: true,
      isFeatured: false,
      description: "Conveniently located near Cuttack Link Road with grand reception hall.",
      address: "Link Road, Cuttack, Odisha 753012",
      status: "APPROVED",
      images: [{ url: "https://images.unsplash.com/photo-1545232979-fbfd42e000b5?q=80&w=1000", category: "Main Hall" }],
      amenities: ["AC", "Parking", "Generator", "Bridal Room", "Stage", "Dining Area"],
      packages: [{ name: "Regal Celebration", price: 105000, guestLimit: 350, description: "Banquet rental", includes: JSON.stringify(["AC Hall", "Lighting", "Stage Decor"]) }],
    },
  ];

  const createdVenues: any[] = [];
  for (const vData of rawVenuesData) {
    const cityInfo = cityMap[vData.cityName] || Object.values(cityMap)[0];
    const cityId = cityInfo.id;
    const areaId = cityInfo.areas[vData.areaName] || Object.values(cityInfo.areas)[0];
    const assignedOwner = ownerUsers[vData.ownerIdx % ownerUsers.length];

    const venue = await prisma.venue.create({
      data: {
        name: vData.name,
        slug: vData.slug,
        ownerId: assignedOwner.user.id,
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
        status: vData.status,
        isVerified: vData.isVerified,
        isFeatured: vData.isFeatured,
        latitude: 20.296 + Math.random() * 0.1,
        longitude: 85.824 + Math.random() * 0.1,
        nearbyInfo: JSON.stringify({
          airport: "Biju Patnaik International Airport (10 km)",
          railway: "Railway Station (6 km)",
          bus: "Main ISBT (4 km)",
        }),
        policies: JSON.stringify([
          "Advance deposit: 25% required to confirm booking via internal booking coordinator",
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
          url: vData.images[i].url,
          category: vData.images[i].category,
          isPrimary: i === 0,
          sortOrder: i,
          caption: `${venue.name} - ${vData.images[i].category}`,
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
          guestLimit: pkg.guestLimit,
          description: pkg.description,
          includes: pkg.includes,
          isActive: true,
        },
      });
    }

    // Venue category mapping
    const catId = venueCategoryMap[vData.type];
    if (catId) {
      await prisma.venueCategoryMapping.create({
        data: {
          venueId: venue.id,
          categoryId: catId,
        },
      });
    }
  }

  console.log(`Created ${createdVenues.length} Venues linked to Owners.`);

  // 7. Demo Vendors
  const vendorsData = [
    { name: "Royal Feast Caterers", category: "Catering", city: "Bhubaneswar", rating: 4.9, reviewCount: 88, startingPrice: "₹450 per plate", image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800", description: "Authentic Odia, North Indian & Chinese buffet live catering specialists.", phone: "+91 98111 22233" },
    { name: "Aura Floral & Event Decor", category: "Decoration", city: "Bhubaneswar", rating: 4.8, reviewCount: 64, startingPrice: "₹35,000 per event", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800", description: "Bespoke mandap design, theme floral arches, photobooth, and entrance decor.", phone: "+91 98222 33344" },
    { name: "Cinematic Memories Studio", category: "Photography", city: "Bhubaneswar", rating: 4.9, reviewCount: 112, startingPrice: "₹40,000 per day", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800", description: "Candid wedding photography, 4K cinematic film, drone shots & pre-wedding shoots.", phone: "+91 98333 44455" },
    { name: "DJ beats & Lighting Crew", category: "DJ", city: "Bhubaneswar", rating: 4.7, reviewCount: 45, startingPrice: "₹15,000 per event", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800", description: "High-energy sound setup, intelligent moving head lights, smoke machines & DJ mix.", phone: "+91 98444 55566" },
    { name: "Glamour Touch Bridal Makeover", category: "Makeup", city: "Bhubaneswar", rating: 4.9, reviewCount: 78, startingPrice: "₹12,000 per look", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800", description: "HD & Airbrush bridal makeup, saree draping, and hair styling experts.", phone: "+91 98555 66677" },
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

  // 8. Blog Posts
  const blogPostsData = [
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
  ];

  for (const bp of blogPostsData) {
    await prisma.blogPost.create({ data: bp });
  }

  // 9. Platform Notifications
  const notificationsData = [
    { role: "ADMIN", title: "New Venue Owner Registration", message: "Alok Senapati registered 'Kalinga Royal Mandap' and awaits admin approval.", link: "/admin/owners" },
    { role: "VENUE_OWNER", userId: mainOwnerUser.id, title: "Welcome to Celibrate", message: "Your venue profile is active. You can now manage your venue catalog and bookings.", link: "/owner/dashboard" },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // 10. Audit Logs
  const auditLogsData = [
    { action: "PLATFORM_INITIALIZED", entity: "System", entityId: "SYS-001", oldValue: null, newValue: "Celibrate Platform initialized", userRole: "ADMIN", userName: "Admin" },
    { action: "APPROVED_OWNER", entity: "VenueOwnerProfile", entityId: mainOwnerProfile.id, oldValue: "PENDING_APPROVAL", newValue: "APPROVED", userRole: "ADMIN", userName: "Admin" },
    { action: "APPROVED_VENUE", entity: "Venue", entityId: createdVenues[0].id, oldValue: "PENDING", newValue: "APPROVED", userRole: "ADMIN", userName: "Admin" },
    { action: "UPDATED_COMMISSION", entity: "PlatformSetting", entityId: "commission_rate", oldValue: "4.0", newValue: "5.0", userRole: "ADMIN", userName: "Admin" },
  ];

  for (const al of auditLogsData) {
    await prisma.auditLog.create({
      data: {
        action: al.action,
        entity: al.entity,
        entityId: al.entityId,
        oldValue: al.oldValue,
        newValue: al.newValue,
        userRole: al.userRole,
        userName: al.userName,
        ipAddress: "127.0.0.1",
      },
    });
  }

  console.log("Database seeded successfully with core catalog and platform settings!");
  console.log("Summary:");
  console.log("- 20 Venues");
  console.log("- 10 Venue Owners");
  console.log("- Categories, Cities, Areas, Vendors, Blog Posts & Settings");

  console.log(`Summary:`);
  console.log(`- 20 Venues`);
  console.log(`- 10 Venue Owners`);

}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
