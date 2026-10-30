import { NextResponse } from "next/server";
import { connectMongo, getMongoStatus } from "@/lib/mongodb";
import { MongoUser } from "@/models/MongoUser";
import { MongoEnquiry } from "@/models/MongoEnquiry";

export async function GET() {
  try {
    const status = await getMongoStatus();
    
    if (!status.connected) {
      return NextResponse.json({
        success: false,
        message: "MongoDB is not connected",
        status,
      }, { status: 503 });
    }

    await connectMongo();
    const [userCount, enquiryCount, recentEnquiries] = await Promise.all([
      MongoUser.countDocuments(),
      MongoEnquiry.countDocuments(),
      MongoEnquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      status,
      stats: {
        totalUsers: userCount,
        totalEnquiries: enquiryCount,
        recentEnquiries: recentEnquiries.map((e: any) => ({
          enquiryNumber: e.enquiryNumber,
          customerName: e.customerName,
          customerEmail: e.customerEmail,
          customerPhone: e.customerPhone,
          venueName: e.venueName,
          eventType: e.eventType,
          status: e.status,
          createdAt: e.createdAt,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
