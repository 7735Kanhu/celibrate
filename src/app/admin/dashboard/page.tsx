"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users2,
  UserCheck,
  MessageSquareText,
  CalendarCheck2,
  Calendar,
  IndianRupee,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 rounded-2xl" />
          <div className="h-72 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyStats = data?.monthlyStats || [];
  const popularCategories = data?.popularCategories || [];
  const popularCities = data?.popularCities || [];
  const recentEnquiries = data?.recentEnquiries || [];
  const recentBookings = data?.recentBookings || [];

  const COLORS = ["#f43f5e", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Administrative Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time platform metrics, enquiries pipeline, confirmed bookings & revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.pendingOwners > 0 && (
            <Link
              href="/admin/owners?status=PENDING_APPROVAL"
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{stats.pendingOwners} Pending Owner Approvals</span>
            </Link>
          )}

          <Link
            href="/admin/reports"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Top Statistics Cards (Requirement 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Venues</span>
            <Building2 className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalVenues}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.pendingVenues > 0 ? (
              <span className="text-amber-600 font-semibold">{stats.pendingVenues} Pending</span>
            ) : (
              <span className="text-emerald-600 font-medium">All Approved</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Venue Owners</span>
            <Users2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalOwners}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.pendingOwners > 0 ? (
              <span className="text-amber-600 font-semibold">{stats.pendingOwners} To Verify</span>
            ) : (
              "Verified Partners"
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Customers</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {stats.totalCustomers?.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Active Accounts</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">New Enquiries</span>
            <MessageSquareText className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.newEnquiries}</div>
          <div className="text-[11px] text-gray-400 mt-1">{stats.activeEnquiries} In Pipeline</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Confirmed Bookings</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.confirmedBookings}</div>
          <div className="text-[11px] text-gray-400 mt-1">{stats.todayEvents} Today&apos;s Events</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Booking Value</span>
            <IndianRupee className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-600">
            ₹{(stats.totalBookingValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Fee (5%): ₹{Math.round(stats.platformCommission).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Charts Section (Requirement 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Bookings Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue & Booking Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly platform volume (May - Oct 2026)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-brand-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Revenue (₹)
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Bookings
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "revenue" ? `₹${Number(value).toLocaleString("en-IN")}` : value,
                    name === "revenue" ? "Revenue" : "Bookings",
                  ]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Event Categories */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Popular Event Categories</h2>
            <p className="text-xs text-gray-500 mt-0.5">Enquiry demand breakdown</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularCategories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {popularCategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
            {popularCategories.slice(0, 4).map((cat: any, i: number) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate text-gray-600">{cat.name}:</span>
                <span className="font-bold text-gray-900">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enquiries & Bookings Quick Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-bold text-gray-900">Recent Customer Enquiries</h2>
            </div>
            <Link href="/admin/enquiries" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View All ({stats.newEnquiries + stats.activeEnquiries})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No enquiries recorded yet.</div>
            ) : (
              recentEnquiries.map((enq: any) => (
                <div key={enq.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 truncate">{enq.customerName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{enq.enquiryNumber}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {enq.eventType} • {enq.venue?.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        enq.status === "NEW"
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : enq.status === "BOOKED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {enq.status}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(enq.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Confirmed Bookings */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Confirmed Bookings</h2>
            </div>
            <Link href="/admin/bookings" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              Manage Bookings ({stats.confirmedBookings})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No bookings created yet.</div>
            ) : (
              recentBookings.map((bk: any) => (
                <div key={bk.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 truncate">{bk.customerName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{bk.bookingNumber}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {bk.venue?.name} • {new Date(bk.eventDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-gray-900">
                      ₹{bk.totalAmount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Paid: ₹{bk.paidAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
