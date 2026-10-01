import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access to this booking" } },
        { status: 403 }
      );
    }

    // Ensure eventDetails exists
    let eventId = booking.eventDetails?.id;
    if (!eventId) {
      const newEvent = await prisma.event.create({
        data: {
          bookingId: booking.id,
          venueId: booking.venueId,
          eventType: booking.eventType,
          eventDate: booking.eventDate,
          guestCount: booking.guestCount,
        },
      });
      eventId = newEvent.id;
    }

    const body = await request.json();
    const { category, title, description, amount, paidTo, date } = body;
    const desc = title || description;

    if (!category || !desc || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Category, description, and valid positive amount are required" } },
        { status: 400 }
      );
    }

    const expense = await prisma.eventExpense.create({
      data: {
        eventId,
        bookingId: booking.id,
        venueId: booking.venueId,
        category,
        description: desc,
        amount: Number(amount),
        recordedByName: paidTo ? `${currentUser.name} (Paid to ${paidTo})` : currentUser.name,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { expense },
      message: "Expense recorded successfully",
    });
  } catch (error: any) {
    console.error("POST /api/bookings/[id]/expenses error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to record expense" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Expense ID is required" } },
        { status: 400 }
      );
    }

    const expense = await prisma.eventExpense.findUnique({
      where: { id: expenseId },
      include: {
        venue: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Expense not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && expense.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    await prisma.eventExpense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/bookings/[id]/expenses error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete expense" } },
      { status: 500 }
    );
  }
}
