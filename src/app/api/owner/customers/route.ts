import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const venues = await prisma.venue.findMany({
      where: currentUser.role === "ADMIN" ? {} : { ownerId: currentUser.id },
      select: { id: true },
    });
    const venueIds = venues.map((v) => v.id);

    // Fetch enquiries for these venues
    const enquiries = await prisma.enquiry.findMany({
      where: { venueId: { in: venueIds } },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        user: { select: { city: true } },
        venue: { select: { city: { select: { name: true } } } },
        eventType: true,
        eventDate: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch bookings for these venues
    const bookings = await prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        eventType: true,
        eventDate: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
      },
    });

    // Group by customer phone or email
    const customerMap = new Map<string, any>();

    for (const enq of enquiries) {
      const key = enq.customerPhone || enq.customerEmail;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: enq.customerName,
          phone: enq.customerPhone,
          email: enq.customerEmail,
          city: enq.user?.city || enq.venue?.city?.name || "Bhubaneswar",
          enquiryCount: 0,
          bookingCount: 0,
          latestEvent: enq.eventType,
          latestDate: enq.eventDate,
          firstSeen: enq.createdAt,
        });
      }
      const existing = customerMap.get(key);
      existing.enquiryCount += 1;
    }

    for (const bk of bookings) {
      const key = bk.customerPhone || bk.customerEmail;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: bk.customerName,
          phone: bk.customerPhone,
          email: bk.customerEmail,
          city: "Not Specified",
          enquiryCount: 0,
          bookingCount: 0,
          latestEvent: bk.eventType,
          latestDate: bk.eventDate,
          firstSeen: new Date(),
        });
      }
      const existing = customerMap.get(key);
      existing.bookingCount += 1;
    }

    let customers = Array.from(customerMap.values());

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: { customers },
    });
  } catch (error) {
    console.error("GET /api/owner/customers error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to load customers" } }, { status: 500 });
  }
}
