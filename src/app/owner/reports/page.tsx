"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  IndianRupee,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  PieChart,
  Users,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
} from "lucide-react";

export default function OwnerReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("THIS_YEAR");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/reports");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const { summary, eventTypes } = data;
    const rows = [
      ["CELIBRATE VENUE OWNER FINANCIAL REPORT"],
      ["Generated At", new Date().toLocaleString()],
      [],
      ["METRIC", "VALUE (INR)"],
      ["Gross Booking Value", summary.grossBookingValue],
      ["Platform Commission", summary.platformCommission],
      ["Net Owner Amount", summary.netOwnerAmount],
      ["Advances Collected", summary.totalCollected],
      ["Pending Balance Due", summary.pendingPayments],
      ["Total Recorded Expenses", summary.totalExpenses],
      ["Estimated Net Profit", summary.estimatedNetProfit],
      ["Conversion Rate (%)", `${summary.conversionRate}%`],
      [],
      ["EVENT TYPE BREAKDOWN"],
      ["Event Category", "Confirmed Bookings", "Gross Revenue (INR)"],
      ...eventTypes.map((et: any) => [et.type, et.bookings, et.revenue]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e: any) => e.map((val: any) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Celibrate_Owner_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Generating analytics & financial reports...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const eventTypes = data?.eventTypes || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Financial Reports & Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gross booking values, platform commission deduction, internal expenses, and net venue profit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Breakdown Cards (Requirement 39 & 41) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Gross Booking Value</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{summary.grossBookingValue?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400">{summary.confirmedBookings} confirmed bookings</span>
        </div>

        {/* Platform Commission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Platform Commission (5%)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            -₹{summary.platformCommission?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400">Celibrate lead service fee</span>
        </div>

        {/* Net Owner Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Net Venue Share</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            ₹{summary.netOwnerAmount?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400">After commission deduction</span>
        </div>

        {/* Estimated Profit */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-emerald-100">Estimated Net Venue Profit</span>
          <div className="text-2xl font-black text-white mt-1">
            ₹{summary.estimatedNetProfit?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-emerald-100">After subtracting ₹{summary.totalExpenses?.toLocaleString("en-IN") || 0} costs</span>
        </div>
      </div>

      {/* Cash Flow Status: Advances vs Pending Due */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Advances Received</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            ₹{summary.totalCollected?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400">Through verified receipts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Pending Balances Due</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            ₹{summary.pendingPayments?.toLocaleString("en-IN") || 0}
          </div>
          <span className="text-[11px] text-slate-400">Scheduled before events</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Lead Conversion Rate</span>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {summary.conversionRate}%
          </div>
          <span className="text-[11px] text-slate-400">{summary.bookedEnquiries} booked of {summary.totalEnquiries} enquiries</span>
        </div>
      </div>

      {/* Event Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Event Category Performance</h2>
          <span className="text-xs text-slate-400">Bookings & revenue by celebration type</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Confirmed Bookings</th>
                <th className="py-3 px-4">Total Revenue (₹)</th>
                <th className="py-3 px-4">Est. Venue Share (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No booking events recorded yet.
                  </td>
                </tr>
              ) : (
                eventTypes.map((et: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{et.type}</td>
                    <td className="py-3.5 px-4 text-slate-600">{et.bookings} Events</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{et.revenue?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      ₹{Math.round(et.revenue * 0.95).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
