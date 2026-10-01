import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const OwnerRegisterSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  phone: z.string().min(10, "Please provide a valid 10-digit phone number"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().min(2, "Please enter your city"),
  address: z.string().min(5, "Please enter the physical address"),
  venueName: z.string().min(2, "Please enter the primary venue name"),
  venueType: z.string().min(2, "Please select or enter the venue type"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = OwnerRegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: data.ownerName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone,
          password: hashedPassword,
          city: data.city,
          role: "VENUE_OWNER",
          isActive: true,
          isVerified: false,
        },
      });

      // 2. Create VenueOwnerProfile with status PENDING_APPROVAL
      const profile = await tx.venueOwnerProfile.create({
        data: {
          userId: user.id,
          businessName: data.businessName,
          ownerName: data.ownerName,
          phone: data.phone,
          email: data.email.toLowerCase().trim(),
          city: data.city,
          address: data.address,
          status: "PENDING_APPROVAL",
        },
      });

      // 3. Find or get City
      let cityRecord = await tx.city.findFirst({
        where: { name: { equals: data.city } },
      });

      if (!cityRecord) {
        cityRecord = await tx.city.findFirst();
      }

      const cityId = cityRecord ? cityRecord.id : "";

      // 4. Create Venue with status PENDING
      const slugBase = data.venueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const venueSlug = `${slugBase}-${Math.floor(1000 + Math.random() * 9000)}`;

      const venue = await tx.venue.create({
        data: {
          name: data.venueName,
          slug: venueSlug,
          ownerId: user.id,
          type: data.venueType,
          description: `${data.venueName} is managed by ${data.businessName} in ${data.city}.`,
          address: data.address,
          cityId: cityId || "default-city",
          capacity: 400,
          startingPrice: 75000,
          status: "PENDING",
          isVerified: false,
          isFeatured: false,
        },
      });

      // 5. Create default package & images for demo preview
      await tx.venuePackage.create({
        data: {
          venueId: venue.id,
          name: "Standard Package",
          price: 75000,
          guestLimit: 250,
          description: "Full day venue rental with basic stage setup",
          includes: JSON.stringify(["Hall Rental", "Stage Platform", "Generator Backup"]),
        },
      });

      await tx.venueImage.create({
        data: {
          venueId: venue.id,
          url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200",
          category: "Main Hall",
          isPrimary: true,
          caption: `${venue.name} Main Hall`,
        },
      });

      // 6. Create Admin Notification
      await tx.notification.create({
        data: {
          role: "ADMIN",
          title: "New Venue Owner Application",
          message: `${data.ownerName} submitted '${data.businessName}' (${data.venueName}) for verification.`,
          link: "/admin/owners",
        },
      });

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userName: data.ownerName,
          userRole: "VENUE_OWNER",
          action: "OWNER_REGISTERED",
          entity: "VenueOwnerProfile",
          entityId: profile.id,
          newValue: JSON.stringify({ business: data.businessName, venue: data.venueName, status: "PENDING_APPROVAL" }),
        },
      });

      return { user, profile, venue };
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Your venue owner account has been submitted for verification.",
        ownerId: result.profile.id,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auth/owner-register error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.errors[0]?.message || "Validation failed" } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to register venue owner. Please try again." } },
      { status: 500 }
    );
  }
}
