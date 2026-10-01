import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");

    const venue = await prisma.venue.findFirst({
      where: venueId
        ? { id: venueId, ...(currentUser.role === "VENUE_OWNER" ? { ownerId: currentUser.id } : {}) }
        : { ownerId: currentUser.id },
      include: {
        city: true,
        area: true,
        packages: true,
        amenities: true,
        images: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Venue not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { venue } });
  } catch (error) {
    console.error("GET /api/owner/venue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch venue details" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { venueId, name, type, description, address, capacity, indoorCap, outdoorCap, parkingCap, roomCount, startingPrice } = body;

    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Venue not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You can only edit your own venue" } },
        { status: 403 }
      );
    }

    const updated = await prisma.venue.update({
      where: { id: venueId },
      data: {
        name: name || venue.name,
        type: type || venue.type,
        description: description !== undefined ? description : venue.description,
        address: address || venue.address,
        capacity: Number(capacity) || venue.capacity,
        indoorCap: indoorCap !== undefined ? Number(indoorCap) : venue.indoorCap,
        outdoorCap: outdoorCap !== undefined ? Number(outdoorCap) : venue.outdoorCap,
        parkingCap: parkingCap !== undefined ? Number(parkingCap) : venue.parkingCap,
        roomCount: roomCount !== undefined ? Number(roomCount) : venue.roomCount,
        startingPrice: startingPrice !== undefined ? Number(startingPrice) : venue.startingPrice,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "UPDATED_VENUE_PROFILE",
        entity: "Venue",
        entityId: venueId,
        newValue: JSON.stringify({ name: updated.name, startingPrice: updated.startingPrice }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { venue: updated },
      message: "Venue details updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/owner/venue error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update venue details" } },
      { status: 500 }
    );
  }
}
