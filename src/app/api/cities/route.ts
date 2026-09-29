import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      include: {
        areas: true,
      },
    });

    return NextResponse.json({ cities });
  } catch (error: any) {
    console.error("GET /api/cities error:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
