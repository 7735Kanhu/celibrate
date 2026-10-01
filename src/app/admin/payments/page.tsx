"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  Printer,
  MessageCircle,
  X,
  Building2,
  CalendarCheck2,
  IndianRupee,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data.payments);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppReceiptLink = (p: any) => {
    const text = encodeURIComponent(
      `Hello ${p.booking?.customerName}, here is your official Celibrate payment receipt (${p.receiptNumber}) for booking ${p.booking?.bookingNumber} at ${p.venue?.name}. Amount Paid: ₹${p.amount.toLocaleString("en-IN")}. Current Balance: ₹${p.booking?.balanceAmount?.toLocaleString("en-IN")}.`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payments & Receipts Ledger</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Record of manual payment transactions, advance deposits, and official client receipts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipt #, booking #, customer, or reference #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading payments ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No payments recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Receipt #</th>
                  <th className="py-3.5 px-4">Booking #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Method & Type</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-900">
                      {p.receiptNumber}
                    </td>

                    <td className="py-4 px-4 font-mono font-medium text-brand-600">
                      {p.booking?.bookingNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{p.booking?.customerName}</div>
                      <div className="text-[11px] text-gray-500">{p.booking?.customerPhone}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {p.venue?.name}
                    </td>

                    <td className="py-4 px-4 font-black text-emerald-600 text-sm">
                      ₹{p.amount?.toLocaleString("en-IN")}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{p.paymentMethod}</div>
                      <div className="text-[11px] text-gray-500">{p.paymentType}</div>
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Receipt Printable Modal (Requirement 33) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 no-print">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Official Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <a
                  href={getWhatsAppReceiptLink(selectedReceipt)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl space-y-5 text-xs text-gray-800 shadow-2xs">
              <div className="text-center border-b border-gray-100 pb-4">
                <div className="text-xl font-black text-brand-500 tracking-tight">CELIBRATE</div>
                <p className="text-[10px] text-gray-400">Payment Acknowledgement & Booking Receipt</p>
                <div className="text-sm font-mono font-bold text-gray-900 mt-2">
                  Receipt: {selectedReceipt.receiptNumber}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedReceipt.booking?.bookingNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-bold text-gray-900">{selectedReceipt.booking?.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Venue:</span>
                  <span className="font-semibold text-gray-900">{selectedReceipt.venue?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Payment Date:</span>
                  <span>{new Date(selectedReceipt.paymentDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Method & Reference:</span>
                  <span className="font-medium">{selectedReceipt.paymentMethod} {selectedReceipt.referenceNumber ? `(${selectedReceipt.referenceNumber})` : ""}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Total Booking Value:</span>
                  <span className="font-medium">₹{selectedReceipt.booking?.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-200 text-sm">
                  <span className="font-bold text-gray-900">Amount Paid:</span>
                  <span className="font-black text-emerald-600 text-base">₹{selectedReceipt.amount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 text-amber-700 font-semibold">
                  <span>Remaining Due:</span>
                  <span>₹{selectedReceipt.booking?.balanceAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="bg-gray-50 p-2.5 rounded-lg text-[11px] text-gray-600">
                  Note: {selectedReceipt.notes}
                </div>
              )}

              <div className="text-[10px] text-center text-gray-400 pt-3">
                This is a computer-generated confirmation receipt issued by Celibrate.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
