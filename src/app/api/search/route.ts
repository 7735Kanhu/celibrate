import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        venues: [],
        cities: [],
        categories: [],
      });
    }

    const [venues, cities, categories] = await Promise.all([
      prisma.venue.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { type: { contains: q } },
            { address: { contains: q } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          startingPrice: true,
          city: { select: { name: true } },
        },
      }),
      prisma.city.findMany({
        where: {
          name: { contains: q },
        },
        take: 5,
        select: { id: true, name: true, slug: true, venueCount: true },
      }),
      prisma.eventCategory.findMany({
        where: {
          name: { contains: q },
        },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return NextResponse.json({ venues, cities, categories });
  } catch (error: any) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Failed search query" }, { status: 500 });
  }
}
