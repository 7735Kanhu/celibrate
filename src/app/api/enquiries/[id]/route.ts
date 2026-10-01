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

    const enquiry = await prisma.enquiry.findFirst({
      where: {
        OR: [{ id }, { enquiryNumber: id }],
      },
      include: {
        venue: {
          include: {
            city: true,
            area: true,
            images: true,
          },
        },
        services: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        followUps: { orderBy: { date: "asc" } },
        siteVisits: { orderBy: { date: "asc" } },
        quotations: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        booking: {
          include: { payments: true, schedules: true, eventDetails: true },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Enquiry not found" } },
        { status: 404 }
      );
    }

    // Role Permission Check (Requirement 55)
    if (currentUser) {
      if (currentUser.role === "CUSTOMER" && enquiry.userId && enquiry.userId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 }
        );
      }
      if (currentUser.role === "VENUE_OWNER" && enquiry.venue.ownerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied: This enquiry belongs to another venue owner." } },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: { enquiry } });
  } catch (error: any) {
    console.error("GET /api/enquiries/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch enquiry detail" } },
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
        { success: false, error: { code: "FORBIDDEN", message: "Only Admin and Venue Owners can update enquiry status" } },
        { status: 403 }
      );
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Enquiry not found" } },
        { status: 404 }
      );
    }

    if (currentUser.role === "VENUE_OWNER" && enquiry.venue.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access to this venue enquiry" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, activityType, activityNote, followUp, siteVisit } = body;

    const result = await prisma.$transaction(async (tx) => {
      let updatedEnquiry = enquiry;

      // 1. Update Status if changed
      if (status && status !== enquiry.status) {
        updatedEnquiry = await tx.enquiry.update({
          where: { id },
          data: { status },
          include: { venue: true },
        });

        await tx.enquiryStatusHistory.create({
          data: {
            enquiryId: id,
            status,
            note: activityNote || `Status updated to ${status} by ${currentUser.name}`,
          },
        });

        await tx.enquiryActivity.create({
          data: {
            enquiryId: id,
            type: "STATUS_CHANGE",
            note: `Status changed from ${enquiry.status} to ${status}`,
            userId: currentUser.id,
            userName: currentUser.name,
          },
        });
      }

      // 2. Add Activity Note if provided (e.g. Call, WhatsApp, Meeting)
      if (activityType && activityNote) {
        await tx.enquiryActivity.create({
          data: {
            enquiryId: id,
            type: activityType,
            note: activityNote,
            userId: currentUser.id,
            userName: currentUser.name,
          },
        });
      }

      // 3. Schedule Follow-up
      if (followUp) {
        await tx.enquiryFollowUp.create({
          data: {
            enquiryId: id,
            customerId: enquiry.userId,
            venueId: enquiry.venueId,
            customerName: enquiry.customerName,
            date: new Date(followUp.date),
            time: followUp.time || "11:00 AM",
            assignedToId: currentUser.id,
            assignedToName: currentUser.name,
            note: followUp.note || "Follow up regarding venue requirements",
            status: "Pending",
          },
        });

        await tx.enquiryActivity.create({
          data: {
            enquiryId: id,
            type: "NOTE",
            note: `Scheduled follow-up on ${new Date(followUp.date).toLocaleDateString()} at ${followUp.time}: ${followUp.note}`,
            userId: currentUser.id,
            userName: currentUser.name,
          },
        });
      }

      // 4. Schedule Site Visit
      if (siteVisit) {
        await tx.siteVisit.create({
          data: {
            enquiryId: id,
            customerId: enquiry.userId,
            venueId: enquiry.venueId,
            customerName: enquiry.customerName,
            date: new Date(siteVisit.date),
            time: siteVisit.time || "04:00 PM",
            assignedToName: currentUser.name,
            notes: siteVisit.notes || "Customer site visit inspection",
            status: "SCHEDULED",
          },
        });

        await tx.enquiryActivity.create({
          data: {
            enquiryId: id,
            type: "SITE_VISIT",
            note: `Scheduled site visit on ${new Date(siteVisit.date).toLocaleDateString()} at ${siteVisit.time}`,
            userId: currentUser.id,
            userName: currentUser.name,
          },
        });
      }

      return updatedEnquiry;
    });

    return NextResponse.json({
      success: true,
      data: { enquiry: result },
      message: "Enquiry updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/enquiries/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update enquiry" } },
      { status: 500 }
    );
  }
}
