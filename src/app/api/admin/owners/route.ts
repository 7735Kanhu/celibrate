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

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { ownerName: { contains: search } },
        { businessName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const owners = await prisma.venueOwnerProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            venues: {
              where: { isArchived: false },
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                city: { select: { name: true } },
                _count: {
                  select: { enquiries: true, bookings: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { owners },
    });
  } catch (error) {
    console.error("GET /api/admin/owners error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch venue owners" } },
      { status: 500 }
    );
  }
}
