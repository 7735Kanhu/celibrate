import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [eventCategories, venueCategories] = await Promise.all([
      prisma.eventCategory.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.venueCategory.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ eventCategories, venueCategories });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
