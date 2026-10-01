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

    const packages = await prisma.venuePackage.findMany({
      where: venueId
        ? { venueId }
        : { venue: { ownerId: currentUser.id } },
      orderBy: { price: "asc" },
      include: {
        venue: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: { packages } });
  } catch (error) {
    console.error("GET /api/owner/packages error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch packages" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { venueId, name, price, guestLimit = 200, description, includes = [] } = body;

    if (!venueId || !name || !price) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Venue, Package Name, and Price are required" } },
        { status: 400 }
      );
    }

    const pkg = await prisma.venuePackage.create({
      data: {
        venueId,
        name,
        price: Number(price),
        guestLimit: Number(guestLimit),
        description: description || null,
        includes: typeof includes === "string" ? includes : JSON.stringify(includes),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: { package: pkg }, message: "Package created successfully" });
  } catch (error) {
    console.error("POST /api/owner/packages error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to create package" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "VENUE_OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, price, guestLimit, description, includes, isActive } = body;

    const updated = await prisma.venuePackage.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? Number(price) : undefined,
        guestLimit: guestLimit !== undefined ? Number(guestLimit) : undefined,
        description: description !== undefined ? description : undefined,
        includes: includes !== undefined ? (typeof includes === "string" ? includes : JSON.stringify(includes)) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: { package: updated }, message: "Package updated successfully" });
  } catch (error) {
    console.error("PATCH /api/owner/packages error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update package" } }, { status: 500 });
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

    await prisma.venuePackage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/owner/packages error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to delete package" } }, { status: 500 });
  }
}
