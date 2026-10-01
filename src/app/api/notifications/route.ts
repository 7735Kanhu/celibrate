import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: true, data: { notifications: [], unreadCount: 0 } });
    }

    const where: any = {
      OR: [
        { role: currentUser.role },
        { userId: currentUser.id },
      ],
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch notifications" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [{ role: currentUser.role }, { userId: currentUser.id }],
        },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true, message: "Notifications updated" });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update notifications" } }, { status: 500 });
  }
}
