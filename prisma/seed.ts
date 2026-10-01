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

  // 2. Demo Users (Admin, Main Venue Owner, Customer)
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const ownerPasswordHash = await bcrypt.hash("Owner@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);

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

  // MAIN DEMO CUSTOMER: Rahul Sharma
  const mainCustomerUser = await prisma.user.create({
    data: {
      email: "customer@celibrate.demo",
      password: customerPasswordHash,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      city: "Bhubaneswar",
      role: "CUSTOMER",
      isActive: true,
      isVerified: true,
    },
  });

  console.log("Demo Accounts Created:");
  console.log("  Admin:    admin@celibrate.demo / Admin@123");
  console.log("  Owner:    owner@celibrate.demo / Owner@123");
  console.log("  Customer: customer@celibrate.demo / Customer@123");

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

  // 100 Customers pool for realistic dashboard analytics & enquiries
  const customerNames = [
    "Rahul Sharma", "Priya Das", "Amit Verma", "Sunita Jena", "Rohan Mohanty",
    "Sneha Mishra", "Abhishek Swain", "Pooja Tripathy", "Deepak Panigrahi", "Megha Panda",
    "Vikram Sahoo", "Swati Rath", "Kiran Nayak", "Ankit Pradhan", "Divya Senapati",
    "Manas Mallik", "Archana Barik", "Siddharth Das", "Neha Kar", "Alok Behura",
    "Smruti Samal", "Tushar Pattnaik", "Madhusmita Biswal", "Subham Rout", "Lipika Das",
    "Prashant Behera", "Monali Mohapatra", "Debashis Lenka", "Payal Agarwal", "Sandeep Roy"
  ];

  const customerList: any[] = [mainCustomerUser];
  for (let i = 1; i <= 30; i++) {
    const name = customerNames[i % customerNames.length] + (i > customerNames.length ? ` ${i}` : "");
    const email = `customer${i}@celibrate.demo`;
    const cust = await prisma.user.create({
      data: {
        email,
        password: customerPasswordHash,
        name,
        phone: `+91 97${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: i % 2 === 0 ? "Bhubaneswar" : "Cuttack",
        role: "CUSTOMER",
      },
    });
    customerList.push(cust);
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

  // =========================================================================
  // 9. REQUIREMENT 60: DEMO DATA FOR RAJESH KUMAR (ROYAL CELEBRATION MANDAP)
  // 10 Enquiries, 5 Quotations, 5 Bookings, 10 Payments, 5 Reviews, Follow-ups
  // =========================================================================
  const royalVenue = createdVenues[0]; // Royal Celebration Mandap

  console.log("Seeding Rajesh Kumar (Royal Celebration Mandap) demo workflow data...");

  // 10 Enquiries for Royal Celebration Mandap across stages:
  const royalEnquiriesData = [
    {
      num: "ENQ-202610-10025",
      cust: mainCustomerUser,
      type: "Wedding",
      date: new Date("2026-11-15"),
      guests: 500,
      time: "Evening",
      budget: "₹1.5 - 2 Lakh",
      status: "BOOKED",
      msg: "Looking for entire venue for grand wedding reception with premium stage decoration and catering access.",
      services: ["Venue", "Decoration", "Catering", "DJ", "Rooms"],
    },
    {
      num: "ENQ-202610-10026",
      cust: customerList[1],
      type: "Engagement",
      date: new Date("2026-11-20"),
      guests: 250,
      time: "Evening",
      budget: "₹1 - 1.5 Lakh",
      status: "BOOKED",
      msg: "Ring ceremony celebration with floral entrance and stage backdrop.",
      services: ["Venue", "Decoration", "Photography"],
    },
    {
      num: "ENQ-202610-10027",
      cust: customerList[2],
      type: "Reception",
      date: new Date("2026-12-05"),
      guests: 600,
      time: "Evening",
      budget: "₹2 - 3 Lakh",
      status: "BOOKED",
      msg: "Post-wedding reception banquet dinner with buffet live counters.",
      services: ["Venue", "Catering", "Decoration", "DJ"],
    },
    {
      num: "ENQ-202610-10028",
      cust: customerList[3],
      type: "Birthday",
      date: new Date("2026-12-10"),
      guests: 150,
      time: "Evening",
      budget: "₹50,000 - 1 Lakh",
      status: "BOOKED",
      msg: "Grand 50th birthday party with DJ and dinner setup.",
      services: ["Venue", "DJ", "Decoration"],
    },
    {
      num: "ENQ-202610-10029",
      cust: customerList[4],
      type: "Wedding",
      date: new Date("2026-12-18"),
      guests: 450,
      time: "Full Day",
      budget: "₹2 - 2.5 Lakh",
      status: "BOOKED",
      msg: "Full day traditional Odia wedding with mandap havan and evening feast.",
      services: ["Venue", "Decoration", "Rooms", "Kitchen"],
    },
    {
      num: "ENQ-202610-10030",
      cust: customerList[5],
      type: "Wedding",
      date: new Date("2026-12-28"),
      guests: 550,
      time: "Evening",
      budget: "₹2 Lakh",
      status: "QUOTATION_SENT",
      msg: "Interested in Luxury Package for destination wedding reception.",
      services: ["Venue", "Decoration", "Rooms"],
    },
    {
      num: "ENQ-202610-10031",
      cust: customerList[6],
      type: "Corporate Event",
      date: new Date("2027-01-12"),
      guests: 300,
      time: "Full Day",
      budget: "₹1.5 Lakh",
      status: "NEGOTIATION",
      msg: "Annual regional dealer convention and banquet dinner.",
      services: ["Venue", "Sound System", "Dining Area"],
    },
    {
      num: "ENQ-202610-10032",
      cust: customerList[7],
      type: "Wedding",
      date: new Date("2027-01-20"),
      guests: 400,
      time: "Evening",
      budget: "₹1.8 Lakh",
      status: "SITE_VISIT",
      msg: "Customer requested on-site inspection of bride room and dining hall.",
      services: ["Venue", "Decoration"],
    },
    {
      num: "ENQ-202610-10033",
      cust: customerList[8],
      type: "Anniversary",
      date: new Date("2027-01-25"),
      guests: 180,
      time: "Evening",
      budget: "₹1 Lakh",
      status: "CONTACTED",
      msg: "Silver jubilee wedding anniversary celebration.",
      services: ["Venue", "Decoration", "DJ"],
    },
    {
      num: "ENQ-202610-10034",
      cust: customerList[9],
      type: "Wedding",
      date: new Date("2027-02-14"),
      guests: 500,
      time: "Evening",
      budget: "₹2.5 Lakh",
      status: "NEW",
      msg: "New auspicious wedding enquiry received via Celibrate website.",
      services: ["Venue", "Decoration", "Catering", "Rooms"],
    },
  ];

  const royalEnquiries: any[] = [];
  for (const eq of royalEnquiriesData) {
    const enq = await prisma.enquiry.create({
      data: {
        enquiryNumber: eq.num,
        userId: eq.cust.id,
        venueId: royalVenue.id,
        customerName: eq.cust.name,
        customerPhone: eq.cust.phone || "+91 98765 00000",
        customerEmail: eq.cust.email,
        eventType: eq.type,
        eventDate: eq.date,
        guestCount: eq.guests,
        preferredTime: eq.time,
        budget: eq.budget,
        message: eq.msg,
        status: eq.status,
      },
    });

    for (const s of eq.services) {
      await prisma.enquiryService.create({
        data: { enquiryId: enq.id, serviceName: s },
      });
    }

    // Activities for each
    await prisma.enquiryActivity.create({
      data: {
        enquiryId: enq.id,
        type: "STATUS_CHANGE",
        note: `Enquiry submitted on Celibrate customer website with status ${eq.status}`,
        userId: eq.cust.id,
        userName: eq.cust.name,
      },
    });

    royalEnquiries.push(enq);
  }

  // Follow-ups for Rajesh Kumar (Today's Follow-ups)
  const today = new Date();
  const followUpTimes = ["09:30 AM", "11:00 AM", "02:00 PM", "04:30 PM"];
  for (let i = 0; i < 4; i++) {
    const enq = royalEnquiries[6 + i];
    await prisma.enquiryFollowUp.create({
      data: {
        enquiryId: enq.id,
        customerId: enq.userId,
        venueId: royalVenue.id,
        customerName: enq.customerName,
        date: today,
        time: followUpTimes[i],
        assignedToId: mainOwnerUser.id,
        assignedToName: mainOwnerUser.name,
        note: `Discuss final package pricing and confirmation with ${enq.customerName}`,
        status: i === 0 ? "Completed" : "Pending",
      },
    });
  }

  // Site visits for Rajesh Kumar
  await prisma.siteVisit.create({
    data: {
      enquiryId: royalEnquiries[7].id,
      customerId: royalEnquiries[7].userId,
      venueId: royalVenue.id,
      customerName: royalEnquiries[7].customerName,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: "04:00 PM",
      assignedToName: "Rajesh Kumar",
      notes: "Customer visiting with family to inspect the bridal suite and stage.",
      status: "SCHEDULED",
    },
  });

  // 5 Quotations for Royal Celebration Mandap
  const quotationDefinitions = [
    {
      enquiry: royalEnquiries[0],
      number: "QT-202610-10025",
      subtotal: 550000,
      discount: 25000,
      tax: 0,
      total: 525000,
      status: "ACCEPTED",
      items: [
        { category: "Venue", name: "Royal Celebration Mandap Hall & Dining Zone", quantity: 1, unitPrice: 100000, discount: 0, tax: 0, total: 100000 },
        { category: "Decoration", name: "Grand Floral Stage & Arch Entrance", quantity: 1, unitPrice: 50000, discount: 0, tax: 0, total: 50000 },
        { category: "Catering", name: "Royal Feast Buffet Dinner (Per Plate)", quantity: 500, unitPrice: 700, discount: 0, tax: 0, total: 350000 },
        { category: "DJ", name: "Intelligent Sound & Moving Head Lighting", quantity: 1, unitPrice: 20000, discount: 0, tax: 0, total: 20000 },
        { category: "Photography", name: "Candid & Traditional Photo Crew (Full Event)", quantity: 1, unitPrice: 30000, discount: 5000, tax: 0, total: 25000 },
      ],
    },
    {
      enquiry: royalEnquiries[1],
      number: "QT-202610-10026",
      subtotal: 185000,
      discount: 10000,
      tax: 0,
      total: 175000,
      status: "ACCEPTED",
      items: [
        { category: "Venue", name: "AC Hall Rental", quantity: 1, unitPrice: 100000, discount: 0, tax: 0, total: 100000 },
        { category: "Decoration", name: "Floral Ring Ceremony Backdrop", quantity: 1, unitPrice: 45000, discount: 0, tax: 0, total: 45000 },
        { category: "Photography", name: "Candid Engagement Coverage", quantity: 1, unitPrice: 30000, discount: 0, tax: 0, total: 30000 },
        { category: "Rooms", name: "Complimentary Deluxe AC Rooms", quantity: 2, unitPrice: 5000, discount: 10000, tax: 0, total: 0 },
      ],
    },
    {
      enquiry: royalEnquiries[2],
      number: "QT-202610-10027",
      subtotal: 620000,
      discount: 20000,
      tax: 0,
      total: 600000,
      status: "ACCEPTED",
      items: [
        { category: "Venue", name: "Full Mandap & Dining Hall", quantity: 1, unitPrice: 120000, discount: 0, tax: 0, total: 120000 },
        { category: "Catering", name: "Premium Reception Buffet", quantity: 600, unitPrice: 750, discount: 20000, tax: 0, total: 430000 },
        { category: "Decoration", name: "Luxury Theme Stage", quantity: 1, unitPrice: 50000, discount: 0, tax: 0, total: 50000 },
      ],
    },
    {
      enquiry: royalEnquiries[3],
      number: "QT-202610-10028",
      subtotal: 120000,
      discount: 5000,
      tax: 0,
      total: 115000,
      status: "ACCEPTED",
      items: [
        { category: "Venue", name: "Celebration Banquet", quantity: 1, unitPrice: 75000, discount: 0, tax: 0, total: 75000 },
        { category: "DJ", name: "Party Sound & Lights", quantity: 1, unitPrice: 20000, discount: 0, tax: 0, total: 20000 },
        { category: "Decoration", name: "Balloon & LED Decor", quantity: 1, unitPrice: 25000, discount: 5000, tax: 0, total: 20000 },
      ],
    },
    {
      enquiry: royalEnquiries[4],
      number: "QT-202610-10029",
      subtotal: 290000,
      discount: 15000,
      tax: 0,
      total: 275000,
      status: "ACCEPTED",
      items: [
        { category: "Venue", name: "Exclusive Full Day Mandap Access", quantity: 1, unitPrice: 175000, discount: 0, tax: 0, total: 175000 },
        { category: "Decoration", name: "Traditional Odia Wedding Theme Decor", quantity: 1, unitPrice: 75000, discount: 15000, tax: 0, total: 60000 },
        { category: "Rooms", name: "8 AC Guest Rooms for Barat", quantity: 8, unitPrice: 5000, discount: 0, tax: 0, total: 40000 },
      ],
    },
  ];

  const createdQuotations: any[] = [];
  for (const qDef of quotationDefinitions) {
    const q = await prisma.quotation.create({
      data: {
        quotationNumber: qDef.number,
        enquiryId: qDef.enquiry.id,
        customerId: qDef.enquiry.userId,
        venueId: royalVenue.id,
        customerName: qDef.enquiry.customerName,
        customerPhone: qDef.enquiry.customerPhone,
        customerEmail: qDef.enquiry.customerEmail,
        eventType: qDef.enquiry.eventType,
        eventDate: qDef.enquiry.eventDate,
        guestCount: qDef.enquiry.guestCount,
        subtotal: qDef.subtotal,
        discount: qDef.discount,
        tax: qDef.tax,
        total: qDef.total,
        status: qDef.status,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        terms: "1. 25% Advance payment required upon confirmation.\n2. Outside liquor strictly requires excise permit.\n3. Music allowed until 10:00 PM.",
        notes: "Thank you for choosing Royal Celebration Mandap. We look forward to hosting your auspicious event.",
      },
    });

    for (const item of qDef.items) {
      await prisma.quotationItem.create({
        data: {
          quotationId: q.id,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
          total: item.total,
        },
      });
    }

    createdQuotations.push(q);
  }

  // 5 Confirmed Bookings for Royal Celebration Mandap
  const bookingDefinitions = [
    {
      number: "BK-202610-10025",
      enquiry: royalEnquiries[0],
      quotation: createdQuotations[0],
      total: 525000,
      advance: 100000,
      paid: 300000,
      status: "CONFIRMED",
      pStatus: "PARTIAL",
      notes: "Customer Rahul Sharma paid ₹1,00,000 advance and ₹2,00,000 second milestone. Balance due ₹2,25,000 before event.",
    },
    {
      number: "BK-202610-10026",
      enquiry: royalEnquiries[1],
      quotation: createdQuotations[1],
      total: 175000,
      advance: 50000,
      paid: 175000,
      status: "CONFIRMED",
      pStatus: "PAID",
      notes: "Fully paid. Engagement event booked.",
    },
    {
      number: "BK-202610-10027",
      enquiry: royalEnquiries[2],
      quotation: createdQuotations[2],
      total: 600000,
      advance: 150000,
      paid: 150000,
      status: "CONFIRMED",
      pStatus: "PARTIAL",
      notes: "Advance paid via bank transfer. Stage setup approved.",
    },
    {
      number: "BK-202610-10028",
      enquiry: royalEnquiries[3],
      quotation: createdQuotations[3],
      total: 115000,
      advance: 35000,
      paid: 115000,
      status: "CONFIRMED",
      pStatus: "PAID",
      notes: "50th Birthday booking confirmed and fully settled.",
    },
    {
      number: "BK-202610-10029",
      enquiry: royalEnquiries[4],
      quotation: createdQuotations[4],
      total: 275000,
      advance: 100000,
      paid: 100000,
      status: "CONFIRMED",
      pStatus: "PARTIAL",
      notes: "Full day mandap booking. Barat arrival at 6 PM.",
    },
  ];

  const createdBookings: any[] = [];
  for (const bDef of bookingDefinitions) {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bDef.number,
        enquiryId: bDef.enquiry.id,
        customerId: bDef.enquiry.userId,
        venueId: royalVenue.id,
        quotationId: bDef.quotation.id,
        customerName: bDef.enquiry.customerName,
        customerPhone: bDef.enquiry.customerPhone,
        customerEmail: bDef.enquiry.customerEmail,
        eventType: bDef.enquiry.eventType,
        eventDate: bDef.enquiry.eventDate,
        timeSlot: bDef.enquiry.preferredTime || "Evening",
        guestCount: bDef.enquiry.guestCount,
        totalAmount: bDef.total,
        advanceAmount: bDef.advance,
        paidAmount: bDef.paid,
        balanceAmount: bDef.total - bDef.paid,
        paymentStatus: bDef.pStatus,
        status: bDef.status,
        specialNotes: bDef.notes,
      },
    });

    createdBookings.push(booking);

    // Platform Commission (5%)
    const commissionRate = 5.0;
    const commAmt = Math.round((bDef.total * commissionRate) / 100);
    const ownerAmt = bDef.total - commAmt;

    await prisma.commission.create({
      data: {
        bookingId: booking.id,
        venueId: royalVenue.id,
        bookingAmount: bDef.total,
        commissionType: "PERCENTAGE",
        commissionRate,
        commissionAmount: commAmt,
        ownerAmount: ownerAmt,
        status: bDef.pStatus === "PAID" ? "SETTLED" : "PENDING",
      },
    });

    // Payment Schedules
    await prisma.paymentSchedule.createMany({
      data: [
        { bookingId: booking.id, milestone: "Advance Payment", amount: bDef.advance, status: "PAID", dueDate: new Date("2026-10-05") },
        { bookingId: booking.id, milestone: "Second Payment", amount: Math.round((bDef.total - bDef.advance) * 0.5), status: bDef.paid > bDef.advance ? "PAID" : "PENDING", dueDate: new Date("2026-11-01") },
        { bookingId: booking.id, milestone: "Final Payment", amount: bDef.total - bDef.advance - Math.round((bDef.total - bDef.advance) * 0.5), status: bDef.pStatus === "PAID" ? "PAID" : "PENDING", dueDate: new Date("2026-11-14") },
      ],
    });

    // Event Details & Operations
    const event = await prisma.event.create({
      data: {
        bookingId: booking.id,
        venueId: royalVenue.id,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        timeSlot: booking.timeSlot,
        guestCount: booking.guestCount,
        notes: "Grand stage decoration with pastel flowers. AC running from 2 PM.",
        decorationInstructions: "Stage required ready by 4:00 PM. Red carpet entrance from gate.",
        cateringInstructions: "Vegetarian buffet starts at 7:30 PM. Live pasta and chaat counters.",
        djInstructions: "Gentle instrumental music during reception, high energy dance tracks after 9 PM.",
        photographyInstructions: "Capture couple entry with cold pyros and drone overview.",
        specialRequests: "VIP sofa seating for 20 senior family members in front rows.",
      },
    });

    // Event Expenses for Owner internal profit tracking
    const expenses = [
      { cat: "Decoration", desc: "Floral vendor & stage lighting", amt: 35000 },
      { cat: "Staff", desc: "Housekeeping & security staff 10 persons", amt: 12000 },
      { cat: "Electricity", desc: "Generator fuel and utility charge", amt: 8000 },
      { cat: "Cleaning", desc: "Post event hall sanitation and waste handling", amt: 5000 },
    ];

    for (const exp of expenses) {
      await prisma.eventExpense.create({
        data: {
          eventId: event.id,
          bookingId: booking.id,
          venueId: royalVenue.id,
          category: exp.cat,
          description: exp.desc,
          amount: exp.amt,
          recordedByName: "Rajesh Kumar",
        },
      });
    }
  }

  // 10 Payment Records for Rajesh Kumar
  const paymentRecordsData = [
    { bk: createdBookings[0], rcp: "RCP-202610-501", amt: 100000, method: "BANK_TRANSFER", type: "ADVANCE", ref: "NEFT98273641", notes: "25% Advance booking deposit" },
    { bk: createdBookings[0], rcp: "RCP-202610-502", amt: 200000, method: "UPI", type: "SECOND_PAYMENT", ref: "UPI/382910482910", notes: "Second milestone payment" },
    { bk: createdBookings[1], rcp: "RCP-202610-503", amt: 50000, method: "UPI", type: "ADVANCE", ref: "UPI/847291048201", notes: "Advance payment" },
    { bk: createdBookings[1], rcp: "RCP-202610-504", amt: 125000, method: "CASH", type: "FINAL_PAYMENT", ref: "CASH-REC-104", notes: "Full settlement cash received" },
    { bk: createdBookings[2], rcp: "RCP-202610-505", amt: 150000, method: "BANK_TRANSFER", type: "ADVANCE", ref: "RTGS91823746", notes: "Advance payment" },
    { bk: createdBookings[3], rcp: "RCP-202610-506", amt: 35000, method: "UPI", type: "ADVANCE", ref: "UPI/102938475610", notes: "Advance deposit" },
    { bk: createdBookings[3], rcp: "RCP-202610-507", amt: 80000, method: "CARD", type: "FINAL_PAYMENT", ref: "POS-TXN-9941", notes: "Final balance payment" },
    { bk: createdBookings[4], rcp: "RCP-202610-508", amt: 100000, method: "CHEQUE", type: "ADVANCE", ref: "CHQ-004821", notes: "Advance cheque cleared" },
    { bk: createdBookings[0], rcp: "RCP-202610-509", amt: 25000, method: "UPI", type: "OTHER", ref: "UPI/992837461029", notes: "Security deposit hold" },
    { bk: createdBookings[2], rcp: "RCP-202610-510", amt: 50000, method: "BANK_TRANSFER", type: "SECOND_PAYMENT", ref: "NEFT48291039", notes: "Interim decor advance" },
  ];

  for (const pr of paymentRecordsData) {
    await prisma.bookingPayment.create({
      data: {
        receiptNumber: pr.rcp,
        bookingId: pr.bk.id,
        customerId: pr.bk.customerId,
        venueId: royalVenue.id,
        amount: pr.amt,
        paymentMethod: pr.method,
        paymentType: pr.type,
        referenceNumber: pr.ref,
        notes: pr.notes,
        recordedById: mainOwnerUser.id,
        recordedByName: "Rajesh Kumar",
      },
    });
  }

  // 5 Verified Reviews with Owner Replies for Royal Celebration Mandap
  const reviewsData = [
    {
      name: "Rahul Sharma",
      rating: 5,
      comment: "Absolutely breathtaking venue! The stage decor, AC cooling, and helpful management made our family wedding memorable.",
      reply: "Thank you so much Rahul ji! It was our pleasure hosting your family. Wishing the newlyweds a blessed life ahead!",
    },
    {
      name: "Sasmita Rout",
      rating: 5,
      comment: "Spacious bridal room, ample parking for 100+ cars, and the dining hall is massive. Best Kalyan Mandap in Bhubaneswar.",
      reply: "Thank you Sasmita! Glad your guests enjoyed the facilities and parking space.",
    },
    {
      name: "Amit Kumar Das",
      rating: 4,
      comment: "Very good experience. Staff was courteous and electricity backup worked seamlessly without any glitch.",
      reply: "Thank you Amit! We prioritize 100% power reliability.",
    },
    {
      name: "Pooja Mohapatra",
      rating: 5,
      comment: "Hosted our ring ceremony here. Beautiful floral lighting and wonderful hospitality by Rajesh ji and team.",
      reply: "Hearty congratulations Pooja ji! Thank you for choosing Royal Celebration Mandap.",
    },
    {
      name: "Debashis Nayak",
      rating: 5,
      comment: "Celibrate coordinator and venue owner Rajesh Kumar handled everything smoothly from enquiry to final event.",
      reply: "Thank you Debashis! Glad to serve you through Celibrate.",
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.create({
      data: {
        venueId: royalVenue.id,
        userId: mainCustomerUser.id,
        userName: rev.name,
        rating: rev.rating,
        comment: rev.comment,
        reply: rev.reply,
        replyDate: new Date(),
        status: "APPROVED",
        isVerified: true,
      },
    });
  }

  // =========================================================================
  // 10. REQUIREMENT 61: ADDITIONAL ENQUIRIES, QUOTATIONS & BOOKINGS ACROSS VENUES
  // (Total: 50 Enquiries, 20 Quotations, 15 Bookings, Notifications, Audit Logs)
  // =========================================================================
  console.log("Seeding platform-wide enquiries, quotations, bookings and audit logs...");

  const eventTypesPool = ["Wedding", "Birthday", "Engagement", "Reception", "Corporate Event", "Anniversary"];
  const statusPool = ["NEW", "CONTACTED", "INTERESTED", "SITE_VISIT", "QUOTATION_SENT", "NEGOTIATION", "BOOKED"];

  const otherVenues = createdVenues.slice(1);
  let globalEnqIndex = 35;

  for (let i = 0; i < 40; i++) {
    const v = otherVenues[i % otherVenues.length];
    const c = customerList[(i + 3) % customerList.length];
    const eType = eventTypesPool[i % eventTypesPool.length];
    const status = statusPool[i % statusPool.length];
    const num = `ENQ-202610-100${globalEnqIndex++}`;

    const dateOffset = (i * 3 + 5) * 24 * 60 * 60 * 1000;
    const eventDate = new Date(Date.now() + dateOffset);

    const enq = await prisma.enquiry.create({
      data: {
        enquiryNumber: num,
        userId: c.id,
        venueId: v.id,
        customerName: c.name,
        customerPhone: c.phone || "+91 98000 00000",
        customerEmail: c.email,
        eventType: eType,
        eventDate,
        guestCount: 200 + (i % 5) * 100,
        preferredTime: i % 2 === 0 ? "Evening" : "Full Day",
        budget: "₹1 - 2 Lakh",
        message: `Looking for ${v.name} for our upcoming ${eType} celebration. Please share quotation and availability.`,
        status,
      },
    });

    await prisma.enquiryService.create({
      data: { enquiryId: enq.id, serviceName: "Venue" },
    });

    // Create 15 more quotations across these enquiries
    if (i < 15) {
      const qNum = `QT-202610-200${i + 1}`;
      const subtotal = 150000 + i * 25000;
      const discount = 10000;
      const total = subtotal - discount;

      const quotation = await prisma.quotation.create({
        data: {
          quotationNumber: qNum,
          enquiryId: enq.id,
          customerId: c.id,
          venueId: v.id,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          eventType: eType,
          eventDate,
          guestCount: enq.guestCount,
          subtotal,
          discount,
          tax: 0,
          total,
          status: i < 10 ? "ACCEPTED" : "SENT",
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          terms: "Standard Celibrate platform terms apply. 25% Advance required.",
        },
      });

      await prisma.quotationItem.create({
        data: {
          quotationId: quotation.id,
          category: "Venue",
          name: `${v.name} Rental Package`,
          quantity: 1,
          unitPrice: subtotal,
          discount,
          tax: 0,
          total,
        },
      });

      // Create 10 more bookings (Total = 5 royal + 10 other = 15 bookings!)
      if (i < 10) {
        const bkNum = `BK-202610-200${i + 1}`;
        const advAmt = Math.round(total * 0.3);
        const booking = await prisma.booking.create({
          data: {
            bookingNumber: bkNum,
            enquiryId: enq.id,
            customerId: c.id,
            venueId: v.id,
            quotationId: quotation.id,
            customerName: c.name,
            customerPhone: c.phone || "+91 98000 00000",
            customerEmail: c.email,
            eventType: eType,
            eventDate,
            timeSlot: enq.preferredTime || "Evening",
            guestCount: enq.guestCount,
            totalAmount: total,
            advanceAmount: advAmt,
            paidAmount: advAmt,
            balanceAmount: total - advAmt,
            paymentStatus: "PARTIAL",
            status: "CONFIRMED",
            specialNotes: `Booking confirmed by Celibrate coordinator for ${v.name}.`,
          },
        });

        // Commission
        const commAmt = Math.round(total * 0.05);
        await prisma.commission.create({
          data: {
            bookingId: booking.id,
            venueId: v.id,
            bookingAmount: total,
            commissionType: "PERCENTAGE",
            commissionRate: 5.0,
            commissionAmount: commAmt,
            ownerAmount: total - commAmt,
            status: "PENDING",
          },
        });

        // Payment record
        await prisma.bookingPayment.create({
          data: {
            receiptNumber: `RCP-202610-60${i + 1}`,
            bookingId: booking.id,
            customerId: c.id,
            venueId: v.id,
            amount: advAmt,
            paymentMethod: i % 2 === 0 ? "UPI" : "BANK_TRANSFER",
            paymentType: "ADVANCE",
            referenceNumber: `REF-PLT-99${i}01`,
            notes: "Advance payment received and confirmed.",
            recordedByName: "Admin",
          },
        });
      }
    }
  }

  // 11. Notifications
  const notificationsData = [
    { role: "ADMIN", title: "New Venue Owner Registration", message: "Alok Senapati registered 'Kalinga Royal Mandap' and awaits admin approval.", link: "/admin/owners" },
    { role: "ADMIN", title: "New Booking Created", message: "Booking BK-202610-10025 confirmed for Royal Celebration Mandap (₹5,25,000).", link: "/admin/bookings" },
    { role: "ADMIN", title: "Payment Recorded", message: "Advance payment of ₹1,00,000 recorded for Royal Celebration Mandap.", link: "/admin/payments" },
    { role: "VENUE_OWNER", userId: mainOwnerUser.id, title: "New Wedding Enquiry Received", message: "New enquiry ENQ-202610-10034 received for Royal Celebration Mandap.", link: "/owner/enquiries" },
    { role: "VENUE_OWNER", userId: mainOwnerUser.id, title: "Upcoming Site Visit Tomorrow", message: "Site visit scheduled tomorrow at 04:00 PM for ENQ-202610-10032.", link: "/owner/enquiries" },
    { role: "VENUE_OWNER", userId: mainOwnerUser.id, title: "Follow-up Reminder", message: "You have 3 pending follow-ups scheduled for today.", link: "/owner/dashboard" },
    { role: "CUSTOMER", userId: mainCustomerUser.id, title: "Quotation Received!", message: "Rajesh Kumar sent a quotation for ENQ-202610-10025. Total: ₹5,25,000.", link: "/my-enquiries" },
    { role: "CUSTOMER", userId: mainCustomerUser.id, title: "Booking Confirmed!", message: "Your booking BK-202610-10025 is confirmed for Royal Celebration Mandap on 15 Nov 2026.", link: "/my-enquiries" },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // 12. Audit Logs
  const auditLogsData = [
    { action: "PLATFORM_INITIALIZED", entity: "System", entityId: "SYS-001", oldValue: null, newValue: "Celibrate Platform v2.0 initialized", userRole: "ADMIN", userName: "Admin" },
    { action: "APPROVED_OWNER", entity: "VenueOwnerProfile", entityId: mainOwnerProfile.id, oldValue: "PENDING_APPROVAL", newValue: "APPROVED", userRole: "ADMIN", userName: "Admin" },
    { action: "APPROVED_VENUE", entity: "Venue", entityId: royalVenue.id, oldValue: "PENDING", newValue: "APPROVED", userRole: "ADMIN", userName: "Admin" },
    { action: "CREATED_QUOTATION", entity: "Quotation", entityId: createdQuotations[0].id, oldValue: null, newValue: "Quotation QT-202610-10025 generated (₹5,25,000)", userRole: "VENUE_OWNER", userName: "Rajesh Kumar" },
    { action: "CONVERTED_BOOKING", entity: "Booking", entityId: createdBookings[0].id, oldValue: "ENQUIRY_NEGOTIATION", newValue: "CONFIRMED_BOOKING BK-202610-10025", userRole: "VENUE_OWNER", userName: "Rajesh Kumar" },
    { action: "RECORDED_PAYMENT", entity: "BookingPayment", entityId: "RCP-202610-501", oldValue: null, newValue: "Advance payment ₹1,00,000 recorded", userRole: "VENUE_OWNER", userName: "Rajesh Kumar" },
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

  console.log("Database seeded successfully with all multi-role records!");
  console.log(`Summary:`);
  console.log(`- 20 Venues`);
  console.log(`- 10 Venue Owners`);
  console.log(`- 31 Customers`);
  console.log(`- 50 Enquiries`);
  console.log(`- 20 Quotations`);
  console.log(`- 15 Bookings`);
  console.log(`- 20 Payments & Receipts`);
  console.log(`- Audit Logs, Notifications, Platform Settings`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
