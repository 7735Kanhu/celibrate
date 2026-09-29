import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EnquirySchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = EnquirySchema.parse(body);

    const currentUser = await getCurrentUser();

    // Generate unique enquiry number: ENQ-YYYYMM-RANDOM5
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const enquiryNumber = `ENQ-${yearMonth}-${randomDigits}`;

    // Verify venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: validatedData.venueId },
    });

    if (!venue) {
      return NextResponse.json({ error: "Selected venue not found" }, { status: 404 });
    }

    // Create Enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        userId: currentUser?.id || null,
        venueId: venue.id,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        eventType: validatedData.eventType,
        eventDate: new Date(validatedData.eventDate),
        guestCount: validatedData.guestCount,
        preferredTime: validatedData.preferredTime || "Evening",
        budget: validatedData.budget || "Not Specified",
        message: validatedData.message || null,
        status: "Submitted",
      },
    });

    // Save requested services if any
    if (validatedData.services && validatedData.services.length > 0) {
      for (const serviceName of validatedData.services) {
        await prisma.enquiryService.create({
          data: {
            enquiryId: enquiry.id,
            serviceName,
          },
        });
      }
    } else {
      // Default service is Venue
      await prisma.enquiryService.create({
        data: {
          enquiryId: enquiry.id,
          serviceName: "Venue",
        },
      });
    }

    // Create Initial Status History
    await prisma.enquiryStatusHistory.create({
      data: {
        enquiryId: enquiry.id,
        status: "Submitted",
        note: "Enquiry submitted successfully by customer",
      },
    });

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
      message: "Enquiry submitted successfully",
    });
  } catch (error: any) {
    console.error("POST /api/enquiries error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // If logged in, fetch enquiries for current user. Otherwise fetch for demo user or latest enquiries
    const userId = currentUser?.id;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    } else {
      // Fallback for demo user
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@celibrate.demo" },
      });
      if (demoUser) {
        where.userId = demoUser.id;
      }
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          include: {
            city: true,
            images: { where: { isPrimary: true } },
          },
        },
        services: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
