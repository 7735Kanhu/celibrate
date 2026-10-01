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
    const venueId = searchParams.get("venueId");

    const venueFilter = venueId && venueId !== "ALL"
      ? { venueId }
      : currentUser.role === "ADMIN"
      ? {}
      : { venue: { ownerId: currentUser.id } };

    const [
      totalEnquiries,
      bookedEnquiries,
      totalBookings,
      confirmedBookings,
      bookingSums,
      expensesSum,
      commissions,
      eventTypes,
    ] = await Promise.all([
      prisma.enquiry.count({ where: venueFilter }),
      prisma.enquiry.count({ where: { ...venueFilter, status: "BOOKED" } }),
      prisma.booking.count({ where: venueFilter }),
      prisma.booking.count({ where: { ...venueFilter, status: "CONFIRMED" } }),
      prisma.booking.aggregate({
        where: venueFilter,
        _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
      }),
      prisma.eventExpense.aggregate({
        where: venueFilter,
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: venueFilter,
        _sum: { commissionAmount: true, ownerAmount: true },
      }),
      prisma.booking.groupBy({
        by: ["eventType"],
        where: venueFilter,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    const grossValue = bookingSums._sum.totalAmount || 0;
    const platformCommission = commissions._sum.commissionAmount || Math.round(grossValue * 0.05);
    const netOwnerAmount = commissions._sum.ownerAmount || (grossValue - platformCommission);
    const totalExpenses = expensesSum._sum.amount || 0;
    const estimatedNetProfit = netOwnerAmount - totalExpenses;
    const conversionRate = totalEnquiries > 0 ? Math.round((bookedEnquiries / totalEnquiries) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEnquiries,
          bookedEnquiries,
          conversionRate,
          totalBookings,
          confirmedBookings,
          grossBookingValue: grossValue,
          totalCollected: bookingSums._sum.paidAmount || 0,
          pendingPayments: bookingSums._sum.balanceAmount || 0,
          platformCommission,
          netOwnerAmount,
          totalExpenses,
          estimatedNetProfit,
        },
        eventTypes: eventTypes.map((et) => ({
          type: et.eventType,
          bookings: et._count.id,
          revenue: et._sum.totalAmount || 0,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/owner/reports error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to generate owner reports" } }, { status: 500 });
  }
}
