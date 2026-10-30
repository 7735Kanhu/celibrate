import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EnquirySchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/mongodb";
import { MongoUser } from "@/models/MongoUser";
import { MongoEnquiry } from "@/models/MongoEnquiry";
import { sendEnquiryConfirmationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = EnquirySchema.parse(body);

    const currentUser = await getCurrentUser();

    // Normalize customer credentials
    const normalizedEmail = validatedData.customerEmail.toLowerCase().trim();
    const customerPhone = validatedData.customerPhone.trim();
    const customerName = validatedData.customerName.trim();

    // Generate unique enquiry number: ENQ-YYYYMM-RANDOM5
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const enquiryNumber = `ENQ-${yearMonth}-${randomDigits}`;

    // Verify venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: validatedData.venueId },
      include: { owner: true },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Selected venue not found" } },
        { status: 404 }
      );
    }

    // Auto-create or update customer account:
    // Email is Login ID, and Password is Phone Number.
    // If the same email is already present, only the password is replaced with the new phone number.
    const hashedPassword = await bcrypt.hash(customerPhone, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let assignedUserId: string;
    let isNewAccount = false;

    if (existingUser) {
      // Existing user: replace password with phone number
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          phone: customerPhone,
        },
      });
      assignedUserId = existingUser.id;
      isNewAccount = false;
      console.log(`[Account] Updated password for existing customer: ${normalizedEmail}`);
    } else {
      // New user: auto-create account with email and phone number as password
      const newUser = await prisma.user.create({
        data: {
          name: customerName,
          email: normalizedEmail,
          password: hashedPassword,
          phone: customerPhone,
          role: "CUSTOMER",
          isActive: true,
          isVerified: true,
        },
      });
      assignedUserId = newUser.id;
      isNewAccount = true;
      console.log(`[Account] Created new customer account for: ${normalizedEmail}`);
    }

    // Also persist / sync user to MongoDB
    try {
      await connectMongo();
      await MongoUser.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            name: customerName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: customerPhone,
            role: existingUser?.role || "CUSTOMER",
            prismaId: assignedUserId,
            isActive: true,
            isVerified: true,
          },
        },
        { upsert: true, new: true }
      );
    } catch (mongoErr: any) {
      console.warn("[MongoDB] User sync warning:", mongoErr.message);
    }

    // Create Enquiry in Prisma
    const targetUserId =
      currentUser && currentUser.role === "CUSTOMER"
        ? currentUser.id
        : assignedUserId;

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        userId: targetUserId,
        venueId: venue.id,
        customerName,
        customerPhone,
        customerEmail: normalizedEmail,
        eventType: validatedData.eventType,
        eventDate: new Date(validatedData.eventDate),
        guestCount: validatedData.guestCount,
        preferredTime: validatedData.preferredTime || "Evening",
        budget: validatedData.budget || "Not Specified",
        message: validatedData.message || null,
        status: "NEW",
      },
    });

    // Save requested services if any
    const services =
      validatedData.services && validatedData.services.length > 0
        ? validatedData.services
        : ["Venue"];

    for (const serviceName of services) {
      await prisma.enquiryService.create({
        data: {
          enquiryId: enquiry.id,
          serviceName,
        },
      });
    }

    // Persist Enquiry to MongoDB
    try {
      await connectMongo();
      await MongoEnquiry.create({
        enquiryNumber,
        userId: assignedUserId,
        prismaEnquiryId: enquiry.id,
        venueId: venue.id,
        venueName: venue.name,
        customerName,
        customerPhone,
        customerEmail: normalizedEmail,
        eventType: validatedData.eventType,
        eventDate: new Date(validatedData.eventDate),
        guestCount: validatedData.guestCount,
        preferredTime: validatedData.preferredTime || "Evening",
        budget: validatedData.budget || "Not Specified",
        services,
        message: validatedData.message || "",
        status: "NEW",
        autoCreatedAccount: isNewAccount,
      });
      console.log(`[MongoDB] Enquiry ${enquiryNumber} stored in MongoDB`);
    } catch (mongoErr: any) {
      console.warn("[MongoDB] Enquiry save warning:", mongoErr.message);
    }

    // Create Initial Status History & Activity Log
    await prisma.enquiryStatusHistory.create({
      data: {
        enquiryId: enquiry.id,
        status: "NEW",
        note: isNewAccount
          ? "Enquiry submitted by new customer (account auto-created with phone number password)"
          : "Enquiry submitted by customer (account password refreshed)",
      },
    });

    await prisma.enquiryActivity.create({
      data: {
        enquiryId: enquiry.id,
        type: "STATUS_CHANGE",
        note: `Enquiry submitted by customer ${customerName}`,
        userId: assignedUserId,
        userName: customerName,
      },
    });

    // Notify Venue Owner
    if (venue.ownerId) {
      await prisma.notification.create({
        data: {
          userId: venue.ownerId,
          role: "VENUE_OWNER",
          title: "New Enquiry Received!",
          message: `New ${validatedData.eventType} enquiry (${enquiryNumber}) for ${venue.name} from ${customerName}.`,
          link: `/owner/enquiries/${enquiry.id}`,
        },
      });
    }

    // Notify Platform Admin
    await prisma.notification.create({
      data: {
        role: "ADMIN",
        title: "New Customer Enquiry",
        message: `Enquiry ${enquiryNumber} submitted for ${venue.name} by ${customerName}.`,
        link: `/admin/enquiries?search=${enquiryNumber}`,
      },
    });

    // Send email with enquiry details and login credentials
    try {
      await sendEnquiryConfirmationEmail({
        customerName,
        customerEmail: normalizedEmail,
        customerPhone,
        enquiryNumber: enquiry.enquiryNumber,
        venueName: venue.name,
        eventType: validatedData.eventType,
        eventDate: validatedData.eventDate,
        guestCount: validatedData.guestCount,
        preferredTime: validatedData.preferredTime || "Evening",
        budget: validatedData.budget || "Not Specified",
        services,
        message: validatedData.message || null,
        isNewAccount,
      });
    } catch (mailErr: any) {
      console.warn("[Mail] Error sending confirmation email:", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      enquiryNumber: enquiry.enquiryNumber, // backwards compatibility
      data: {
        enquiryId: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber,
        customerEmail: normalizedEmail,
        customerPhone,
        isNewAccount,
      },
      message: isNewAccount
        ? "Enquiry submitted successfully! A customer account was created for you with your email as ID and phone number as password."
        : "Enquiry submitted successfully! Your account password has been updated to your phone number.",
    });
  } catch (error: any) {
    console.error("POST /api/enquiries error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Please check your input", details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit enquiry" } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");
    const search = searchParams.get("search");

    const andConditions: any[] = [];

    // Role-based data scoping (Requirement 55)
    if (!currentUser) {
      // If unauthenticated, fallback to demo customer enquiry
      const demoUser = await prisma.user.findUnique({ where: { email: "customer@celibrate.demo" } });
      if (demoUser) {
        andConditions.push({
          OR: [
            { userId: demoUser.id },
            { customerEmail: demoUser.email },
          ],
        });
      } else {
        return NextResponse.json({ success: true, data: { enquiries: [] } });
      }
    } else if (currentUser.role === "CUSTOMER") {
      // Customer sees ONLY their own enquiries (by userId, email, or phone)
      const userConditions: any[] = [{ userId: currentUser.id }];
      if (currentUser.email) {
        userConditions.push({ customerEmail: currentUser.email.trim() });
        userConditions.push({ customerEmail: currentUser.email.trim().toLowerCase() });
      }
      if (currentUser.phone) {
        userConditions.push({ customerPhone: currentUser.phone.trim() });
      }
      andConditions.push({ OR: userConditions });
    } else if (currentUser.role === "VENUE_OWNER") {
      // Owner sees ONLY enquiries for venues they own
      andConditions.push({ venue: { ownerId: currentUser.id } });
      if (venueId && venueId !== "ALL") {
        andConditions.push({ venueId });
      }
    } else if (currentUser.role === "ADMIN") {
      // Admin sees all enquiries
      if (venueId && venueId !== "ALL") {
        andConditions.push({ venueId });
      }
    }

    if (status && status !== "ALL") {
      andConditions.push({ status });
    }

    if (search) {
      andConditions.push({
        OR: [
          { enquiryNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
          { customerEmail: { contains: search } },
          { venue: { name: { contains: search } } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            city: { select: { name: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        services: true,
        quotations: {
          select: { id: true, quotationNumber: true, total: true, status: true },
        },
        booking: {
          select: { id: true, bookingNumber: true, status: true, totalAmount: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { enquiries },
    });
  } catch (error: any) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch enquiries" } },
      { status: 500 }
    );
  }
}
