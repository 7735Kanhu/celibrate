import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");

    const where: any = currentUser.role === "ADMIN"
      ? {}
      : { venue: { ownerId: currentUser.id } };

    if (venueId && venueId !== "ALL") {
      where.venueId = venueId;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error("GET /api/owner/reviews error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch reviews" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { id, reply } = body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Review not found" } }, { status: 404 });
    }

    if (currentUser.role === "VENUE_OWNER" && review.venue.ownerId !== currentUser.id) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        reply,
        replyDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { review: updated },
      message: "Reply saved successfully",
    });
  } catch (error) {
    console.error("PATCH /api/owner/reviews error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to reply to review" } }, { status: 500 });
  }
}
