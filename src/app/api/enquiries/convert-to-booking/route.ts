import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { convertOrDirectBooking } from "@/lib/bookingService";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "VENUE_OWNER")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only Admin or authorized Venue Owners can convert enquiries into bookings" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      enquiryId,
      quotationId,
      totalAmount,
      advanceAmount = 0,
      paymentMethod = "UPI",
      referenceNumber,
      specialNotes,
      timeSlot,
    } = body;

    if (!enquiryId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Enquiry ID is required" } },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { venue: true, quotations: { where: { status: "ACCEPTED" }, take: 1 } },
    });

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Enquiry not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && enquiry.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You can only convert enquiries for your own venue" } },
        { status: 403 }
      );
    }

    // Determine final total amount
    let finalTotal = Number(totalAmount);
    if (!finalTotal || isNaN(finalTotal)) {
      if (enquiry.quotations.length > 0) {
        finalTotal = enquiry.quotations[0].total;
      } else {
        finalTotal = enquiry.venue.startingPrice;
      }
    }

    const booking = await convertOrDirectBooking({
      enquiryId: enquiry.id,
      quotationId: quotationId || enquiry.quotations[0]?.id,
      venueId: enquiry.venueId,
      customerId: enquiry.userId || undefined,
      customerName: enquiry.customerName,
      customerPhone: enquiry.customerPhone,
      customerEmail: enquiry.customerEmail,
      eventType: enquiry.eventType,
      eventDate: enquiry.eventDate,
      timeSlot: timeSlot || enquiry.preferredTime || "Full Day",
      guestCount: enquiry.guestCount,
      totalAmount: finalTotal,
      advanceAmount: Number(advanceAmount) || 0,
      paymentMethod,
      referenceNumber,
      specialNotes,
      actorRole: currentUser.role as "ADMIN" | "VENUE_OWNER",
      actorUserId: currentUser.id,
      recordedByName: currentUser.name,
    });

    return NextResponse.json({
      success: true,
      data: { booking },
      message: `Enquiry converted into Confirmed Booking ${booking.bookingNumber}`,
    });
  } catch (error: any) {
    console.error("POST /api/enquiries/convert-to-booking error:", error);
    if (error.message.includes("already booked")) {
      return NextResponse.json(
        { success: false, error: { code: "DOUBLE_BOOKING_CONFLICT", message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to convert enquiry to booking" } },
      { status: 500 }
    );
  }
}
