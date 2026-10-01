import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const entity = searchParams.get("entity");
    const limit = Number(searchParams.get("limit")) || 50;

    const where: any = {};
    if (entity && entity !== "ALL") {
      where.entity = entity;
    }
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { userName: { contains: search } },
        { entityId: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    console.error("GET /api/admin/audit-logs error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch audit logs" } }, { status: 500 });
  }
}
