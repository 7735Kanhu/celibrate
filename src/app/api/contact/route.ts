import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ContactSchema.parse(body);

    const contactMessage = await prisma.contactMessage.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our team will contact you shortly.",
      contactId: contactMessage.id,
    });
  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to send contact message" }, { status: 500 });
  }
}
