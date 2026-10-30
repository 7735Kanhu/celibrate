import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    const normalizedEmail = validatedData.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        ownerProfile: true,
      },
    });

    // Fallback: If user is not yet in Prisma, check MongoDB
    if (!user) {
      try {
        const { connectMongo } = await import("@/lib/mongodb");
        const { MongoUser } = await import("@/models/MongoUser");
        await connectMongo();
        const mongoUser = await MongoUser.findOne({ email: normalizedEmail });
        
        if (mongoUser) {
          // Sync user to Prisma
          user = await prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {
              password: mongoUser.password,
              phone: mongoUser.phone,
              name: mongoUser.name,
              role: mongoUser.role,
              isActive: mongoUser.isActive,
            },
            create: {
              email: normalizedEmail,
              password: mongoUser.password,
              name: mongoUser.name,
              phone: mongoUser.phone,
              role: mongoUser.role,
              isActive: mongoUser.isActive,
            },
            include: {
              ownerProfile: true,
            },
          });
        }
      } catch (fallbackErr: any) {
        console.warn("[Auth Login] Mongo fallback warning:", fallbackErr.message);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "ACCOUNT_INACTIVE", message: "Your account has been deactivated. Please contact Celibrate support." } },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
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

    // If customer, link any enquiries submitted with their email or phone
    if (user.role === "CUSTOMER") {
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
        console.warn("Failed to relink enquiries on login:", linkErr);
      }
    }

    let redirectTo = "/profile";
    if (user.role === "ADMIN") {
      redirectTo = "/admin/dashboard";
    } else if (user.role === "VENUE_OWNER") {
      redirectTo = "/owner/dashboard";
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
          phone: user.phone,
          ownerProfile: user.ownerProfile,
        },
        redirectTo,
      },
      message: "Logged in successfully",
    });
  } catch (error: any) {
    console.error("POST /api/auth/login error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Please check your input", details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong during login" } },
      { status: 500 }
    );
  }
}
