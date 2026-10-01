import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const body = await request.json();
    const { status } = body; // APPROVED, REJECTED, SUSPENDED, PENDING_APPROVAL

    const profile = await prisma.venueOwnerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Venue Owner not found" } },
        { status: 404 }
      );
    }

    const isApproving = status === "APPROVED";
    const isSuspending = status === "SUSPENDED";

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const p = await tx.venueOwnerProfile.update({
        where: { id },
        data: {
          status,
          verifiedAt: isApproving ? new Date() : profile.verifiedAt,
        },
      });

      // Update associated user status
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          isActive: !isSuspending,
          isVerified: isApproving,
        },
      });

      // If approved, also approve the owner's pending venues
      if (isApproving) {
        await tx.venue.updateMany({
          where: { ownerId: profile.userId, status: "PENDING" },
          data: { status: "APPROVED", isVerified: true },
        });

        await tx.notification.create({
          data: {
            userId: profile.userId,
            role: "VENUE_OWNER",
            title: "Account Approved!",
            message: "Congratulations! Your Celibrate venue owner account has been verified and approved. You can now publish and manage your venues.",
            link: "/owner/dashboard",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: auth.user!.id,
          userName: auth.user!.name,
          userRole: "ADMIN",
          action: `OWNER_${status}`,
          entity: "VenueOwnerProfile",
          entityId: id,
          oldValue: profile.status,
          newValue: status,
        },
      });

      return p;
    });

    return NextResponse.json({
      success: true,
      data: { owner: updatedProfile },
      message: `Owner account has been set to ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/admin/owners/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update owner status" } },
      { status: 500 }
    );
  }
}
