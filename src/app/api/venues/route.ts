import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const eventType = searchParams.get("eventType");
    const venueType = searchParams.get("venueType");
    const guestCapacity = searchParams.get("guestCapacity");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const amenities = searchParams.get("amenities")?.split(",");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recommended";
    const isFeatured = searchParams.get("featured") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // Build Prisma where filter dynamically
    const where: any = {};

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (city) {
      where.city = {
        slug: {
          equals: city.toLowerCase(),
        },
      };
    }

    if (area) {
      where.area = {
        slug: {
          equals: area.toLowerCase(),
        },
      };
    }

    if (venueType) {
      where.type = {
        equals: venueType,
      };
    }

    if (guestCapacity) {
      const cap = parseInt(guestCapacity, 10);
      if (!isNaN(cap)) {
        where.capacity = {
          gte: cap,
        };
      }
    }

    if (minPrice || maxPrice) {
      where.startingPrice = {};
      if (minPrice) where.startingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.startingPrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { city: { name: { contains: search } } },
      ];
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        some: {
          name: {
            in: amenities,
          },
        },
      };
    }

    // Determine sorting order
    let orderBy: any = { rating: "desc" };
    if (sort === "price-low") {
      orderBy = { startingPrice: "asc" };
    } else if (sort === "price-high") {
      orderBy = { startingPrice: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (sort === "popular") {
      orderBy = { reviewCount: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          city: true,
          area: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          amenities: true,
          packages: true,
        },
      }),
      prisma.venue.count({ where }),
    ]);

    return NextResponse.json({
      venues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/venues error:", error);
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
