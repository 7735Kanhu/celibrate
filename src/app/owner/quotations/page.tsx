"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  Share2,
  Trash2,
  Building2,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle,
  Clock,
  Eye,
  X,
  MessageCircle,
  Percent,
} from "lucide-react";

function OwnerQuotationsContent() {
  const searchParams = useSearchParams();
  const prefillEnquiryId = searchParams.get("enquiryId");
  const prefillCustomerName = searchParams.get("customerName") || "";
  const prefillCustomerPhone = searchParams.get("customerPhone") || "";
  const prefillCustomerEmail = searchParams.get("customerEmail") || "";
  const prefillEventType = searchParams.get("eventType") || "Wedding";
  const prefillEventDate = searchParams.get("eventDate") || "";
  const prefillGuests = searchParams.get("guests") || "300";
  const viewId = searchParams.get("viewId");

  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Quotation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    enquiryId: prefillEnquiryId || "",
    venueId: "",
    customerName: prefillCustomerName,
    customerPhone: prefillCustomerPhone,
    customerEmail: prefillCustomerEmail,
    eventType: prefillEventType,
    eventDate: prefillEventDate,
    guestCount: Number(prefillGuests) || 300,
    discount: 0,
    tax: 0,
    validUntil: "",
    terms: "1. 25% Advance payment required to confirm booking.\n2. Music allowed until 10:00 PM per city guidelines.\n3. Outside decor allowed with prior approval.",
    notes: "We look forward to hosting your dream celebration with Celibrate!",
  });

  const [items, setItems] = useState<any[]>([
    { category: "Venue", name: "Full Venue Rental (Main Hall + Lawn)", quantity: 1, unitPrice: 120000, discount: 0, tax: 0 },
    { category: "Decoration", name: "Premium Stage & Floral Mandap Decor", quantity: 1, unitPrice: 45000, discount: 0, tax: 0 },
    { category: "Catering", name: "Deluxe Veg/Non-Veg Buffet (Per Plate)", quantity: 300, unitPrice: 650, discount: 0, tax: 0 },
    { category: "DJ", name: "Professional Sound System & DJ Setup", quantity: 1, unitPrice: 18000, discount: 0, tax: 0 },
    { category: "Rooms", name: "Air-Conditioned Bridal & Guest Rooms", quantity: 2, unitPrice: 5000, discount: 0, tax: 0 },
  ]);

  // Preview / Printable PDF Modal
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotations");
      const json = await res.json();
      if (json.success && json.data?.quotations) {
        setQuotations(json.data.quotations);
        if (viewId) {
          const matched = json.data.quotations.find((q: any) => q.id === viewId);
          if (matched) setSelectedQuotation(matched);
        }
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerVenues = async () => {
    try {
      const res = await fetch("/api/owner/venue");
      const json = await res.json();
      if (json.success && json.data?.venues) {
        setVenues(json.data.venues);
        if (json.data.venues.length > 0 && !formData.venueId) {
          setFormData((prev) => ({ ...prev, venueId: json.data.venues[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load owner venues:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchOwnerVenues();
    if (prefillEnquiryId) {
      setShowCreateModal(true);
    }
  }, []);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0), 0);
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    return Math.max(0, sub - Number(formData.discount || 0) + Number(formData.tax || 0));
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: "Other Services", name: "Additional Service", quantity: 1, unitPrice: 10000, discount: 0, tax: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.venueId) {
      alert("Please select a venue");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchQuotations();
        setSelectedQuotation(json.data.quotation);
      } else {
        alert(json.error?.message || "Failed to create quotation");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit quotation");
    } finally {
      setCreating(false);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchSearch =
      q.quotationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      q.customerPhone?.includes(search);
    const matchStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getWhatsAppShareLink = (q: any) => {
    const cleanPhone = q.customerPhone ? q.customerPhone.replace(/[^0-9]/g, "") : "";
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${q.customerName}, here is your official Celibrate Quotation (${q.quotationNumber}) for ${q.venue?.name}.\nEvent: ${q.eventType} on ${new Date(q.eventDate).toLocaleDateString()}\nTotal Amount: ₹${q.total.toLocaleString("en-IN")}\n\nPlease review and let us know if you would like to proceed with the booking!`
    );
    return phoneParam ? `https://wa.me/${phoneParam}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Formal Quotations & Proposals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create itemized quotes (catering, decor, DJ, venue rent) and export PDF proposals for customers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-rose-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote #, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "SENT", "ACCEPTED", "NEGOTIATION", "REJECTED"].map((st) => (
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

      {/* Quotations List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No quotations found matching your criteria. Click "Create New Quotation" to generate one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event & Venue</th>
                  <th className="py-3 px-4">Subtotal / Disc</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      {q.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{q.customerName}</div>
                      <div className="text-[11px] text-slate-400">{q.customerPhone || q.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{q.eventType}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(q.eventDate).toLocaleDateString()} · {q.guestCount} guests
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>₹{q.subtotal?.toLocaleString("en-IN")}</div>
                      {q.discount > 0 && (
                        <div className="text-[11px] text-emerald-600 font-medium">-₹{q.discount.toLocaleString("en-IN")} disc</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{q.total?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : q.status === "SENT"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "30 Days"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          title="View & Print PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getWhatsAppShareLink(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Share on WhatsApp"
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

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Generate Itemized Quotation</h2>
                <p className="text-xs text-slate-500">Create an official proposal with itemized line items</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-6">
              {/* Target Venue & Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Select Venue *</label>
                  <select
                    required
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  >
                    <option value="">Select your venue...</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.city?.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Event Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding, Reception"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Guest Count *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Line Items Table (Requirement 24) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Itemized Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Description / Service</th>
                        <th className="py-2.5 px-3 w-20">Qty</th>
                        <th className="py-2.5 px-3 w-28">Unit Price (₹)</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              value={item.category}
                              onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-1.5 bg-white"
                            >
                              <option value="Venue">Venue</option>
                              <option value="Package">Package</option>
                              <option value="Catering">Catering</option>
                              <option value="Decoration">Decoration</option>
                              <option value="Photography">Photography</option>
                              <option value="DJ">DJ</option>
                              <option value="Rooms">Rooms</option>
                              <option value="Other Services">Other</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-1.5"
                              placeholder="Service name..."
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="w-full text-xs border border-slate-200 rounded-lg p-1.5 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                              className="w-full text-xs border border-slate-200 rounded-lg p-1.5"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-800">
                            ₹{((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subtotal, Discount & Grand Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Special Discount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Terms & Validity</label>
                    <textarea
                      rows={2}
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between text-xs space-y-2 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{(Number(formData.discount) || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                    <span>Grand Total:</span>
                    <span className="text-rose-600 text-lg">₹{calculateGrandTotal().toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all"
                >
                  {creating ? "Generating..." : "Save & Issue Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PDF PROPOSAL MODAL (Requirement 26) */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0 print:shadow-none">
            {/* Header controls (hidden when printing) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">Proposal Document</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {selectedQuotation.quotationNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <a
                  href={getWhatsAppShareLink(selectedQuotation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Letterhead & Body */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-6 print:border-none print:p-0">
              {/* Letterhead */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <div className="text-2xl font-black text-rose-500 tracking-tight">CELIBRATE</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Find the Perfect Place for Every Celebration</p>
                  <p className="text-xs text-slate-600 font-semibold mt-2">{selectedQuotation.venue?.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedQuotation.venue?.address || "Bhubaneswar, Odisha"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Formal Quotation</div>
                  <div className="font-mono text-base font-bold text-slate-900 mt-0.5">{selectedQuotation.quotationNumber}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Date: {new Date(selectedQuotation.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold">
                    Valid Until: {selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString("en-IN") : "15 Days"}
                  </div>
                </div>
              </div>

              {/* Client & Event Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Prepared For</span>
                  <div className="font-bold text-slate-800 text-sm">{selectedQuotation.customerName}</div>
                  <div className="text-slate-600">{selectedQuotation.customerPhone}</div>
                  <div className="text-slate-500">{selectedQuotation.customerEmail}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Event Details</span>
                  <div className="font-bold text-slate-800 text-sm">{selectedQuotation.eventType}</div>
                  <div className="text-slate-600">
                    Date: <strong>{new Date(selectedQuotation.eventDate).toLocaleDateString("en-IN")}</strong>
                  </div>
                  <div className="text-slate-600">Headcount: {selectedQuotation.guestCount} Guests</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2">Item / Service</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuotation.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-800">{it.name}</div>
                        <div className="text-[10px] text-slate-400">{it.category}</div>
                      </td>
                      <td className="py-2.5 text-center text-slate-600">{it.quantity}</td>
                      <td className="py-2.5 text-right text-slate-600">₹{it.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right font-bold text-slate-800">
                        ₹{(it.quantity * it.unitPrice).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div className="border-t-2 border-slate-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{selectedQuotation.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedQuotation.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{selectedQuotation.discount?.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-rose-600">₹{selectedQuotation.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-2">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Terms & Conditions</p>
                <p className="whitespace-pre-line">{selectedQuotation.terms || "Advance required upon confirmation."}</p>
                <div className="pt-3 flex justify-between items-center text-slate-400 text-[10px]">
                  <span>Authorized Celibrate Venue Partner</span>
                  <span>Customer Acceptance Signature: __________________</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerQuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading quotations...</div>}>
      <OwnerQuotationsContent />
    </Suspense>
  );
}
