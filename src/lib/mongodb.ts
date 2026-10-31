import mongoose from "mongoose";

const DEFAULT_MONGODB_URI =
  "mongodb+srv://kanhu2551996_db_user:LthxR8gtqRyudVOq@cluster0.vrnc4eo.mongodb.net/celibrate?retryWrites=true&w=majority";

const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with connection reuse and caching across serverless invocations.
 */
export async function connectMongo(): Promise<typeof mongoose | null> {
  if (
    cached.conn &&
    cached.conn.connection.readyState === 1 &&
    cached.conn.connection.name === "celibrate"
  ) {
    return cached.conn;
  }

  // If connected to another database like 'test', disconnect and reconnect to 'celibrate'
  if (cached.conn && cached.conn.connection.name !== "celibrate") {
    try {
      await cached.conn.disconnect();
    } catch {}
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
      dbName: "celibrate",
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        const maskedUri = MONGODB_URI.includes("@")
          ? MONGODB_URI.replace(/:([^:@]+)@/, ":****@")
          : MONGODB_URI;
        console.log(`[MongoDB] Connected successfully to ${maskedUri} (Database: ${m.connection.name})`);
        return m;
      })
      .catch((err) => {
        console.warn(`[MongoDB] Connection failed: ${err.message}`);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err: any) {
    console.warn(`[MongoDB] Failed to resolve connection: ${err.message}`);
    cached.promise = null;
    return null;
  }
}

/**
 * Helper to safely sync or upsert a user into MongoDB.
 */
export async function syncUserToMongo(userData: {
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  role?: string;
  city?: string | null;
  prismaId?: string;
  isActive?: boolean;
  isVerified?: boolean;
}) {
  try {
    await connectMongo();
    const { MongoUser } = await import("@/models/MongoUser");
    const email = userData.email.toLowerCase().trim();

    const updateFields: any = {
      name: userData.name,
      email,
    };
    if (userData.password) updateFields.password = userData.password;
    if (userData.phone !== undefined) updateFields.phone = userData.phone;
    if (userData.city !== undefined) updateFields.city = userData.city;
    if (userData.role) updateFields.role = userData.role;
    if (userData.prismaId) updateFields.prismaId = userData.prismaId;
    if (userData.isActive !== undefined) updateFields.isActive = userData.isActive;
    if (userData.isVerified !== undefined) updateFields.isVerified = userData.isVerified;

    const saved = await MongoUser.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return saved;
  } catch (err: any) {
    console.warn("[MongoDB] syncUserToMongo warning:", err.message);
    return null;
  }
}

/**
 * Helper to safely sync or upsert an enquiry into MongoDB.
 */
export async function syncEnquiryToMongo(enquiryData: {
  enquiryNumber: string;
  userId?: string | null;
  prismaEnquiryId?: string;
  venueId: string;
  venueName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: Date | string;
  guestCount: number;
  preferredTime?: string | null;
  budget?: string | null;
  services?: string[];
  message?: string | null;
  status?: string;
  autoCreatedAccount?: boolean;
}) {
  try {
    await connectMongo();
    const { MongoEnquiry } = await import("@/models/MongoEnquiry");

    const updateFields: any = {
      enquiryNumber: enquiryData.enquiryNumber,
      venueId: enquiryData.venueId,
      customerName: enquiryData.customerName,
      customerPhone: enquiryData.customerPhone,
      customerEmail: enquiryData.customerEmail.toLowerCase().trim(),
      eventType: enquiryData.eventType,
      eventDate: new Date(enquiryData.eventDate),
      guestCount: enquiryData.guestCount,
      preferredTime: enquiryData.preferredTime || "Evening",
      budget: enquiryData.budget || "Not Specified",
      services: enquiryData.services || ["Venue"],
      message: enquiryData.message || "",
      status: enquiryData.status || "NEW",
    };

    if (enquiryData.userId) updateFields.userId = enquiryData.userId;
    if (enquiryData.prismaEnquiryId) updateFields.prismaEnquiryId = enquiryData.prismaEnquiryId;
    if (enquiryData.venueName) updateFields.venueName = enquiryData.venueName;
    if (enquiryData.autoCreatedAccount !== undefined) {
      updateFields.autoCreatedAccount = enquiryData.autoCreatedAccount;
    }

    const saved = await MongoEnquiry.findOneAndUpdate(
      { enquiryNumber: enquiryData.enquiryNumber },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return saved;
  } catch (err: any) {
    console.warn("[MongoDB] syncEnquiryToMongo warning:", err.message);
    return null;
  }
}

/**
 * Check MongoDB connection status.
 */
export async function getMongoStatus() {
  try {
    const conn = await connectMongo();
    if (!conn) {
      return { connected: false, state: "DISCONNECTED", uri: MONGODB_URI };
    }
    const stateMap = ["DISCONNECTED", "CONNECTED", "CONNECTING", "DISCONNECTING"];
    return {
      connected: conn.connection.readyState === 1,
      state: stateMap[conn.connection.readyState] || "UNKNOWN",
      database: conn.connection.name,
      host: conn.connection.host,
      port: conn.connection.port,
    };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}
