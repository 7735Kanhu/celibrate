"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  TrendingUp,
  Building2,
  Users2,
  MessageSquareText,
  CalendarCheck2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("THIS_MONTH");

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${dateRange}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data?.topVenues) return;

    const headers = ["Venue Name", "Confirmed Bookings", "Gross Revenue (INR)"];
    const rows = data.topVenues.map((v: any) => [
      `"${v.name}"`,
      v.bookings,
      v.revenue,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Celibrate_Admin_Report_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {};
  const topVenues = data?.topVenues || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Analytics & Reports</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Platform performance metrics, conversion rates, commissions, and revenue analytics.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Date Filter Bar (Requirement 68) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-gray-400 mr-2 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Date Filter:
        </span>

        {[
          { id: "TODAY", label: "Today" },
          { id: "YESTERDAY", label: "Yesterday" },
          { id: "THIS_WEEK", label: "This Week" },
          { id: "THIS_MONTH", label: "This Month" },
          { id: "LAST_MONTH", label: "Last Month" },
          { id: "THIS_YEAR", label: "This Year" },
          { id: "ALL", label: "All Time" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setDateRange(f.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              dateRange === f.id
                ? "bg-brand-500 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Enquiries</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{summary.totalEnquiries || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Conversion: <span className="text-brand-600 font-bold">{summary.conversionRate}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Confirmed Bookings</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{summary.totalBookings || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Locked venue reservations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Booking Volume</span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            ₹{((summary.totalBookingValue || 0) / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Collected: ₹{((summary.totalCollected || 0) / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Platform Commission</span>
          <div className="text-2xl font-black text-brand-600 mt-1">
            ₹{Math.round(summary.platformRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Calculated via Commission Engine (5%)</div>
        </div>
      </div>

      {/* Top Venues Revenue Chart */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card">
        <h2 className="text-base font-bold text-gray-900 mb-1">Top Performing Venues by Revenue</h2>
        <p className="text-xs text-gray-500 mb-6">Venues generating highest volume of celebration bookings</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topVenues} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Gross Value"]} />
              <Bar dataKey="revenue" fill="#f43f5e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
