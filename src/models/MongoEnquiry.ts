import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMongoEnquiry extends Document {
  enquiryNumber: string;
  userId?: string;
  prismaEnquiryId?: string;
  venueId: string;
  venueName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  preferredTime?: string;
  budget?: string;
  services: string[];
  message?: string;
  status: string;
  autoCreatedAccount: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MongoEnquirySchema = new Schema<IMongoEnquiry>(
  {
    enquiryNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    prismaEnquiryId: { type: String, index: true },
    venueId: { type: String, required: true, index: true },
    venueName: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
    guestCount: { type: Number, required: true },
    preferredTime: { type: String, default: "Evening" },
    budget: { type: String, default: "Not Specified" },
    services: [{ type: String }],
    message: { type: String, default: "" },
    status: {
      type: String,
      default: "NEW",
      enum: [
        "NEW",
        "CONTACTED",
        "INTERESTED",
        "SITE_VISIT",
        "QUOTATION_SENT",
        "NEGOTIATION",
        "ADVANCE_PENDING",
        "BOOKED",
        "COMPLETED",
        "CANCELLED",
        "LOST",
      ],
      index: true,
    },
    autoCreatedAccount: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const MongoEnquiry: Model<IMongoEnquiry> =
  (mongoose.models && mongoose.models.Enquiry) ||
  mongoose.model<IMongoEnquiry>("Enquiry", MongoEnquirySchema);
