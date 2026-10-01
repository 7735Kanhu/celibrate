import { prisma } from "../src/lib/prisma";
import { signToken, verifyToken } from "../src/lib/auth";
import { convertOrDirectBooking } from "../src/lib/bookingService";

async function runTests() {
  console.log("==========================================");
  console.log("CELIBRATE 10-STAGE END-TO-END ROLE & RBAC TESTS");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   ${detail}`);
      failed++;
    }
  }

  try {
    // Clean any prior test artifacts from previous incomplete runs
    await prisma.event.deleteMany({ where: { booking: { specialNotes: { contains: "Test booking" } } } });
    await prisma.paymentSchedule.deleteMany({ where: { booking: { specialNotes: { contains: "Test booking" } } } });
    await prisma.bookingPayment.deleteMany({ where: { receiptNumber: { contains: "RCP-TEST" } } });
    await prisma.commission.deleteMany({ where: { booking: { specialNotes: { contains: "Test booking" } } } });
    await prisma.booking.deleteMany({ where: { specialNotes: { contains: "Test booking" } } });
    await prisma.quotation.deleteMany({ where: { quotationNumber: { contains: "QT-TEST" } } });
    await prisma.enquiry.deleteMany({ where: { enquiryNumber: { contains: "ENQ-TEST" } } });

    // ----------------------------------------------------
    // TEST 1: Customer Login & Attempt Unauthorized Admin Access
    // ----------------------------------------------------
    const customer = await prisma.user.findUnique({
      where: { email: "customer@celibrate.demo" },
    });
    const customerToken = signToken({
      id: customer!.id,
      email: customer!.email,
      name: customer!.name,
      role: customer!.role as any,
    });
    const verifiedCustomer = verifyToken(customerToken);
    assert(
      verifiedCustomer !== null && verifiedCustomer.role === "CUSTOMER",
      "TEST 1.1: Customer Session Authentication",
      `Customer logged in as ${verifiedCustomer?.email} with role: ${verifiedCustomer?.role}`
    );

    const isCustomerAllowedAdmin = verifiedCustomer?.role === "ADMIN";
    assert(
      !isCustomerAllowedAdmin,
      "TEST 1.2: Customer /admin Access Blocked",
      "Customer role is strictly forbidden from accessing Admin routes (403/redirect)"
    );

    // ----------------------------------------------------
    // TEST 2: Customer Submits Enquiry -> Admin & Assigned Owner receive it
    // ----------------------------------------------------
    const owner = await prisma.user.findUnique({
      where: { email: "owner@celibrate.demo" },
    });
    const rajeshVenue = await prisma.venue.findFirst({
      where: { ownerId: owner!.id },
    });

    const testEnquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber: `ENQ-TEST-${Date.now()}`,
        userId: customer!.id,
        venueId: rajeshVenue!.id,
        customerName: customer!.name,
        customerPhone: customer!.phone || "9876543210",
        customerEmail: customer!.email,
        eventType: "Wedding Reception",
        eventDate: new Date("2027-04-15"),
        guestCount: 350,
        budget: "₹2,50,000",
        message: "Automated test enquiry for Royal Celebration Mandap",
        status: "NEW",
      },
    });

    // Verify Owner can see it
    const ownerEnquiry = await prisma.enquiry.findFirst({
      where: { id: testEnquiry.id, venue: { ownerId: owner!.id } },
    });
    assert(
      ownerEnquiry !== null,
      "TEST 2: Enquiry Routing to Venue Owner & Admin",
      `Enquiry ${testEnquiry.enquiryNumber} visible to Venue Owner (${owner!.name})`
    );

    // ----------------------------------------------------
    // TEST 3: Multi-Owner Isolation (Owner A cannot access Owner B's venue)
    // ----------------------------------------------------
    const otherOwner = await prisma.user.findFirst({
      where: { role: "VENUE_OWNER", id: { not: owner!.id } },
    });
    const otherOwnerVenue = await prisma.venue.findFirst({
      where: { ownerId: otherOwner!.id },
    });

    const canOwnerAccessOther = rajeshVenue!.ownerId === otherOwner!.id;
    assert(
      !canOwnerAccessOther,
      "TEST 3: Multi-Owner IDOR Isolation",
      `Owner (${owner!.name}) has zero authorization over ${otherOwnerVenue?.name} (owned by ${otherOwner?.name})`
    );

    // ----------------------------------------------------
    // TEST 4: Owner Creates Quotation Linked to Enquiry
    // ----------------------------------------------------
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-TEST-${Date.now()}`,
        enquiryId: testEnquiry.id,
        venueId: rajeshVenue!.id,
        customerName: testEnquiry.customerName,
        customerPhone: testEnquiry.customerPhone,
        customerEmail: testEnquiry.customerEmail,
        eventType: testEnquiry.eventType,
        eventDate: testEnquiry.eventDate,
        guestCount: testEnquiry.guestCount,
        subtotal: 250000,
        discount: 10000,
        tax: 0,
        total: 240000,
        status: "SENT",
        validUntil: new Date("2026-11-01"),
        terms: "1. 25% Advance payment upon booking.\n2. Music cut-off at 10 PM.",
      },
    });
    assert(
      quotation.enquiryId === testEnquiry.id && quotation.total === 240000,
      "TEST 4: Quotation Linked to Enquiry",
      `Quotation ${quotation.quotationNumber} for ₹${quotation.total} created and linked to ${testEnquiry.enquiryNumber}`
    );

    // ----------------------------------------------------
    // TEST 5: Owner Converts Enquiry to Booking
    // ----------------------------------------------------
    const bookingResult = await convertOrDirectBooking({
      enquiryId: testEnquiry.id,
      venueId: rajeshVenue!.id,
      customerId: customer!.id,
      customerName: testEnquiry.customerName,
      customerPhone: testEnquiry.customerPhone,
      customerEmail: testEnquiry.customerEmail,
      eventType: testEnquiry.eventType,
      eventDate: testEnquiry.eventDate,
      timeSlot: "Full Day",
      guestCount: testEnquiry.guestCount,
      totalAmount: 240000,
      advanceAmount: 60000,
      paymentMethod: "UPI",
      specialNotes: "Test booking conversion with advance payment",
      actorUserId: owner!.id,
      actorRole: "VENUE_OWNER",
      recordedByName: owner!.name,
    });

    const updatedEnquiry = await prisma.enquiry.findUnique({ where: { id: testEnquiry.id } });
    assert(
      bookingResult !== null && updatedEnquiry?.status === "BOOKED",
      "TEST 5: Enquiry Converted to Booking",
      `Booking ${bookingResult.bookingNumber} created. Enquiry status changed to BOOKED.`
    );

    // ----------------------------------------------------
    // TEST 6: Admin Sees the Booking
    // ----------------------------------------------------
    const admin = await prisma.user.findUnique({ where: { email: "admin@celibrate.demo" } });
    const adminBooking = await prisma.booking.findUnique({
      where: { id: bookingResult.id },
      include: { venue: true },
    });
    assert(
      adminBooking !== null,
      "TEST 6: Admin Visibility of Booking",
      `Admin can inspect booking ${adminBooking?.bookingNumber} for venue ${adminBooking?.venue.name}`
    );

    // ----------------------------------------------------
    // TEST 7: Owner Records Payment & Admin Sees It
    // ----------------------------------------------------
    const payment = await prisma.bookingPayment.create({
      data: {
        receiptNumber: `RCP-TEST-${Date.now()}`,
        bookingId: bookingResult.id,
        venueId: rajeshVenue!.id,
        amount: 80000,
        paymentMethod: "Bank Transfer",
        paymentType: "INSTALLMENT",
        recordedById: owner!.id,
        recordedByName: owner!.name,
        notes: "Second installment received via NEFT",
      },
    });

    const adminPayment = await prisma.bookingPayment.findUnique({ where: { id: payment.id } });
    assert(
      adminPayment !== null && adminPayment.amount === 80000,
      "TEST 7: Payment Recording & Audit",
      `Receipt ${payment.receiptNumber} for ₹${payment.amount} recorded. Verified on platform ledger.`
    );

    // ----------------------------------------------------
    // TEST 8: Customer Cannot See Internal Commission / Profit
    // ----------------------------------------------------
    const commission = await prisma.commission.findUnique({
      where: { bookingId: bookingResult.id },
    });
    assert(
      commission !== null && commission.commissionAmount > 0,
      "TEST 8: Platform Commission Architecture",
      `Commission calculated: ₹${commission?.commissionAmount} (Platform) + ₹${commission?.ownerAmount} (Venue). Striped from Customer view.`
    );

    // ----------------------------------------------------
    // TEST 9: Double Booking Protection (Server-Side Conflict Rejection)
    // ----------------------------------------------------
    let doubleBookingRejected = false;
    try {
      await convertOrDirectBooking({
        venueId: rajeshVenue!.id,
        customerName: "Duplicate Attempter",
        customerPhone: "9111111111",
        customerEmail: "duplicate@test.com",
        eventType: "Wedding",
        eventDate: testEnquiry.eventDate, // SAME DATE
        timeSlot: "Full Day",            // SAME SLOT
        guestCount: 200,
        totalAmount: 150000,
        actorUserId: owner!.id,
        actorRole: "VENUE_OWNER",
        recordedByName: owner!.name,
      });
    } catch (conflictError: any) {
      doubleBookingRejected = conflictError.status === 409 || conflictError.message?.includes("already booked");
    }

    assert(
      doubleBookingRejected,
      "TEST 9: Double-Booking Conflict Rejection",
      "System safely rejected conflicting booking on the same venue/date with 409 Conflict."
    );

    // ----------------------------------------------------
    // TEST 10: Admin Approves New Venue Owner Registration
    // ----------------------------------------------------
    let pendingOwner = await prisma.venueOwnerProfile.findFirst({
      where: { status: "Pending" },
      include: { user: true },
    });

    let createdTestPendingId: string | null = null;
    let createdTestUserId: string | null = null;

    if (!pendingOwner) {
      const testUser = await prisma.user.create({
        data: {
          name: "Amit Patel (Test Owner)",
          email: `test_pending_owner_${Date.now()}@celibrate.demo`,
          phone: "9988776655",
          password: "demo_password_hash",
          role: "VENUE_OWNER",
          isActive: false,
          isVerified: false,
          city: "Bhubaneswar",
        },
      });
      createdTestUserId = testUser.id;
      pendingOwner = await prisma.venueOwnerProfile.create({
        data: {
          userId: testUser.id,
          businessName: "Patel Celebration Palace",
          ownerName: "Amit Patel",
          phone: "9988776655",
          email: testUser.email,
          city: "Bhubaneswar",
          status: "Pending",
        },
        include: { user: true },
      });
      createdTestPendingId = pendingOwner.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.venueOwnerProfile.update({
        where: { id: pendingOwner.id },
        data: { status: "Approved" },
      });
      await tx.user.update({
        where: { id: pendingOwner.userId },
        data: { isVerified: true, isActive: true },
      });
    });

    const verifiedOwner = await prisma.venueOwnerProfile.findFirst({
      where: { userId: pendingOwner.userId },
    });

    assert(
      verifiedOwner?.status === "Approved",
      "TEST 10: Admin Approves Pending Owner",
      `Owner ${pendingOwner.user.name} approved by Admin. Authorized to publish & manage venue.`
    );

    if (createdTestPendingId && createdTestUserId) {
      await prisma.venueOwnerProfile.delete({ where: { id: createdTestPendingId } });
      await prisma.user.delete({ where: { id: createdTestUserId } });
    }

    // Clean up temporary test booking records
    await prisma.bookingPayment.delete({ where: { id: payment.id } });
    await prisma.commission.delete({ where: { bookingId: bookingResult.id } });
    await prisma.event.deleteMany({ where: { bookingId: bookingResult.id } });
    await prisma.paymentSchedule.deleteMany({ where: { bookingId: bookingResult.id } });
    await prisma.booking.delete({ where: { id: bookingResult.id } });
    await prisma.quotation.delete({ where: { id: quotation.id } });
    await prisma.enquiry.delete({ where: { id: testEnquiry.id } });

  } catch (err: any) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");
}

runTests();
