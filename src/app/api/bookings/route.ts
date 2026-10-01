import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { convertOrDirectBooking } from "@/lib/bookingService";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (currentUser.role === "VENUE_OWNER") {
      where.venue = { ownerId: currentUser.id };
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "ADMIN") {
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "CUSTOMER") {
      where.customerEmail = currentUser.email;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { customerEmail: { contains: search } },
        { venue: { name: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { eventDate: "asc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: { select: { name: true } },
          },
        },
        quotation: {
          select: { id: true, quotationNumber: true, total: true },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        schedules: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch bookings" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "VENUE_OWNER")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Customers cannot create bookings. Only Admin and Venue Owners can confirm bookings internally." },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      enquiryId,
      quotationId,
      venueId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      timeSlot,
      guestCount,
      totalAmount,
      advanceAmount = 0,
      paymentMethod = "UPI",
      referenceNumber,
      specialNotes,
    } = body;

    if (!venueId || !customerName || !customerPhone || !eventType || !eventDate || !totalAmount) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required booking details" } },
        { status: 400 }
      );
    }

    const booking = await convertOrDirectBooking({
      enquiryId,
      quotationId,
      venueId,
      customerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      eventType,
      eventDate,
      timeSlot,
      guestCount: Number(guestCount) || 200,
      totalAmount: Number(totalAmount),
      advanceAmount: Number(advanceAmount),
      paymentMethod,
      referenceNumber,
      specialNotes,
      actorRole: currentUser.role as "ADMIN" | "VENUE_OWNER",
      actorUserId: currentUser.id,
      recordedByName: currentUser.name,
    });

    return NextResponse.json({
      success: true,
      data: { booking },
      message: `Booking ${booking.bookingNumber} confirmed successfully!`,
    });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    if (error.message.includes("already booked")) {
      return NextResponse.json(
        { success: false, error: { code: "DOUBLE_BOOKING_CONFLICT", message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to create booking" } },
      { status: 500 }
    );
  }
}
