import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    if (!venueId) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Venue ID required" } }, { status: 400 });
    }

    const images = await prisma.venueImage.findMany({
      where: { venueId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });

    const categories = [
      "Exterior",
      "Main Hall",
      "Stage",
      "Dining",
      "Rooms",
      "Parking",
      "Garden",
      "Decoration",
    ];

    return NextResponse.json({
      success: true,
      data: { images, categories },
    });
  } catch (error) {
    console.error("GET /api/owner/gallery error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch gallery" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { venueId, url, category = "Main Hall", caption, isPrimary = false } = body;

    if (!venueId || !url) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Venue ID and Image URL required" } }, { status: 400 });
    }

    const image = await prisma.venueImage.create({
      data: {
        venueId,
        url,
        category,
        caption: caption || `${category} view`,
        isPrimary: Boolean(isPrimary),
      },
    });

    return NextResponse.json({
      success: true,
      data: { image },
      message: "Image added to gallery",
    });
  } catch (error) {
    console.error("POST /api/owner/gallery error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to upload image" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { id, venueId, setPrimary } = body;

    if (setPrimary && venueId) {
      await prisma.$transaction(async (tx) => {
        await tx.venueImage.updateMany({
          where: { venueId },
          data: { isPrimary: false },
        });
        await tx.venueImage.update({
          where: { id },
          data: { isPrimary: true },
        });
      });
    }

    return NextResponse.json({ success: true, message: "Cover image set successfully" });
  } catch (error) {
    console.error("PATCH /api/owner/gallery error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update image" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "ID is required" } }, { status: 400 });
    }

    await prisma.venueImage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Image removed from gallery" });
  } catch (error) {
    console.error("DELETE /api/owner/gallery error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to delete image" } }, { status: 500 });
  }
}
