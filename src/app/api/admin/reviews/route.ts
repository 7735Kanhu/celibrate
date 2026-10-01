import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (venueId && venueId !== "ALL") where.venueId = venueId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch reviews" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const body = await request.json();
    const { id, status } = body; // APPROVED, HIDDEN, FLAGGED

    const updated = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: { review: updated }, message: `Review marked as ${status}` });
  } catch (error) {
    console.error("PATCH /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update review" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "ID is required" } }, { status: 400 });

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to delete review" } }, { status: 500 });
  }
}
