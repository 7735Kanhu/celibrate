"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  CalendarCheck,
  Calendar,
  Clock,
  IndianRupee,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  const fetchOwnerDashboard = async () => {
    try {
      const res = await fetch("/api/owner/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load owner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const currentVenue = data?.currentVenue;
  const todayFollowUps = data?.todayFollowUps || [];
  const upcomingBookings = data?.upcomingBookings || [];
  const recentEnquiries = data?.recentEnquiries || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
              Venue Owner Console
            </span>
            <span className="text-xs text-gray-400 font-medium">• {currentVenue?.name || "My Venue"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Venue Operations & Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time enquiries, follow-up schedules, and confirmed event reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/owner/quotations"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border border-gray-200 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>New Quotation</span>
          </Link>

          <Link
            href="/owner/calendar"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Event Calendar</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards (Requirement 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Enquiries</span>
            <MessageSquareText className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.newEnquiries}</div>
          <div className="text-[11px] text-gray-400 mt-1">Leads awaiting contact</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Follow Ups</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{stats.pendingFollowUps}</div>
          <div className="text-[11px] text-gray-400 mt-1">Pending today</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.upcomingEvents}</div>
          <div className="text-[11px] text-gray-400 mt-1">Next 60 days</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.confirmedBookings}</div>
          <div className="text-[11px] text-gray-400 mt-1">Locked dates</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Booking Value</span>
            <IndianRupee className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-600">
            ₹{(stats.monthlyBookingValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-gray-400 mt-1">This month&apos;s value</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Dues</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            ₹{(stats.pendingPayments / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Customer balances</div>
        </div>
      </div>

      {/* Main Grid: Today's Follow-ups (Req 22) + Upcoming Events Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups (Requirement 22) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Today&apos;s Follow-ups
              </h2>
              <p className="text-[11px] text-gray-500">Scheduled client calls and requirement discussions</p>
            </div>
            <Link href="/owner/enquiries" className="text-xs text-brand-600 font-semibold hover:underline">
              View All Enquiries →
            </Link>
          </div>

          <div className="divide-y divide-gray-50 text-xs">
            {todayFollowUps.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No follow-ups scheduled for today.</div>
            ) : (
              todayFollowUps.map((f: any) => (
                <div key={f.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {f.time}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{f.customerName}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{f.note}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Confirmed Events */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Upcoming Confirmed Events
              </h2>
              <p className="text-[11px] text-gray-500">Upcoming celebrations hosted at your venue</p>
            </div>
            <Link href="/owner/calendar" className="text-xs text-brand-600 font-semibold hover:underline">
              Full Calendar →
            </Link>
          </div>

          <div className="divide-y divide-gray-50 text-xs">
            {upcomingBookings.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No upcoming events scheduled.</div>
            ) : (
              upcomingBookings.map((bk: any) => (
                <div key={bk.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{bk.customerName}</div>
                    <div className="text-[11px] text-gray-500">
                      {bk.eventType} • {new Date(bk.eventDate).toLocaleDateString()} ({bk.timeSlot})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-gray-900">₹{bk.totalAmount.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      Paid: ₹{bk.paidAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Enquiries List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-rose-500" />
              Latest Inbound Customer Leads
            </h2>
            <p className="text-[11px] text-gray-500">Customers seeking availability for your venue</p>
          </div>
          <Link href="/owner/enquiries" className="text-xs font-semibold text-brand-600 hover:underline">
            Manage Pipeline →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentEnquiries.map((enq: any) => (
            <Link
              key={enq.id}
              href={`/owner/enquiries/${enq.id}`}
              className="p-4 rounded-2xl bg-gray-50/70 hover:bg-brand-50/50 border border-gray-100 hover:border-brand-200 transition-all space-y-2 block"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-gray-400 font-medium">{enq.enquiryNumber}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600">
                  {enq.status}
                </span>
              </div>
              <div className="font-bold text-gray-900 text-xs">{enq.customerName}</div>
              <div className="text-[11px] text-gray-500">
                {enq.eventType} • {new Date(enq.eventDate).toLocaleDateString()}
              </div>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 flex justify-between">
                <span>{enq.guestCount} guests</span>
                <span className="text-brand-600 font-semibold">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
