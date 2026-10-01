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
    const customer = await prisma.user.findUnique({
      where: { id, role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        isActive: true,
        createdAt: true,
        enquiries: {
          orderBy: { createdAt: "desc" },
          include: {
            venue: { select: { id: true, name: true, city: { select: { name: true } } } },
            quotations: true,
            booking: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { customerEmail: customer.email },
      orderBy: { eventDate: "desc" },
      include: {
        venue: { select: { name: true } },
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { customer, bookings },
    });
  } catch (error) {
    console.error("GET /api/admin/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch customer profile" } },
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
    const { isActive } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        userName: auth.user!.name,
        userRole: "ADMIN",
        action: isActive ? "ACTIVATED_CUSTOMER" : "DEACTIVATED_CUSTOMER",
        entity: "User",
        entityId: id,
        newValue: JSON.stringify({ isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { customer: updated },
      message: `Customer account ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("PATCH /api/admin/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update customer status" } },
      { status: 500 }
    );
  }
}
