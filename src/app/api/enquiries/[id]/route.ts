import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const enquiry = await prisma.enquiry.findFirst({
      where: {
        OR: [{ id: id }, { enquiryNumber: id }],
      },
      include: {
        venue: {
          include: {
            city: true,
            area: true,
            images: { where: { isPrimary: true } },
          },
        },
        services: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry });
  } catch (error: any) {
    console.error("GET /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiry detail" }, { status: 500 });
  }
}
