import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMongoUser extends Document {
  name: string;
  email: string;
  password: string; // bcrypt hashed password (phone number)
  phone?: string;
  role: string;
  city?: string;
  isActive: boolean;
  isVerified: boolean;
  prismaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MongoUserSchema = new Schema<IMongoUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true, index: true },
    role: { type: String, default: "CUSTOMER", enum: ["CUSTOMER", "VENUE_OWNER", "ADMIN"] },
    city: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    prismaId: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation error in Next.js HMR
export const MongoUser: Model<IMongoUser> =
  (mongoose.models && mongoose.models.User) ||
  mongoose.model<IMongoUser>("User", MongoUserSchema);
