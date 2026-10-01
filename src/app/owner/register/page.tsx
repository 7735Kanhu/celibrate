"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, MapPin, Phone, Mail, Lock, User } from "lucide-react";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    phone: "",
    email: "",
    password: "",
    city: "Bhubaneswar",
    address: "",
    venueName: "",
    venueType: "Kalyan Mandap",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/owner-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error?.message || "Failed to submit application");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium">
              Your venue owner account has been submitted for verification.
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Our Celibrate admin team will review your business credentials and verify your venue details. Once approved, you can publish your venue, manage bookings, and receive enquiries.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Sign In to Check Status
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Partner With Celibrate
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
            Register Your Venue
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-xl mx-auto">
            Join Eastern India&apos;s fastest-growing celebration discovery network. Get high-intent customer enquiries and manage all quotations, visits, and bookings seamlessly.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Owner & Business Info */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                1. Owner & Business Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="ownerName"
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Royal Celebration Group"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="owner@business.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Account Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Venue Details */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                2. Primary Venue Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Venue Name *</label>
                  <input
                    name="venueName"
                    type="text"
                    required
                    value={formData.venueName}
                    onChange={handleChange}
                    placeholder="e.g. Royal Celebration Mandap"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Venue Type *</label>
                  <select
                    name="venueType"
                    value={formData.venueType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all bg-white"
                  >
                    <option value="Kalyan Mandap">Kalyan Mandap</option>
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Lawn">Lawn / Open Air Ground</option>
                    <option value="Convention Centre">Convention Centre</option>
                    <option value="Party Hall">Party Hall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bhubaneswar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Address *</label>
                  <input
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Plot / Street / Landmark"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 flex items-start gap-3 border border-gray-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Verification Process</p>
                <p className="mt-0.5">
                  Upon registration, your account status is set to <span className="font-bold text-amber-600">PENDING_APPROVAL</span>. You will be able to access your dashboard, configure packages, and preview your venue. The venue becomes publicly searchable once verified by Celibrate Admin.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-gray-500">
                Already registered as an owner?{" "}
                <Link href="/login" className="text-brand-600 font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Submitting Application..." : "Submit Venue for Verification"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
