import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "THIS_MONTH"; // TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, LAST_MONTH, THIS_YEAR, ALL

    const now = new Date();
    let startDate: Date | undefined;

    if (range === "TODAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "YESTERDAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (range === "THIS_WEEK") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "LAST_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (range === "THIS_YEAR") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    const [
      totalEnquiries,
      bookedEnquiries,
      totalBookings,
      bookingFinancials,
      commissions,
      topVenues,
      topCities,
    ] = await Promise.all([
      prisma.enquiry.count({ where: dateFilter }),
      prisma.enquiry.count({ where: { ...dateFilter, status: "BOOKED" } }),
      prisma.booking.count({ where: dateFilter }),
      prisma.booking.aggregate({
        where: dateFilter,
        _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
      }),
      prisma.commission.aggregate({
        where: dateFilter,
        _sum: { commissionAmount: true },
      }),
      prisma.booking.groupBy({
        by: ["venueId"],
        where: dateFilter,
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.venue.groupBy({
        by: ["cityId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

    // Fetch venue names for top venues
    const venueIds = topVenues.map((tv) => tv.venueId);
    const venues = await prisma.venue.findMany({
      where: { id: { in: venueIds } },
      select: { id: true, name: true },
    });
    const venueMap: Record<string, string> = {};
    venues.forEach((v) => (venueMap[v.id] = v.name));

    const enrichedTopVenues = topVenues.map((tv) => ({
      name: venueMap[tv.venueId] || "Venue",
      bookings: tv._count.id,
      revenue: tv._sum.totalAmount || 0,
    }));

    const conversionRate = totalEnquiries > 0 ? Math.round((bookedEnquiries / totalEnquiries) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEnquiries,
          bookedEnquiries,
          conversionRate,
          totalBookings,
          totalBookingValue: bookingFinancials._sum.totalAmount || 0,
          totalCollected: bookingFinancials._sum.paidAmount || 0,
          pendingPayments: bookingFinancials._sum.balanceAmount || 0,
          platformRevenue: commissions._sum.commissionAmount || (bookingFinancials._sum.totalAmount || 0) * 0.05,
        },
        topVenues: enrichedTopVenues,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to generate admin reports" } }, { status: 500 });
  }
}
