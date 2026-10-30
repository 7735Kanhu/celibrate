import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { User, Phone, MapPin, Mail, LogOut, ChevronRight, Heart, MessageSquareText, FileText, Calendar, CheckCircle } from "lucide-react";
import ProfileClient from "./ProfileClient";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Profile | Celibrate",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // If customer is logged in, link any matching enquiries by email or phone to this user
  if (user?.id) {
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
      console.warn("Auto-linking customer enquiries warning in profile:", err);
    }
  }

  // Fallback to demo user for demonstration if not logged in
  let displayUser = user;
  if (!displayUser) {
    const demoUser = await prisma.user.findUnique({
      where: { email: "customer@celibrate.demo" },
    });
    if (demoUser) {
      displayUser = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        phone: demoUser.phone,
        city: demoUser.city,
        role: demoUser.role,
        createdAt: demoUser.createdAt,
      } as any;
    }
  }

  const enquiryConditions: any[] = [];
  if (displayUser?.id) enquiryConditions.push({ userId: displayUser.id });
  if (displayUser?.email) {
    enquiryConditions.push({ customerEmail: displayUser.email.trim() });
    enquiryConditions.push({ customerEmail: displayUser.email.trim().toLowerCase() });
  }
  if (displayUser?.phone) {
    enquiryConditions.push({ customerPhone: displayUser.phone.trim() });
  }
  const enquiryWhere = enquiryConditions.length > 0 ? { OR: enquiryConditions } : { userId: "none" };

  const [enquiryCount, favoriteCount, recentEnquiries] = await Promise.all([
    prisma.enquiry.count({ where: enquiryWhere }),
    displayUser?.id ? prisma.favorite.count({ where: { userId: displayUser.id } }) : 0,
    prisma.enquiry.findMany({
      where: enquiryWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        venue: {
          include: {
            city: true,
            images: true,
          },
        },
      },
    }),
  ]);

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-soft">
                {displayUser.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{displayUser.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{displayUser.email}</p>
              <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-6">
                <MapPin className="w-4 h-4" /> {displayUser.city || "Add your city"}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <Link href="/my-enquiries" className="bg-gray-50 p-3 rounded-xl hover:bg-brand-50 transition-colors group">
                  <span className="block font-bold text-xl text-gray-900 group-hover:text-brand-600">{enquiryCount}</span>
                  <span className="text-xs text-gray-500 font-medium">Enquiries</span>
                </Link>
                <Link href="/favorites" className="bg-gray-50 p-3 rounded-xl hover:bg-brand-50 transition-colors group">
                  <span className="block font-bold text-xl text-gray-900 group-hover:text-brand-600">{favoriteCount}</span>
                  <span className="text-xs text-gray-500 font-medium">Favorites</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/my-enquiries" className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <MessageSquareText className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium text-gray-700">My Enquiries</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              <Link href="/favorites" className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-brand-500" />
                  </div>
                  <span className="font-medium text-gray-700">Favorites</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <ProfileClient />
            </div>
          </div>

          {/* Right Content - Personal Info Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" defaultValue={displayUser.name} className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" defaultValue={displayUser.email} disabled className="input-field pl-11 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" defaultValue={displayUser.phone || ""} className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" defaultValue={displayUser.city || ""} className="input-field pl-11" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="button" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* My Enquiries in Customer Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Enquiries</h2>
                    <p className="text-xs text-gray-500">Track and view your venue inquiries and quotation status</p>
                  </div>
                </div>
                <Link
                  href="/my-enquiries"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
                >
                  View All ({enquiryCount}) <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentEnquiries.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-soft border border-gray-100 text-gray-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">No enquiries submitted yet</h3>
                  <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                    Browse verified venues in your city and request quotes with custom guest capacity and budget.
                  </p>
                  <Link href="/venues" className="btn-primary text-xs py-2 px-5">
                    Explore Venues
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEnquiries.map((enq) => {
                    const statusColor = (status: string) => {
                      const s = status?.toUpperCase();
                      if (s === "BOOKED" || s === "CONFIRMED" || s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
                      if (s === "QUOTATION_SENT" || s === "QUOTATION") return "bg-purple-50 text-purple-700 border-purple-200";
                      if (s === "SITE_VISIT") return "bg-amber-50 text-amber-700 border-amber-200";
                      if (s === "CONTACTED" || s === "INTERESTED" || s === "NEGOTIATION" || s === "DISCUSSION") return "bg-blue-50 text-blue-700 border-blue-200";
                      if (s === "CANCELLED" || s === "LOST") return "bg-rose-50 text-rose-700 border-rose-200";
                      return "bg-slate-100 text-slate-700 border-slate-200";
                    };

                    const venueImageUrl =
                      enq.venue?.images?.find((img) => img.isPrimary)?.url ||
                      enq.venue?.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800";

                    return (
                      <div
                        key={enq.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-gray-100 border border-gray-100">
                            <Image
                              src={venueImageUrl}
                              alt={enq.venue?.name || "Venue"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{enq.enquiryNumber}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${statusColor(enq.status)}`}>
                                {enq.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base">{enq.venue?.name || "Selected Venue"}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                              <span className="font-medium text-brand-600">{enq.eventType}</span>
                              <span>•</span>
                              <span>{formatDate(enq.eventDate)}</span>
                              <span>•</span>
                              <span>{enq.guestCount} Guests</span>
                              {enq.venue?.city?.name && (
                                <>
                                  <span>•</span>
                                  <span>{enq.venue.city.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                          <Link
                            href={`/my-enquiries/${enq.id}`}
                            className="text-xs font-semibold px-3.5 py-2 bg-gray-100 hover:bg-brand-500 hover:text-white text-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            View Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
