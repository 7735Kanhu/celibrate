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
      include: { owner: true },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Selected venue not found" } },
        { status: 404 }
      );
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
        status: "NEW",
      },
    });

    // Save requested services if any
    const services = validatedData.services && validatedData.services.length > 0
      ? validatedData.services
      : ["Venue"];

    for (const serviceName of services) {
      await prisma.enquiryService.create({
        data: {
          enquiryId: enquiry.id,
          serviceName,
        },
      });
    }

    // Create Initial Status History & Activity Log
    await prisma.enquiryStatusHistory.create({
      data: {
        enquiryId: enquiry.id,
        status: "NEW",
        note: "Enquiry submitted by customer on Celibrate",
      },
    });

    await prisma.enquiryActivity.create({
      data: {
        enquiryId: enquiry.id,
        type: "STATUS_CHANGE",
        note: `Enquiry submitted by customer ${validatedData.customerName}`,
        userId: currentUser?.id || null,
        userName: validatedData.customerName,
      },
    });

    // Notify Venue Owner
    if (venue.ownerId) {
      await prisma.notification.create({
        data: {
          userId: venue.ownerId,
          role: "VENUE_OWNER",
          title: "New Enquiry Received!",
          message: `New ${validatedData.eventType} enquiry (${enquiryNumber}) for ${venue.name} from ${validatedData.customerName}.`,
          link: `/owner/enquiries/${enquiry.id}`,
        },
      });
    }

    // Notify Platform Admin
    await prisma.notification.create({
      data: {
        role: "ADMIN",
        title: "New Customer Enquiry",
        message: `Enquiry ${enquiryNumber} submitted for ${venue.name} by ${validatedData.customerName}.`,
        link: `/admin/enquiries?search=${enquiryNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        enquiryId: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber,
      },
      message: "Enquiry submitted successfully. Venue coordinator will contact you shortly!",
    });
  } catch (error: any) {
    console.error("POST /api/enquiries error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Please check your input", details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit enquiry" } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");
    const search = searchParams.get("search");

    const where: any = {};

    // Role-based data scoping (Requirement 55)
    if (!currentUser) {
      // If unauthenticated, fallback to demo customer enquiry
      const demoUser = await prisma.user.findUnique({ where: { email: "customer@celibrate.demo" } });
      if (demoUser) {
        where.userId = demoUser.id;
      } else {
        return NextResponse.json({ success: true, data: { enquiries: [] } });
      }
    } else if (currentUser.role === "CUSTOMER") {
      // Customer sees ONLY their own enquiries
      where.userId = currentUser.id;
    } else if (currentUser.role === "VENUE_OWNER") {
      // Owner sees ONLY enquiries for venues they own
      where.venue = { ownerId: currentUser.id };
      if (venueId && venueId !== "ALL") {
        where.venueId = venueId;
      }
    } else if (currentUser.role === "ADMIN") {
      // Admin sees all enquiries
      if (venueId && venueId !== "ALL") {
        where.venueId = venueId;
      }
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { enquiryNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { customerEmail: { contains: search } },
        { venue: { name: { contains: search } } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            city: { select: { name: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        services: true,
        quotations: {
          select: { id: true, quotationNumber: true, total: true, status: true },
        },
        booking: {
          select: { id: true, bookingNumber: true, status: true, totalAmount: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { enquiries },
    });
  } catch (error: any) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch enquiries" } },
      { status: 500 }
    );
  }
}
