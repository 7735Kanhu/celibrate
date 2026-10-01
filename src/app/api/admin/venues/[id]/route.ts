import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        city: true,
        area: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            ownerProfile: true,
          },
        },
        images: true,
        packages: true,
        amenities: true,
        _count: {
          select: { enquiries: true, bookings: true, reviews: true },
        },
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
    console.error("GET /api/admin/venues/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch venue" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const body = await request.json();
    const { action, status, isFeatured, isVerified } = body;

    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Venue not found" } },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;

    if (action === "ARCHIVE") {
      updateData.isArchived = true;
      updateData.status = "INACTIVE";
    }

    const updated = await prisma.venue.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        userName: auth.user!.name,
        userRole: "ADMIN",
        action: action ? `VENUE_${action}` : "UPDATE_VENUE_STATUS",
        entity: "Venue",
        entityId: id,
        oldValue: JSON.stringify({ status: existing.status, isFeatured: existing.isFeatured }),
        newValue: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      data: { venue: updated },
      message: "Venue updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/admin/venues/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update venue" } },
      { status: 500 }
    );
  }
}
