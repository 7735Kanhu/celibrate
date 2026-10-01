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

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase().trim() },
      include: {
        ownerProfile: true,
      },
    });

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
