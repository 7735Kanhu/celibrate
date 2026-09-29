import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid 10-digit mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  city: z.string().optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const EnquirySchema = z.object({
  venueId: z.string().min(1, { message: "Please select a venue" }),
  customerName: z.string().min(2, { message: "Please enter your name" }),
  customerPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  customerEmail: z.string().email({ message: "Please enter a valid email address" }),
  eventType: z.string().min(1, { message: "Please select an event type" }),
  eventDate: z.string().min(1, { message: "Please select your preferred event date" }),
  guestCount: z.coerce.number().min(10, { message: "Guest count must be at least 10" }),
  preferredTime: z.string().optional(),
  budget: z.string().optional(),
  services: z.array(z.string()).optional(),
  message: z.string().optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(2, { message: "Please enter your full name" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export const ProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  city: z.string().optional(),
});
