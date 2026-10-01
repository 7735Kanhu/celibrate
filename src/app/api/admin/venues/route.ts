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
    const city = searchParams.get("city");
    const type = searchParams.get("type");

    const where: any = { isArchived: false };

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (city && city !== "ALL") {
      where.city = { name: city };
    }
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { owner: { name: { contains: search } } },
      ];
    }

    const venues = await prisma.venue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        city: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ownerProfile: { select: { businessName: true, status: true } },
          },
        },
        _count: {
          select: {
            enquiries: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    const cities = await prisma.city.findMany({ select: { id: true, name: true } });

    return NextResponse.json({
      success: true,
      data: { venues, cities },
    });
  } catch (error) {
    console.error("GET /api/admin/venues error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch venues" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const body = await request.json();
    const { name, type, address, cityId, areaId, capacity, startingPrice, description, ownerId } = body;

    if (!name || !type || !cityId || !startingPrice) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Required fields missing" } },
        { status: 400 }
      );
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${slugBase}-${Math.floor(1000 + Math.random() * 9000)}`;

    const venue = await prisma.venue.create({
      data: {
        name,
        slug,
        type,
        address: address || "City Center",
        cityId,
        areaId: areaId || null,
        capacity: Number(capacity) || 500,
        startingPrice: Number(startingPrice),
        description: description || `${name} is an event venue suitable for weddings and celebrations.`,
        ownerId: ownerId || null,
        status: "APPROVED",
        isVerified: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        userName: auth.user!.name,
        userRole: "ADMIN",
        action: "CREATED_VENUE",
        entity: "Venue",
        entityId: venue.id,
        newValue: JSON.stringify({ name: venue.name, status: "APPROVED" }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { venue },
      message: "Venue created successfully",
    });
  } catch (error) {
    console.error("POST /api/admin/venues error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create venue" } },
      { status: 500 }
    );
  }
}
