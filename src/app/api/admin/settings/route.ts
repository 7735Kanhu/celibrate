import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApi } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.platformSetting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: { settings, map: settingsMap },
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch settings" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateApi(["ADMIN"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const body = await request.json();
    const { settings } = body; // Array of { key, value, description } or object { key: value }

    if (Array.isArray(settings)) {
      for (const s of settings) {
        await prisma.platformSetting.upsert({
          where: { key: s.key },
          update: { value: String(s.value), description: s.description },
          create: { key: s.key, value: String(s.value), description: s.description },
        });
      }
    } else if (typeof settings === "object") {
      for (const [key, val] of Object.entries(settings)) {
        await prisma.platformSetting.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val) },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: auth.user!.id,
        userName: auth.user!.name,
        userRole: "ADMIN",
        action: "UPDATED_PLATFORM_SETTINGS",
        entity: "PlatformSetting",
        newValue: JSON.stringify(settings),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
    });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to update settings" } }, { status: 500 });
  }
}
