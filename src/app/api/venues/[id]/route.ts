import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const venue = await prisma.venue.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        city: true,
        area: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        amenities: true,
        packages: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Also fetch similar venues in same city or venue type
    const similarVenues = await prisma.venue.findMany({
      where: {
        id: { not: venue.id },
        OR: [{ cityId: venue.cityId }, { type: venue.type }],
      },
      take: 4,
      include: {
        city: true,
        images: {
          where: { isPrimary: true },
        },
      },
    });

    return NextResponse.json({ venue, similarVenues });
  } catch (error: any) {
    console.error("GET /api/venues/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch venue detail" }, { status: 500 });
  }
}
