import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "celibrate-super-secret-jwt-key-2026";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "VENUE_OWNER" | "ADMIN" | string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("celibrate_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        ownerProfile: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            phone: true,
            email: true,
            city: true,
            address: true,
            status: true,
            verifiedAt: true,
          },
        },
        venues: {
          where: { isArchived: false },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            type: true,
            city: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    if (allowedRoles?.includes("ADMIN")) {
      redirect("/admin/login");
    } else {
      redirect("/login");
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "ADMIN") {
        redirect("/admin/dashboard");
      } else if (user.role === "VENUE_OWNER") {
        redirect("/owner/dashboard");
      } else {
        redirect("/profile");
      }
    }
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth(["ADMIN"]);
  return user;
}

export async function requireOwner() {
  const user = await requireAuth(["VENUE_OWNER", "ADMIN"]);
  return user;
}

export async function requireCustomer() {
  const user = await requireAuth(["CUSTOMER", "ADMIN"]);
  return user;
}

// API Authentication Helper
export async function authenticateApi(allowedRoles?: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authenticated: false,
      user: null,
      errorResponse: Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      authenticated: false,
      user,
      errorResponse: Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to perform this action" } },
        { status: 403 }
      ),
    };
  }

  return { authenticated: true, user, errorResponse: null };
}

// Helper to check venue ownership
export function canManageVenue(user: { id: string; role: string }, venueOwnerId: string | null | undefined): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "VENUE_OWNER" && venueOwnerId === user.id) return true;
  return false;
}
