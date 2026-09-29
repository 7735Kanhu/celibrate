import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@celibrate.demo" },
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        venue: {
          include: {
            city: true,
            images: { where: { isPrimary: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueId } = body;

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 });
    }

    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@celibrate.demo" },
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Please log in to save favorites" }, { status: 401 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_venueId: {
          userId,
          venueId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorite: false });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        venueId,
      },
    });

    return NextResponse.json({ success: true, isFavorite: true, favorite });
  } catch (error: any) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
