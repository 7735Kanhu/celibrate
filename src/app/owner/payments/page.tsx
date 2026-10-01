"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Search,
  Plus,
  Receipt,
  Printer,
  Calendar,
  CreditCard,
  MessageCircle,
  Eye,
  Filter,
} from "lucide-react";

export default function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const json = await res.json();
      if (json.success && json.data?.payments) {
        setPayments(json.data.payments);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success && json.data?.bookings) {
        setBookings(json.data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !amount || Number(amount) <= 0) {
      alert("Please select a booking and enter a valid positive amount");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          amount: Number(amount),
          paymentMethod,
          referenceNumber,
          notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setSelectedBookingId("");
        setAmount("");
        setReferenceNumber("");
        setNotes("");
        fetchPayments();
        if (json.data?.payment) {
          setSelectedReceipt(json.data.payment);
        }
      } else {
        alert(json.error?.message || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Payment submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.booking?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.booking?.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "ALL" || p.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const getWhatsAppShareLink = (p: any) => {
    const phone = p.booking?.customerPhone ? p.booking.customerPhone.replace(/[^0-9]/g, "") : "";
    const phoneParam = phone.length === 10 ? `91${phone}` : phone;
    const text = encodeURIComponent(
      `Hello ${p.booking?.customerName}, this is Celibrate confirming receipt of ₹${p.amount?.toLocaleString(
        "en-IN"
      )} for booking ${p.booking?.bookingNumber} via ${p.paymentMethod}. Official Receipt: ${p.receiptNumber}. Thank you!`
    );
    return phoneParam ? `https://wa.me/${phoneParam}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payments & Receipts Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual payment recording, verified receipts, and accounting audit trails for your venue
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record New Payment
        </button>
      </div>

      {/* KPI Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Payments Recorded</span>
            <div className="text-2xl font-black text-slate-800">₹{totalCollected.toLocaleString("en-IN")}</div>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          <span className="font-semibold text-slate-700">{payments.length} verified transactions</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Offline advances, cash, and digital UPI settlements</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by receipt #, booking #, customer, or transaction ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "UPI", "Bank Transfer", "Cash", "Cheque", "Card"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                methodFilter === m
                  ? "bg-rose-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payment transactions...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No payments found matching your filter. Click "Record New Payment" to enter an advance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.booking ? (
                        <Link
                          href={`/owner/bookings/${p.booking.id}`}
                          className="font-mono font-semibold text-slate-700 hover:text-rose-600"
                        >
                          {p.booking.bookingNumber}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{p.booking?.customerName || "Customer"}</div>
                      <div className="text-[11px] text-slate-400">{p.booking?.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                      {p.referenceNumber && (
                        <span className="text-slate-400 block text-[10px] mt-0.5">{p.referenceNumber}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          title="Print Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getWhatsAppShareLink(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Share Receipt on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Record Payment Receipt</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Booking *</label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => {
                    setSelectedBookingId(e.target.value);
                    const b = bookings.find((item) => item.id === e.target.value);
                    if (b) {
                      const due = (b.totalAmount || 0) - (b.paidAmount || 0);
                      if (due > 0) setAmount(due);
                    }
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="">Select confirmed booking...</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} — {b.customerName} (₹{b.totalAmount?.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 text-sm focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-928174 or CHQ-0012"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advance paid at venue front desk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  {submitting ? "Saving..." : "Record & Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PAYMENT RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="font-bold text-slate-800 text-sm">Official Payment Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="p-1 text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-4 print:border-none print:p-0 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xl font-black text-rose-500 tracking-tight">CELIBRATE</div>
                  <p className="text-[10px] text-slate-400">Official Payment Receipt</p>
                  <p className="font-bold text-slate-700 mt-2">{selectedReceipt.venue?.name || "Celibrate Partner Venue"}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.booking?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedReceipt.booking?.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
                {selectedReceipt.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Ref:</span>
                    <span className="font-mono text-slate-800">{selectedReceipt.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                  <span className="text-slate-800">Amount Paid:</span>
                  <span className="text-emerald-600 text-base">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>Authorized Celibrate Venue Partner</span>
                <span>Automated Computer Generated Receipt</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
