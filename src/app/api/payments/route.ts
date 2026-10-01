import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const where: any = {};

    if (currentUser.role === "VENUE_OWNER") {
      where.venue = { ownerId: currentUser.id };
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "ADMIN") {
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "CUSTOMER") {
      where.booking = { customerEmail: currentUser.email };
    }

    if (method && method !== "ALL") {
      where.paymentMethod = method;
    }

    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { referenceNumber: { contains: search } },
        { booking: { bookingNumber: { contains: search } } },
        { booking: { customerName: { contains: search } } },
      ];
    }

    const payments = await prisma.bookingPayment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      include: {
        venue: {
          select: { id: true, name: true, city: { select: { name: true } } },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            eventType: true,
            eventDate: true,
            totalAmount: true,
            balanceAmount: true,
            paymentStatus: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch payments" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "VENUE_OWNER")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Admin and Venue Owners can record payments" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      bookingId,
      amount,
      paymentMethod = "UPI",
      paymentType = "ADVANCE",
      paymentDate = new Date(),
      referenceNumber,
      notes,
    } = body;

    const paymentAmount = Number(amount);
    if (!bookingId || !paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid booking ID and payment amount required" } },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { venue: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && booking.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized for this venue" } },
        { status: 403 }
      );
    }

    // Generate receipt number: RCP-YYYYMM-RANDOM5
    const datePrefix = new Date().toISOString().slice(0, 7).replace("-", "");
    const count = await prisma.bookingPayment.count();
    const receiptNumber = `RCP-${datePrefix}-${500 + count + 1}`;

    const newPaidAmount = booking.paidAmount + paymentAmount;
    const newBalanceAmount = Math.max(0, booking.totalAmount - newPaidAmount);
    const newPaymentStatus = newPaidAmount >= booking.totalAmount ? "PAID" : "PARTIAL";

    const payment = await prisma.$transaction(async (tx) => {
      // 1. Record payment
      const p = await tx.bookingPayment.create({
        data: {
          receiptNumber,
          bookingId: booking.id,
          customerId: booking.customerId,
          venueId: booking.venueId,
          amount: paymentAmount,
          paymentMethod,
          paymentType,
          paymentDate: new Date(paymentDate),
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          recordedById: currentUser.id,
          recordedByName: currentUser.name,
        },
      });

      // 2. Update booking balances
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      // 3. Update payment schedule milestone if applicable
      const milestone = paymentType === "ADVANCE" ? "Advance Payment" : paymentType === "FINAL_PAYMENT" ? "Final Settlement" : "Second Payment";
      const schedule = await tx.paymentSchedule.findFirst({
        where: { bookingId: booking.id, milestone },
      });
      if (schedule) {
        await tx.paymentSchedule.update({
          where: { id: schedule.id },
          data: { status: "PAID" },
        });
      }

      // 4. Update commission status if settled
      if (newPaymentStatus === "PAID") {
        await tx.commission.updateMany({
          where: { bookingId: booking.id },
          data: { status: "SETTLED" },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "RECORDED_PAYMENT",
          entity: "BookingPayment",
          entityId: p.id,
          newValue: JSON.stringify({ receiptNumber, amount: paymentAmount, method: paymentMethod, bookingNumber: booking.bookingNumber }),
        },
      });

      return p;
    });

    return NextResponse.json({
      success: true,
      data: { payment },
      message: `Payment of ₹${paymentAmount.toLocaleString("en-IN")} recorded. Receipt: ${receiptNumber}`,
    });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to record payment" } },
      { status: 500 }
    );
  }
}
