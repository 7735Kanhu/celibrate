import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, Phone, MapPin, Mail, LogOut, ChevronRight, Heart, MessageSquareText } from "lucide-react";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Profile | Celibrate",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  let userId = user?.id;

  // Fallback to demo user for demonstration if not logged in
  let displayUser = user;
  if (!userId) {
    const demoUser = await prisma.user.findUnique({
      where: { email: "customer@celibrate.demo" },
    });
    userId = demoUser?.id;
    if (demoUser) {
      displayUser = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        phone: demoUser.phone,
        city: demoUser.city,
        role: demoUser.role,
        createdAt: demoUser.createdAt
      } as any;
    }
  }

  const [enquiryCount, favoriteCount] = await Promise.all([
    prisma.enquiry.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
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
          </div>
        </div>
      </div>
    </div>
  );
}
