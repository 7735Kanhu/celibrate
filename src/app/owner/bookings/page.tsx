"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  IndianRupee,
  Clock,
  MapPin,
  Users,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paying, setPaying] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success && json.data?.bookings) {
        setBookings(json.data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForPayment || !paymentAmount || Number(paymentAmount) <= 0) return;

    try {
      setPaying(true);
      const res = await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForPayment.id,
          amount: Number(paymentAmount),
          paymentMethod,
          referenceNumber: paymentRef,
          notes: paymentNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowPaymentModal(false);
        setPaymentAmount("");
        setPaymentRef("");
        setPaymentNotes("");
        fetchBookings();
      } else {
        alert(json.error?.message || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Payment submission failed");
    } finally {
      setPaying(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone?.includes(search) ||
      b.venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingDue = totalRevenue - totalPaid;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Confirmed Venue Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal verified bookings, payment schedules, and operational logistics for your venue
          </p>
        </div>
        <Link
          href="/owner/calendar"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <Calendar className="w-4 h-4 text-rose-500" />
          View Booking Calendar
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Booking Value</span>
          <div className="text-xl font-black text-slate-800 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <span className="text-[11px] text-slate-400">{bookings.length} confirmed celebrations</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Advances Collected</span>
          <div className="text-xl font-black text-emerald-600 mt-1">₹{totalPaid.toLocaleString("en-IN")}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Recorded through verified receipts</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Pending Balance Due</span>
          <div className="text-xl font-black text-amber-600 mt-1">₹{pendingDue.toLocaleString("en-IN")}</div>
          <span className="text-[11px] text-slate-400">Scheduled before event dates</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings by ID, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "CONFIRMED", "UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-rose-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No bookings found. Convert enquiries to bookings from the enquiry pipeline.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Booking #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event Date & Slot</th>
                  <th className="py-3 px-4">Venue & Type</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Booking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map((b) => {
                  const balance = (b.totalAmount || 0) - (b.paidAmount || 0);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.customerName}</div>
                        <div className="text-[11px] text-slate-400">{b.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          {new Date(b.eventDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.timeSlot || "Full Day"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.venue?.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.eventType} ({b.guestCount} guests)
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">₹{b.paidAmount?.toLocaleString("en-IN")}</div>
                        <div className="text-[10px] text-slate-400">
                          of ₹{b.totalAmount?.toLocaleString("en-IN")}{" "}
                          {balance > 0 ? (
                            <span className="text-amber-600 font-semibold">(Due: ₹{balance.toLocaleString("en-IN")})</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">✓ Fully Paid</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === "CONFIRMED" || b.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {balance > 0 && (
                            <button
                              onClick={() => {
                                setSelectedBookingForPayment(b);
                                setPaymentAmount(balance);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-colors"
                            >
                              + Pay
                            </button>
                          )}
                          <Link
                            href={`/owner/bookings/${b.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL (Requirement 31) */}
      {showPaymentModal && selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Record Payment Receipt</h3>
                <p className="text-xs text-slate-400">{selectedBookingForPayment.bookingNumber} · {selectedBookingForPayment.customerName}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-938210984 or CHQ-002931"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Second installment paid at venue office"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all"
                >
                  {paying ? "Saving..." : "Record Payment & Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
