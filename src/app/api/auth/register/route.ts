import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        city: validatedData.city,
      },
    });

    // Also persist user to MongoDB
    try {
      const { syncUserToMongo } = await import("@/lib/mongodb");
      await syncUserToMongo({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        phone: user.phone,
        city: user.city,
        role: user.role,
        prismaId: user.id,
        isActive: user.isActive,
        isVerified: user.isVerified,
      });
    } catch (mongoErr: any) {
      console.warn("[MongoDB] Register sync warning:", mongoErr.message);
    }

    // Link any previous enquiries matching email or phone
    try {
      const linkConditions: any[] = [
        { customerEmail: user.email },
        { customerEmail: user.email.toLowerCase() },
      ];
      if (user.phone) {
        linkConditions.push({ customerPhone: user.phone });
      }
      await prisma.enquiry.updateMany({
        where: {
          OR: linkConditions,
          userId: { not: user.id },
        },
        data: { userId: user.id },
      });
    } catch (linkErr) {
      console.warn("Failed to relink enquiries on registration:", linkErr);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("celibrate_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        message: "Registration successful",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
