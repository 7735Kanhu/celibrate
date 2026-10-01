import { prisma } from "./prisma";

export interface CreateBookingParams {
  enquiryId?: string;
  quotationId?: string;
  venueId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: Date | string;
  timeSlot?: string;
  guestCount: number;
  totalAmount: number;
  advanceAmount?: number;
  paymentMethod?: string;
  referenceNumber?: string;
  specialNotes?: string;
  recordedById?: string;
  recordedByName?: string;
  actorRole: "ADMIN" | "VENUE_OWNER";
  actorUserId: string;
}

export async function convertOrDirectBooking(params: CreateBookingParams) {
  const targetDate = new Date(params.eventDate);
  // Normalize date to start of day for comparison
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const slot = params.timeSlot || "Full Day";

  return await prisma.$transaction(async (tx) => {
    // 1. Verify venue existence and ownership authorization
    const venue = await tx.venue.findUnique({
      where: { id: params.venueId },
      select: { id: true, name: true, ownerId: true, startingPrice: true },
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    if (params.actorRole === "VENUE_OWNER" && venue.ownerId !== params.actorUserId) {
      throw new Error("Unauthorized: You do not own this venue");
    }

    // 2. Double-booking conflict check
    // Look for existing active bookings for this venue on the same date
    const conflicts = await tx.booking.findMany({
      where: {
        venueId: params.venueId,
        status: { notIn: ["CANCELLED"] },
        eventDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const isConflicting = conflicts.some((b) => {
      if (b.timeSlot === "Full Day" || slot === "Full Day") return true;
      return b.timeSlot === slot;
    });

    if (isConflicting) {
      throw new Error("This venue is already booked for the selected date/time.");
    }

    // 3. Generate unique booking number
    const count = await tx.booking.count();
    const datePrefix = new Date().toISOString().slice(0, 7).replace("-", "");
    const bookingNumber = `BK-${datePrefix}-${10000 + count + 1}`;

    const advance = Number(params.advanceAmount || 0);
    const total = Number(params.totalAmount);
    const paid = advance;
    const balance = total - paid;
    const paymentStatus = paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";

    // 4. Create Booking
    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        enquiryId: params.enquiryId || null,
        quotationId: params.quotationId || null,
        venueId: params.venueId,
        customerId: params.customerId || null,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        eventType: params.eventType,
        eventDate: targetDate,
        timeSlot: slot,
        guestCount: Number(params.guestCount),
        totalAmount: total,
        advanceAmount: advance,
        paidAmount: paid,
        balanceAmount: balance,
        paymentStatus,
        status: "CONFIRMED",
        specialNotes: params.specialNotes || null,
      },
    });

    // 5. Update Enquiry if applicable
    if (params.enquiryId) {
      await tx.enquiry.update({
        where: { id: params.enquiryId },
        data: { status: "BOOKED" },
      });

      await tx.enquiryActivity.create({
        data: {
          enquiryId: params.enquiryId,
          type: "STATUS_CHANGE",
          note: `Converted enquiry into Confirmed Booking ${bookingNumber}`,
          userId: params.actorUserId,
          userName: params.recordedByName || "Coordinator",
        },
      });
    }

    // 6. Record Advance Payment if provided
    if (advance > 0) {
      const pCount = await tx.bookingPayment.count();
      const rcpNumber = `RCP-${datePrefix}-${500 + pCount + 1}`;

      await tx.bookingPayment.create({
        data: {
          receiptNumber: rcpNumber,
          bookingId: booking.id,
          customerId: params.customerId || null,
          venueId: params.venueId,
          amount: advance,
          paymentMethod: params.paymentMethod || "UPI",
          paymentType: "ADVANCE",
          referenceNumber: params.referenceNumber || `REF-${Date.now()}`,
          notes: "Advance payment recorded during booking confirmation",
          recordedById: params.actorUserId,
          recordedByName: params.recordedByName || "Staff",
        },
      });
    }

    // 7. Payment Schedule
    await tx.paymentSchedule.createMany({
      data: [
        {
          bookingId: booking.id,
          milestone: "Advance Payment",
          amount: advance > 0 ? advance : Math.round(total * 0.25),
          status: advance > 0 ? "PAID" : "PENDING",
          dueDate: new Date(),
        },
        {
          bookingId: booking.id,
          milestone: "Second Payment",
          amount: Math.round((total - advance) * 0.5),
          status: "PENDING",
          dueDate: new Date(targetDate.getTime() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          bookingId: booking.id,
          milestone: "Final Settlement",
          amount: total - advance - Math.round((total - advance) * 0.5),
          status: "PENDING",
          dueDate: new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // 8. Event Management Initial Record
    await tx.event.create({
      data: {
        bookingId: booking.id,
        venueId: params.venueId,
        eventType: params.eventType,
        eventDate: targetDate,
        timeSlot: slot,
        guestCount: Number(params.guestCount),
        notes: params.specialNotes || "Internal booking scheduled.",
      },
    });

    // 9. Commission calculation (default 5%)
    let commissionRate = 5.0;
    const setting = await tx.platformSetting.findUnique({
      where: { key: "commission_rate" },
    });
    if (setting && !isNaN(Number(setting.value))) {
      commissionRate = Number(setting.value);
    }

    const commissionAmount = Math.round((total * commissionRate) / 100);
    const ownerAmount = total - commissionAmount;

    await tx.commission.create({
      data: {
        bookingId: booking.id,
        venueId: params.venueId,
        bookingAmount: total,
        commissionType: "PERCENTAGE",
        commissionRate,
        commissionAmount,
        ownerAmount,
        status: paid >= total ? "SETTLED" : "PENDING",
      },
    });

    // 10. Audit Log & Notifications
    await tx.auditLog.create({
      data: {
        userId: params.actorUserId,
        userName: params.recordedByName || "System",
        userRole: params.actorRole,
        action: "CONVERTED_BOOKING",
        entity: "Booking",
        entityId: booking.id,
        newValue: JSON.stringify({ bookingNumber, total, advance, status: "CONFIRMED" }),
      },
    });

    await tx.notification.create({
      data: {
        role: "ADMIN",
        title: "New Booking Created",
        message: `Booking ${bookingNumber} created for ${venue.name} (${params.eventType} on ${targetDate.toLocaleDateString()}).`,
        link: "/admin/bookings",
      },
    });

    return booking;
  });
}
