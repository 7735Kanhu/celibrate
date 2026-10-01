import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    const quotation = await prisma.quotation.findFirst({
      where: {
        OR: [{ id }, { quotationNumber: id }],
      },
      include: {
        venue: {
          include: {
            city: true,
            area: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        items: true,
        enquiry: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quotation not found" } },
        { status: 404 }
      );
    }

    // Role access check
    if (currentUser) {
      if (currentUser.role === "VENUE_OWNER" && quotation.venue.ownerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 }
        );
      }
      if (currentUser.role === "CUSTOMER" && quotation.customerId && quotation.customerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: { quotation } });
  } catch (error) {
    console.error("GET /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch quotation" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body; // SENT, VIEWED, NEGOTIATION, ACCEPTED, REJECTED, EXPIRED

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status },
      include: { enquiry: true },
    });

    if (updated.enquiryId && (status === "ACCEPTED" || status === "NEGOTIATION")) {
      await prisma.enquiry.update({
        where: { id: updated.enquiryId },
        data: { status: status === "ACCEPTED" ? "ADVANCE_PENDING" : "NEGOTIATION" },
      });
    }

    return NextResponse.json({
      success: true,
      data: { quotation: updated },
      message: `Quotation status updated to ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update quotation" } },
      { status: 500 }
    );
  }
}
