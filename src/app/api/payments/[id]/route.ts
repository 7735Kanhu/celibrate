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

    const payment = await prisma.bookingPayment.findFirst({
      where: {
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        venue: {
          include: {
            city: true,
            area: true,
          },
        },
        booking: {
          include: {
            payments: { orderBy: { paymentDate: "asc" } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Payment receipt not found" } },
        { status: 404 }
      );
    }

    if (currentUser?.role === "VENUE_OWNER" && payment.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: { payment } });
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch payment details" } },
      { status: 500 }
    );
  }
}
