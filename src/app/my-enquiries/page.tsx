import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, ChevronRight, FileText, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Enquiries | Celibrate",
};

export default async function MyEnquiriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4">
        <div className="container mx-auto max-w-lg text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your enquiries</h2>
          <p className="text-gray-500 text-sm mb-6">
            Log in with your email or phone number to track active venue quotations, site visits, and booking confirmations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="btn-primary py-2.5 px-6 text-sm">
              Sign In
            </Link>
            <Link href="/venues" className="btn-secondary py-2.5 px-6 text-sm">
              Explore Venues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If customer is logged in, link any matching enquiries by email or phone to this user
  try {
    const linkConditions: any[] = [];
    if (user.email) {
      linkConditions.push({ customerEmail: user.email.trim() });
      linkConditions.push({ customerEmail: user.email.trim().toLowerCase() });
    }
    if (user.phone) {
      linkConditions.push({ customerPhone: user.phone.trim() });
    }
    if (linkConditions.length > 0) {
      await prisma.enquiry.updateMany({
        where: {
          OR: linkConditions,
          userId: { not: user.id },
        },
        data: { userId: user.id },
      });
    }
  } catch (err) {
    console.warn("Auto-linking customer enquiries warning:", err);
  }

  const userConditions: any[] = [{ userId: user.id }];
  if (user.email) {
    userConditions.push({ customerEmail: user.email.trim() });
    userConditions.push({ customerEmail: user.email.trim().toLowerCase() });
  }
  if (user.phone) {
    userConditions.push({ customerPhone: user.phone.trim() });
  }
  const where = { OR: userConditions };

  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      venue: {
        include: {
          city: true,
          images: true,
        },
      },
    },
  });

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "BOOKED" || s === "CONFIRMED" || s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "QUOTATION_SENT" || s === "QUOTATION") return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "SITE_VISIT") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "CONTACTED" || s === "INTERESTED" || s === "NEGOTIATION" || s === "DISCUSSION") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "CANCELLED" || s === "LOST") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Enquiries</h1>
            <p className="text-gray-600">Track and manage your venue enquiries and bookings.</p>
          </div>
          <Link href="/venues" className="btn-primary py-2.5 px-5 text-sm whitespace-nowrap">
            Find New Venue
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm mt-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Enquiries Yet</h3>
            <p className="text-gray-500 mb-6">You haven't submitted any venue enquiries yet.</p>
            <Link href="/venues" className="btn-secondary">
              Explore Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Venue Image */}
                  <div className="w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden relative shrink-0 bg-gray-100">
                    <Image 
                      src={
                        enquiry.venue?.images?.find((img) => img.isPrimary)?.url ||
                        enquiry.venue?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800"
                      } 
                      alt={enquiry.venue?.name || "Venue"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{enquiry.enquiryNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusColor(enquiry.status)}`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{enquiry.venue.name}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(enquiry.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" /> {enquiry.venue.city?.name}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-brand-600">
                        <CheckCircle className="w-4 h-4" /> {enquiry.eventType}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(enquiry.eventDate)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" /> {enquiry.guestCount} Guests
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Budget: <span className="font-semibold text-gray-900">{enquiry.budget}</span>
                      </div>
                      <Link href={`/my-enquiries/${enquiry.id}`} className="text-brand-500 font-semibold text-sm hover:text-brand-600 flex items-center">
                        View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
