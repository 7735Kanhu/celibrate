"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Search,
  Printer,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Building2,
  MessageCircle,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // PDF Preview Modal
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data.quotations);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareLink = (q: any) => {
    const text = encodeURIComponent(
      `Hello ${q.customerName}, here is your official Celibrate quotation (${q.quotationNumber}) for ${q.venue?.name}. Total: ₹${q.total.toLocaleString("en-IN")}. Please review and contact us for confirmation.`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quotations Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Official quotations issued to customers with line items, discounts, and validity tracking.
        </p>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No quotations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Quotation #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Venue & Event</th>
                  <th className="py-3.5 px-4">Subtotal / Discount</th>
                  <th className="py-3.5 px-4">Final Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-900">
                      {q.quotationNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{q.customerName}</div>
                      <div className="text-[11px] text-gray-500">{q.customerPhone || q.customerEmail}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{q.venue?.name}</div>
                      <div className="text-[11px] text-gray-500">
                        {q.eventType} ({q.guestCount} guests)
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>₹{q.subtotal?.toLocaleString("en-IN")}</div>
                      {q.discount > 0 && (
                        <div className="text-[11px] text-rose-500">-₹{q.discount?.toLocaleString("en-IN")}</div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-black text-brand-600">
                      ₹{q.total?.toLocaleString("en-IN")}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {q.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedQuotation(q)}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        View & Print PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Quotation Preview Modal (Requirement 26) */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 no-print">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Official Quotation Document
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
                  href={getWhatsAppShareLink(selectedQuotation)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas */}
            <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-6 text-xs text-gray-800 shadow-xs">
              {/* Header Branding */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                <div>
                  <div className="text-2xl font-black text-brand-500 tracking-tight">CELIBRATE</div>
                  <p className="text-[10px] text-gray-500">Official Venue Discovery & Coordination</p>
                  <p className="text-[10px] text-gray-400">support@celibrate.in | +91 98765 43210</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{selectedQuotation.venue?.name}</div>
                  <p className="text-[11px] text-gray-500">{selectedQuotation.venue?.address}</p>
                  <div className="text-xs font-mono font-bold text-brand-600 mt-1">
                    {selectedQuotation.quotationNumber}
                  </div>
                </div>
              </div>

              {/* Quotation Info & Customer Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Customer</span>
                  <div className="font-bold text-sm text-gray-900">{selectedQuotation.customerName}</div>
                  <div className="text-gray-600">{selectedQuotation.customerPhone}</div>
                  <div className="text-gray-600">{selectedQuotation.customerEmail}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Event Schedule</span>
                  <div className="font-bold text-gray-900">{selectedQuotation.eventType}</div>
                  <div className="text-gray-600">
                    Date: {new Date(selectedQuotation.eventDate).toLocaleDateString()}
                  </div>
                  <div className="text-gray-600">Guests: {selectedQuotation.guestCount}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="py-2">Item / Service</th>
                      <th className="py-2 text-center">Category</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedQuotation.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-semibold text-gray-900">{item.name}</td>
                        <td className="py-2.5 text-center text-gray-500">{item.category}</td>
                        <td className="py-2.5 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-2.5 text-right text-gray-700">₹{item.unitPrice?.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 text-right font-bold text-gray-900">₹{item.total?.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-gray-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{selectedQuotation.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedQuotation.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{selectedQuotation.discount?.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedQuotation.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>GST / Tax:</span>
                      <span className="font-semibold">+₹{selectedQuotation.tax?.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-brand-600 border-t border-gray-200 pt-2">
                    <span>Grand Total:</span>
                    <span>₹{selectedQuotation.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Validity */}
              <div className="border-t border-gray-100 pt-4 text-[10px] text-gray-500 space-y-1">
                <div className="font-bold text-gray-700">Terms & Conditions:</div>
                <div className="whitespace-pre-line leading-relaxed">{selectedQuotation.terms}</div>
                {selectedQuotation.validUntil && (
                  <div className="pt-2 text-brand-600 font-semibold">
                    Valid until: {new Date(selectedQuotation.validUntil).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
