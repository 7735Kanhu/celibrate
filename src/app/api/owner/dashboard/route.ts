import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Venue Owner access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueIdParam = searchParams.get("venueId");

    // Fetch all venues owned by this user (Multi-venue support - Req 56)
    const ownedVenues = await prisma.venue.findMany({
      where: currentUser.role === "ADMIN" ? { isArchived: false } : { ownerId: currentUser.id, isArchived: false },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        capacity: true,
        city: { select: { name: true } },
      },
    });

    if (ownedVenues.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          venues: [],
          currentVenue: null,
          stats: {
            newEnquiries: 0,
            pendingFollowUps: 0,
            upcomingEvents: 0,
            confirmedBookings: 0,
            monthlyBookingValue: 0,
            pendingPayments: 0,
          },
          todayFollowUps: [],
          upcomingBookings: [],
          ownerProfile: currentUser.ownerProfile,
        },
      });
    }

    // Determine currently selected venue
    const selectedVenue = venueIdParam
      ? ownedVenues.find((v) => v.id === venueIdParam) || ownedVenues[0]
      : ownedVenues[0];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter by selected venue or all owner's venues
    const venueFilter = venueIdParam && venueIdParam !== "ALL"
      ? { venueId: selectedVenue.id }
      : { venue: { id: { in: ownedVenues.map((v) => v.id) } } };

    const [
      newEnquiries,
      pendingFollowUps,
      upcomingEvents,
      confirmedBookings,
      totalBalances,
      monthBookingSums,
      todayFollowUps,
      upcomingBookings,
      recentEnquiries,
    ] = await Promise.all([
      prisma.enquiry.count({
        where: { ...venueFilter, status: "NEW" },
      }),
      prisma.enquiryFollowUp.count({
        where: { ...venueFilter, status: "Pending" },
      }),
      prisma.booking.count({
        where: {
          ...venueFilter,
          eventDate: { gte: now },
          status: "CONFIRMED",
        },
      }),
      prisma.booking.count({
        where: { ...venueFilter, status: "CONFIRMED" },
      }),
      prisma.booking.aggregate({
        where: venueFilter,
        _sum: { balanceAmount: true, totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          ...venueFilter,
          createdAt: { gte: currentMonthStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.enquiryFollowUp.findMany({
        where: {
          ...venueFilter,
          date: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { time: "asc" },
        include: {
          enquiry: { select: { enquiryNumber: true, eventType: true } },
        },
      }),
      prisma.booking.findMany({
        where: {
          ...venueFilter,
          eventDate: { gte: now },
          status: { notIn: ["CANCELLED"] },
        },
        take: 5,
        orderBy: { eventDate: "asc" },
        include: {
          venue: { select: { name: true } },
        },
      }),
      prisma.enquiry.findMany({
        where: venueFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          services: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        venues: ownedVenues,
        currentVenue: selectedVenue,
        ownerProfile: currentUser.ownerProfile,
        stats: {
          newEnquiries,
          pendingFollowUps,
          upcomingEvents,
          confirmedBookings,
          monthlyBookingValue: monthBookingSums._sum.totalAmount || (totalBalances._sum.totalAmount || 0) * 0.4,
          pendingPayments: totalBalances._sum.balanceAmount || 0,
          totalRevenue: totalBalances._sum.totalAmount || 0,
        },
        todayFollowUps,
        upcomingBookings,
        recentEnquiries,
      },
    });
  } catch (error) {
    console.error("GET /api/owner/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to load owner dashboard data" } },
      { status: 500 }
    );
  }
}
