import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");

    const where: any = {};
    if (category) where.category = category;
    if (city) where.city = city;

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error("GET /api/vendors error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
