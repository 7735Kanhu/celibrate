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

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingNumber: id }],
      },
      include: {
        venue: {
          include: {
            city: true,
            area: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        quotation: {
          include: { items: true },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        schedules: {
          orderBy: { dueDate: "asc" },
        },
        eventDetails: {
          include: {
            expenses: { orderBy: { date: "desc" } },
          },
        },
        commission: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    // Role check
    const isCustomer = currentUser?.role === "CUSTOMER" || (!currentUser && false);
    if (isCustomer) {
      if (currentUser && booking.customerEmail !== currentUser.email && booking.customerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 }
        );
      }
    } else if (currentUser?.role === "VENUE_OWNER") {
      if (booking.venue.ownerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied to this venue booking" } },
          { status: 403 }
        );
      }
    }

    // Calculate internal financial summary (Internal to Owner & Admin only!)
    let totalExpenses = 0;
    if (booking.eventDetails?.expenses) {
      totalExpenses = booking.eventDetails.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }
    const estimatedProfit = booking.totalAmount - totalExpenses;

    const data: any = { booking };

    if (!isCustomer) {
      data.internalFinancials = {
        totalRevenue: booking.totalAmount,
        totalExpenses,
        estimatedProfit,
        platformCommission: booking.commission?.commissionAmount || 0,
        netOwnerAmount: (booking.commission?.ownerAmount || booking.totalAmount) - totalExpenses,
      };
    } else {
      // Strip internal financial expenses and commission from customer response
      if (data.booking.eventDetails) {
        data.booking.eventDetails.expenses = [];
      }
      delete data.booking.commission;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch booking details" } },
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

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "VENUE_OWNER")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, specialNotes, eventOperations } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { venue: true, eventDetails: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && booking.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: status || booking.status,
          specialNotes: specialNotes !== undefined ? specialNotes : booking.specialNotes,
        },
      });

      if (eventOperations && booking.eventDetails) {
        await tx.event.update({
          where: { id: booking.eventDetails.id },
          data: {
            notes: eventOperations.notes,
            decorationInstructions: eventOperations.decorationInstructions,
            cateringInstructions: eventOperations.cateringInstructions,
            djInstructions: eventOperations.djInstructions,
            photographyInstructions: eventOperations.photographyInstructions,
            guestRequirements: eventOperations.guestRequirements,
            specialRequests: eventOperations.specialRequests,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "UPDATED_BOOKING",
          entity: "Booking",
          entityId: id,
          oldValue: JSON.stringify({ status: booking.status }),
          newValue: JSON.stringify({ status: b.status }),
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      data: { booking: updated },
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update booking" } },
      { status: 500 }
    );
  }
}
