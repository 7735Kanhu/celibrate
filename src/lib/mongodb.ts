import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/celibrate";

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
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        const maskedUri = MONGODB_URI.includes("@")
          ? MONGODB_URI.replace(/:([^:@]+)@/, ":****@")
          : MONGODB_URI;
        console.log(`[MongoDB] Connected successfully to ${maskedUri}`);
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
