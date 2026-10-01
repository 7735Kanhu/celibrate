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
    const status = searchParams.get("status");

    const where: any = {};

    if (currentUser.role === "VENUE_OWNER") {
      where.venue = { ownerId: currentUser.id };
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "ADMIN") {
      if (venueId && venueId !== "ALL") where.venueId = venueId;
    } else if (currentUser.role === "CUSTOMER") {
      where.customerId = currentUser.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            startingPrice: true,
            city: { select: { name: true } },
          },
        },
        items: true,
        enquiry: {
          select: { id: true, enquiryNumber: true, eventType: true, eventDate: true },
        },
        bookings: {
          select: { id: true, bookingNumber: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { quotations },
    });
  } catch (error) {
    console.error("GET /api/quotations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch quotations" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "VENUE_OWNER")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Admin and Venue Owners can create quotations" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      enquiryId,
      venueId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      guestCount,
      items,
      discount = 0,
      tax = 0,
      validUntil,
      terms,
      notes,
    } = body;

    if (!venueId || !customerName || !eventType || !eventDate || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Required quotation fields missing" } },
        { status: 400 }
      );
    }

    // Verify venue ownership if owner
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Venue not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You can only generate quotations for your own venue" } },
        { status: 403 }
      );
    }

    // Calculate subtotal from items
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const itemDisc = Number(item.discount) || 0;
      const itemTax = Number(item.tax) || 0;
      const itemTotal = qty * price - itemDisc + itemTax;
      subtotal += itemTotal;

      return {
        category: item.category || "Venue",
        name: item.name,
        quantity: qty,
        unitPrice: price,
        discount: itemDisc,
        tax: itemTax,
        total: itemTotal,
      };
    });

    const finalTotal = Math.max(0, subtotal - Number(discount) + Number(tax));

    // Quotation Number: QT-YYYYMM-RANDOM5
    const datePrefix = new Date().toISOString().slice(0, 7).replace("-", "");
    const count = await prisma.quotation.count();
    const quotationNumber = `QT-${datePrefix}-${10000 + count + 1}`;

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          enquiryId: enquiryId || null,
          customerId: customerId || null,
          venueId,
          customerName,
          customerPhone: customerPhone || null,
          customerEmail: customerEmail || null,
          eventType,
          eventDate: new Date(eventDate),
          guestCount: Number(guestCount) || 200,
          subtotal,
          discount: Number(discount),
          tax: Number(tax),
          total: finalTotal,
          status: "SENT",
          validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          terms: terms || "1. 25% Advance payment upon booking.\n2. Outside music allowed until 10 PM.\n3. Cancellation allowed up to 30 days prior.",
          notes: notes || "Thank you for considering our venue for your celebration!",
        },
      });

      for (const item of processedItems) {
        await tx.quotationItem.create({
          data: {
            quotationId: q.id,
            category: item.category,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax,
            total: item.total,
          },
        });
      }

      if (enquiryId) {
        await tx.enquiry.update({
          where: { id: enquiryId },
          data: { status: "QUOTATION_SENT" },
        });

        await tx.enquiryActivity.create({
          data: {
            enquiryId,
            type: "QUOTATION",
            note: `Generated quotation ${quotationNumber} for ₹${finalTotal.toLocaleString("en-IN")}`,
            userId: currentUser.id,
            userName: currentUser.name,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "CREATED_QUOTATION",
          entity: "Quotation",
          entityId: q.id,
          newValue: JSON.stringify({ quotationNumber, total: finalTotal }),
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      data: { quotation },
      message: `Quotation ${quotationNumber} created successfully!`,
    });
  } catch (error) {
    console.error("POST /api/quotations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create quotation" } },
      { status: 500 }
    );
  }
}
