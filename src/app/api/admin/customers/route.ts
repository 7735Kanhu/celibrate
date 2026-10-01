import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = { role: "CUSTOMER" };

    if (status === "ACTIVE") where.isActive = true;
    if (status === "INACTIVE") where.isActive = false;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            enquiries: true,
            reviews: true,
          },
        },
      },
    });

    // Also get booking count per customer email/phone
    const emails = customers.map((c) => c.email);
    const bookings = await prisma.booking.findMany({
      where: { customerEmail: { in: emails } },
      select: { customerEmail: true, id: true },
    });

    const bookingMap: Record<string, number> = {};
    bookings.forEach((b) => {
      bookingMap[b.customerEmail] = (bookingMap[b.customerEmail] || 0) + 1;
    });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      totalBookings: bookingMap[c.email] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: { customers: enrichedCustomers },
    });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch customers" } },
      { status: 500 }
    );
  }
}
