"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Plus,
  Trash2,
  Percent,
  ExternalLink,
} from "lucide-react";

function AdminQuotationsContent() {
  const searchParams = useSearchParams();
  const prefillEnquiryId = searchParams.get("enquiryId");
  const prefillVenueId = searchParams.get("venueId") || "";
  const prefillCustomerName = searchParams.get("customerName") || "";
  const prefillCustomerPhone = searchParams.get("customerPhone") || "";
  const prefillCustomerEmail = searchParams.get("customerEmail") || "";
  const prefillEventType = searchParams.get("eventType") || "Wedding";
  const prefillEventDate = searchParams.get("eventDate") || "";
  const prefillGuests = searchParams.get("guests") || "300";

  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [venues, setVenues] = useState<any[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    enquiryId: prefillEnquiryId || "",
    venueId: prefillVenueId,
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

  // PDF Preview Modal
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  useEffect(() => {
    fetchQuotations();
    fetchVenues();
    if (prefillEnquiryId) {
      setShowCreateModal(true);
    }
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data.quotations || []);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await fetch("/api/admin/venues");
      const json = await res.json();
      if (json.success && json.data?.venues) {
        setVenues(json.data.venues);
        if (!formData.venueId && json.data.venues.length > 0) {
          setFormData((prev) => ({ ...prev, venueId: json.data.venues[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load venues:", err);
    }
  };

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
      { category: "Other Services", name: "Additional Service Item", quantity: 1, unitPrice: 10000, discount: 0, tax: 0 },
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
      alert("Please select a target venue");
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

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareLink = (q: any) => {
    const cleanPhone = q.customerPhone ? q.customerPhone.replace(/[^0-9]/g, "") : "";
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${q.customerName}, here is your official Celibrate quotation (${q.quotationNumber}) for ${q.venue?.name}.\nEvent: ${q.eventType} on ${new Date(q.eventDate).toLocaleDateString()}\nTotal Amount: ₹${q.total?.toLocaleString("en-IN")}\n\nPlease review and let us know if you have any questions or are ready to confirm!`
    );
    return phoneParam ? `https://wa.me/${phoneParam}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  const filteredQuotations = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(s) ||
      q.customerName?.toLowerCase().includes(s) ||
      q.venue?.name?.toLowerCase().includes(s) ||
      q.customerPhone?.includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quotations Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Admin Central Quoting: Generate itemized proposals, calculate discounts, and export PDF quotes for customer leads.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote #, customer, phone, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading quotations...</div>
        ) : filteredQuotations.length === 0 ? (
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
                {filteredQuotations.map((q) => (
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

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Itemized Quotation</h2>
                <p className="text-xs text-gray-500">Draft customized pricing proposal for this customer celebration</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-6 text-xs">
              {/* Customer & Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Target Venue *</label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="">Select Venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Customer Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate ? new Date(formData.eventDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Guest Count *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Quotation Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-2xl items-center border border-gray-100">
                      <div className="col-span-12 sm:col-span-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="Venue">Venue</option>
                          <option value="Catering">Catering</option>
                          <option value="Decoration">Decoration</option>
                          <option value="Photography">Photography</option>
                          <option value="DJ">DJ & Sound</option>
                          <option value="Rooms">Rooms</option>
                          <option value="Other Services">Other Services</option>
                        </select>
                      </div>

                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          placeholder="Item description"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          placeholder="Unit Price"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Discounts */}
              <div className="bg-gray-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Special Discount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">GST / Tax (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-gray-500 text-xs">Subtotal: ₹{calculateSubtotal().toLocaleString("en-IN")}</div>
                  <div className="text-lg font-black text-brand-600 mt-1">
                    Final Grand Total: ₹{calculateGrandTotal().toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {creating ? "Generating Proposal..." : "Generate Official Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Quotation Preview Modal */}
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

export default function AdminQuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading quotations...</div>}>
      <AdminQuotationsContent />
    </Suspense>
  );
}
