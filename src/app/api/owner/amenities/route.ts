import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    if (!venueId) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Venue ID is required" } }, { status: 400 });
    }

    const amenities = await prisma.venueAmenity.findMany({
      where: { venueId },
    });

    const standardAmenities = [
      "AC",
      "Parking",
      "Generator",
      "Kitchen",
      "Bridal Room",
      "Guest Rooms",
      "Stage",
      "Sound System",
      "Wi-Fi",
      "Dining Area",
      "Lift",
      "Outdoor Area",
      "Wheelchair Access",
    ];

    const currentNames = amenities.map((a) => a.name);

    return NextResponse.json({
      success: true,
      data: {
        amenities,
        standardAmenities,
        activeList: currentNames,
      },
    });
  } catch (error) {
    console.error("GET /api/owner/amenities error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch amenities" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { venueId, selectedAmenities } = body; // Array of strings e.g. ["AC", "Parking", ...]

    if (!venueId || !Array.isArray(selectedAmenities)) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload" } }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Remove existing
      await tx.venueAmenity.deleteMany({ where: { venueId } });

      // Add selected
      for (const name of selectedAmenities) {
        await tx.venueAmenity.create({
          data: { venueId, name },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Venue amenities updated successfully",
    });
  } catch (error) {
    console.error("POST /api/owner/amenities error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update amenities" } }, { status: 500 });
  }
}
