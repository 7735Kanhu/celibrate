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
    const venueId = searchParams.get("venueId");

    const venueFilter: any = currentUser.role === "ADMIN" ? {} : { ownerId: currentUser.id };
    if (venueId && venueId !== "ALL") {
      venueFilter.id = venueId;
    }

    const venues = await prisma.venue.findMany({
      where: venueFilter,
      select: { id: true, name: true },
    });
    const venueIds = venues.map((v) => v.id);

    if (venueIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          customers: [],
          stats: {
            totalCustomers: 0,
            bookedCustomers: 0,
            leadCustomers: 0,
            repeatCustomers: 0,
            totalRevenue: 0,
          },
        },
      });
    }

    // Fetch enquiries for these venues
    const enquiries = await prisma.enquiry.findMany({
      where: { venueId: { in: venueIds } },
      select: {
        id: true,
        enquiryNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        guestCount: true,
        budget: true,
        user: { select: { city: true } },
        venue: { select: { id: true, name: true, city: { select: { name: true } } } },
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
        bookingNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        eventType: true,
        eventDate: true,
        timeSlot: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
        paymentStatus: true,
        venue: { select: { id: true, name: true, city: { select: { name: true } } } },
        createdAt: true,
      },
      orderBy: { eventDate: "desc" },
    });

    // Group by customer phone or email (normalized)
    const customerMap = new Map<string, any>();

    for (const enq of enquiries) {
      const cleanPhone = enq.customerPhone?.trim() || "";
      const cleanEmail = enq.customerEmail?.toLowerCase().trim() || "";
      const key = cleanPhone || cleanEmail || enq.id;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: enq.customerName,
          phone: enq.customerPhone,
          email: enq.customerEmail,
          city: enq.user?.city || enq.venue?.city?.name || "Bhubaneswar",
          enquiryCount: 0,
          bookingCount: 0,
          totalSpent: 0,
          latestEvent: enq.eventType,
          latestDate: enq.eventDate,
          firstSeen: enq.createdAt,
          enquiries: [],
          bookings: [],
        });
      }
      const existing = customerMap.get(key);
      existing.enquiryCount += 1;
      existing.enquiries.push({
        id: enq.id,
        enquiryNumber: enq.enquiryNumber,
        eventType: enq.eventType,
        eventDate: enq.eventDate,
        guestCount: enq.guestCount,
        budget: enq.budget,
        status: enq.status,
        venueName: enq.venue?.name,
        createdAt: enq.createdAt,
      });

      if (!existing.latestDate || new Date(enq.eventDate) > new Date(existing.latestDate)) {
        existing.latestDate = enq.eventDate;
        existing.latestEvent = enq.eventType;
      }
    }

    for (const bk of bookings) {
      const cleanPhone = bk.customerPhone?.trim() || "";
      const cleanEmail = bk.customerEmail?.toLowerCase().trim() || "";
      const key = cleanPhone || cleanEmail || bk.id;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: bk.customerName,
          phone: bk.customerPhone,
          email: bk.customerEmail,
          city: bk.venue?.city?.name || "Bhubaneswar",
          enquiryCount: 0,
          bookingCount: 0,
          totalSpent: 0,
          latestEvent: bk.eventType,
          latestDate: bk.eventDate,
          firstSeen: bk.createdAt,
          enquiries: [],
          bookings: [],
        });
      }
      const existing = customerMap.get(key);
      existing.bookingCount += 1;
      existing.totalSpent += bk.totalAmount || 0;
      existing.bookings.push({
        id: bk.id,
        bookingNumber: bk.bookingNumber,
        eventType: bk.eventType,
        eventDate: bk.eventDate,
        timeSlot: bk.timeSlot,
        totalAmount: bk.totalAmount,
        paidAmount: bk.paidAmount,
        balanceAmount: bk.balanceAmount,
        paymentStatus: bk.paymentStatus,
        status: bk.status,
        venueName: bk.venue?.name,
        createdAt: bk.createdAt,
      });

      if (!existing.latestDate || new Date(bk.eventDate) > new Date(existing.latestDate)) {
        existing.latestDate = bk.eventDate;
        existing.latestEvent = bk.eventType;
      }
    }

    let customers = Array.from(customerMap.values());

    // Calculate dynamic stats
    const stats = {
      totalCustomers: customers.length,
      bookedCustomers: customers.filter((c) => c.bookingCount > 0).length,
      leadCustomers: customers.filter((c) => c.bookingCount === 0 && c.enquiryCount > 0).length,
      repeatCustomers: customers.filter((c) => c.bookingCount > 1 || (c.bookingCount >= 1 && c.enquiryCount > 1)).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.latestEvent?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: { customers, stats },
    });
  } catch (error) {
    console.error("GET /api/owner/customers error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to load customers" } }, { status: 500 });
  }
}
