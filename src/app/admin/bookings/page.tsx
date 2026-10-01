"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  Search,
  Filter,
  Receipt,
  Plus,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle,
  X,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 50000,
    paymentMethod: "UPI",
    paymentType: "SECOND_PAYMENT",
    referenceNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, search]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          paymentType: paymentData.paymentType,
          referenceNumber: paymentData.referenceNumber,
          notes: paymentData.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert(`Payment of ₹${paymentData.amount.toLocaleString("en-IN")} recorded! Receipt: ${json.data.payment.receiptNumber}`);
        setShowPaymentModal(false);
        fetchBookings();
      } else {
        alert(json.error?.message || "Failed to record payment");
      }
    } catch {
      alert("Error recording payment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Internal Bookings Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Confirmed venue reservations, schedule milestones, and payment collections.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search booking #, customer, phone, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No bookings match criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Booking #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Venue & City</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid / Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-900">
                      {bk.bookingNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{bk.customerName}</div>
                      <div className="text-[11px] text-gray-500">{bk.customerPhone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{bk.venue?.name}</div>
                      <div className="text-[11px] text-gray-500">{bk.venue?.city?.name}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">
                        {new Date(bk.eventDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {bk.eventType} • {bk.timeSlot}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-black text-gray-900">
                      ₹{bk.totalAmount?.toLocaleString("en-IN")}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-emerald-600">
                        Paid: ₹{bk.paidAmount?.toLocaleString("en-IN")}
                      </div>
                      {bk.balanceAmount > 0 ? (
                        <div className="text-[11px] text-amber-600 font-medium">
                          Due: ₹{bk.balanceAmount?.toLocaleString("en-IN")}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-bold">Settled</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bk.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : bk.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {bk.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBooking(bk);
                          setShowPaymentModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        + Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Record Payment</h3>
                <p className="text-gray-400 font-mono text-[11px]">{selectedBooking.bookingNumber}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl flex justify-between font-medium">
              <span>Remaining Balance:</span>
              <span className="font-bold text-brand-600">
                ₹{selectedBooking.balanceAmount?.toLocaleString("en-IN")}
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Payment Type</label>
                  <select
                    value={paymentData.paymentType}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="ADVANCE">Advance Deposit</option>
                    <option value="SECOND_PAYMENT">Second Milestone</option>
                    <option value="FINAL_PAYMENT">Final Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reference / UTR / Cheque #</label>
                <input
                  type="text"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  placeholder="e.g. UPI/981273910"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Payment receipt memo"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-500 text-white rounded-xl font-bold">Generate Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
