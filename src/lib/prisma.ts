import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

let dbUrl = "file:./dev.db";

if (process.env.NODE_ENV === "production") {
  // Vercel serverless functions have a read-only filesystem.
  // SQLite needs to write lock/journal files even for read queries.
  // Copy the seeded database to the writable /tmp directory.
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const tmpPath = "/tmp/dev.db";
  
  try {
    if (fs.existsSync(dbPath)) {
      if (!fs.existsSync(tmpPath)) {
        fs.copyFileSync(dbPath, tmpPath);
      }
      dbUrl = "file:/tmp/dev.db";
    }
  } catch (error) {
    console.error("Failed to copy SQLite database to /tmp", error);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
