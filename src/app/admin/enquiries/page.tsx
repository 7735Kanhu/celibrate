"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  Search,
  Filter,
  LayoutGrid,
  List,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Building2,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  Plus,
  X,
  History,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected enquiry for detail drawer
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [enquiryDetail, setEnquiryDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Quick Action Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteType, setNoteType] = useState("CALL");
  const [noteText, setNoteText] = useState("");

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({ date: "", time: "11:00 AM", note: "" });

  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [siteVisitData, setSiteVisitData] = useState({ date: "", time: "04:00 PM", notes: "" });

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    totalAmount: 150000,
    advanceAmount: 50000,
    paymentMethod: "UPI",
    referenceNumber: "",
    specialNotes: "",
  });

  const kanbanColumns = [
    { id: "NEW", title: "New", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { id: "CONTACTED", title: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "SITE_VISIT", title: "Site Visit", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "QUOTATION_SENT", title: "Quotation Sent", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "NEGOTIATION", title: "Negotiation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { id: "ADVANCE_PENDING", title: "Advance Due", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { id: "BOOKED", title: "Booked", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, search]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/enquiries?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data.enquiries);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedEnquiryId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/enquiries/${id}`);
      const json = await res.json();
      if (json.success && json.data?.enquiry) {
        const enq = json.data.enquiry;
        setEnquiryDetail(enq);
        const estAmount = Number(enq.budget?.replace(/[^0-9]/g, "")) || enq.venue?.startingPrice || 150000;
        setConvertData(prev => ({
          ...prev,
          totalAmount: estAmount,
          advanceAmount: Math.round(estAmount * 0.25),
        }));
      }
    } catch {
      alert("Failed to load enquiry details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchEnquiries();
        if (selectedEnquiryId === id) {
          handleOpenDetail(id);
        }
      } else {
        alert(json.error?.message || "Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedEnquiryId) return;

    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: noteType,
          activityNote: noteText,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNoteText("");
        setShowNoteModal(false);
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
      } else {
        alert(json.error?.message || "Failed to add note");
      }
    } catch {
      alert("Failed to add note");
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId || !followUpData.date) return;

    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUp: followUpData,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setShowFollowUpModal(false);
        setFollowUpData({ date: "", time: "11:00 AM", note: "" });
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
      } else {
        alert(json.error?.message || "Failed to schedule follow-up");
      }
    } catch {
      alert("Failed to schedule follow-up");
    }
  };

  const handleScheduleSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId || !siteVisitData.date) return;

    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SITE_VISIT",
          siteVisit: siteVisitData,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setShowSiteVisitModal(false);
        setSiteVisitData({ date: "", time: "04:00 PM", notes: "" });
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
      } else {
        alert(json.error?.message || "Failed to schedule site visit");
      }
    } catch {
      alert("Failed to schedule site visit");
    }
  };

  const handleConvertToBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId) return;

    try {
      const res = await fetch("/api/enquiries/convert-to-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: selectedEnquiryId,
          totalAmount: Number(convertData.totalAmount),
          advanceAmount: Number(convertData.advanceAmount),
          paymentMethod: convertData.paymentMethod,
          referenceNumber: convertData.referenceNumber,
          specialNotes: convertData.specialNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowConvertModal(false);
        alert(`Booking ${json.data.booking.bookingNumber} created successfully! Venue dates locked.`);
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
      } else {
        alert(json.error?.message || "Failed to convert booking");
      }
    } catch {
      alert("Error converting enquiry to booking");
    }
  };

  const getWhatsAppLink = (enq: any) => {
    const phone = enq?.customerPhone?.replace(/[^0-9]/g, "") || "";
    const cleanPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const text = encodeURIComponent(
      `Hello ${enq?.customerName}, this is Celibrate regarding your ${enq?.eventType} enquiry (${enq?.enquiryNumber}) for ${enq?.venue?.name}. Please let us know a convenient time to discuss your requirements.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Enquiries Pipeline</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Admin Central Management: Manage incoming leads, qualify requirements, schedule follow-ups, and lock bookings.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "kanban" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "table" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, phone, enquiry # or venue..."
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
          <option value="ALL">All Stages</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="INTERESTED">Interested</option>
          <option value="SITE_VISIT">Site Visit</option>
          <option value="QUOTATION_SENT">Quotation Sent</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="ADVANCE_PENDING">Advance Pending</option>
          <option value="BOOKED">Booked</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {kanbanColumns.map((col) => {
            const colEnquiries = enquiries.filter((e) => {
              if (col.id === "NEW") return e.status === "NEW" || e.status === "Submitted";
              if (col.id === "CONTACTED") return e.status === "CONTACTED" || e.status === "Received";
              return e.status === col.id;
            });

            return (
              <div key={col.id} className="min-w-[280px] w-72 bg-gray-100/70 rounded-3xl p-3.5 flex flex-col shrink-0">
                <div className="flex items-center justify-between px-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                    {colEnquiries.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[68vh] pr-1">
                  {colEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      onClick={() => handleOpenDetail(enq.id)}
                      className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-brand-300 shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-gray-400 group-hover:text-brand-500 font-medium">
                          {enq.enquiryNumber}
                        </span>
                        <span className="text-gray-400">
                          {new Date(enq.eventDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                          {enq.customerName}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {enq.venue?.name} • {enq.eventType}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                        <span>{enq.customerPhone}</span>
                        <span className="text-brand-600 font-semibold group-hover:underline">Manage & Details →</span>
                      </div>
                    </div>
                  ))}

                  {colEnquiries.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Enquiry #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Target Venue</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Guests & Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-900">
                      {enq.enquiryNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{enq.customerName}</div>
                      <div className="text-[11px] text-gray-500">{enq.customerPhone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{enq.venue?.name}</div>
                      <div className="text-[11px] text-gray-500">{enq.venue?.city?.name}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">
                        {new Date(enq.eventDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {enq.eventType} • {enq.preferredTime || "Full Day"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{enq.guestCount} guests</div>
                      <div className="text-[11px] text-gray-500">{enq.budget || "Standard"}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-200">
                        {enq.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(enq.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        Manage Lead →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENQUIRY DETAILS & MANAGEMENT DRAWER */}
      {selectedEnquiryId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-semibold text-gray-400">
                  {enquiryDetail?.enquiryNumber || "Loading..."}
                </span>
                <h2 className="text-lg font-bold text-gray-900">Enquiry Management Console</h2>
              </div>
              <button
                onClick={() => setSelectedEnquiryId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {detailLoading || !enquiryDetail ? (
                <div className="p-12 text-center text-gray-400 animate-pulse">Loading lead details...</div>
              ) : (
                <>
                  {/* Status update quick buttons & dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-2">
                      Pipeline Stage
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[
                        "NEW",
                        "CONTACTED",
                        "INTERESTED",
                        "SITE_VISIT",
                        "QUOTATION_SENT",
                        "NEGOTIATION",
                        "ADVANCE_PENDING",
                        "BOOKED",
                        "LOST",
                      ].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(enquiryDetail.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            enquiryDetail.status === st
                              ? "bg-brand-500 text-white shadow-xs"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {st.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                    <select
                      value={enquiryDetail.status}
                      onChange={(e) => handleUpdateStatus(enquiryDetail.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 text-xs focus:outline-none focus:border-brand-500 shadow-2xs"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="INTERESTED">INTERESTED</option>
                      <option value="SITE_VISIT">SITE VISIT</option>
                      <option value="QUOTATION_SENT">QUOTATION SENT</option>
                      <option value="NEGOTIATION">NEGOTIATION</option>
                      <option value="ADVANCE_PENDING">ADVANCE PENDING</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="LOST">MARK LOST</option>
                    </select>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <a
                      href={`tel:${enquiryDetail.customerPhone}`}
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Customer</span>
                    </a>

                    <a
                      href={getWhatsAppLink(enquiryDetail)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-500" />
                      <span>Add Note</span>
                    </button>

                    <button
                      onClick={() => setShowFollowUpModal(true)}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Follow-up</span>
                    </button>

                    <button
                      onClick={() => setShowSiteVisitModal(true)}
                      className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Site Visit</span>
                    </button>

                    <Link
                      href={`/admin/quotations?enquiryId=${enquiryDetail.id}&venueId=${enquiryDetail.venueId}&customerName=${encodeURIComponent(enquiryDetail.customerName)}&customerPhone=${encodeURIComponent(enquiryDetail.customerPhone)}&customerEmail=${encodeURIComponent(enquiryDetail.customerEmail)}&eventType=${encodeURIComponent(enquiryDetail.eventType)}&eventDate=${enquiryDetail.eventDate ? encodeURIComponent(new Date(enquiryDetail.eventDate).toISOString().split("T")[0]) : ""}&guests=${enquiryDetail.guestCount || 300}`}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                      <span>Quotation</span>
                    </Link>

                    {enquiryDetail.status !== "BOOKED" ? (
                      <button
                        onClick={() => setShowConvertModal(true)}
                        className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Lock Dates & Convert to Booking</span>
                      </button>
                    ) : (
                      enquiryDetail.booking && (
                        <Link
                          href={`/admin/bookings`}
                          className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>View Confirmed Booking ({enquiryDetail.booking.bookingNumber})</span>
                        </Link>
                      )
                    )}
                  </div>

                  {/* Customer & Event Details Box */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                      Customer & Event Requirements
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-400 block">Customer</span>
                        <span className="font-bold text-gray-900">{enquiryDetail.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Phone</span>
                        <span className="font-bold text-gray-800">{enquiryDetail.customerPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Email</span>
                        <span className="font-bold text-gray-800">{enquiryDetail.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Target Venue</span>
                        <span className="font-bold text-brand-600">{enquiryDetail.venue?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Event Date</span>
                        <span className="font-bold text-gray-900">
                          {new Date(enquiryDetail.eventDate).toLocaleDateString()} ({enquiryDetail.preferredTime || "Full Day"})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Guests & Budget</span>
                        <span className="font-bold text-gray-900">
                          {enquiryDetail.guestCount} guests • {enquiryDetail.budget || "Standard"}
                        </span>
                      </div>
                    </div>

                    {/* Requested Services */}
                    {enquiryDetail.services && enquiryDetail.services.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-400 block mb-1.5">Requested Services</span>
                        <div className="flex flex-wrap gap-1.5">
                          {enquiryDetail.services.map((s: any) => (
                            <span key={s.id} className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-200">
                              {s.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {enquiryDetail.message && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-400 block">Customer Message</span>
                        <p className="text-gray-700 italic mt-0.5">&ldquo;{enquiryDetail.message}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Scheduled Follow-ups & Site Visits */}
                  {(enquiryDetail.followUps?.length > 0 || enquiryDetail.siteVisits?.length > 0) && (
                    <div className="space-y-3">
                      {enquiryDetail.followUps?.length > 0 && (
                        <div className="bg-purple-50/60 border border-purple-200/60 p-3.5 rounded-2xl space-y-2">
                          <h4 className="font-bold text-purple-900 text-xs flex items-center justify-between">
                            <span>Scheduled Follow-ups</span>
                            <span className="text-[10px] font-normal text-purple-600">{enquiryDetail.followUps.length} scheduled</span>
                          </h4>
                          <div className="space-y-1.5">
                            {enquiryDetail.followUps.map((f: any) => (
                              <div key={f.id} className="text-xs bg-white p-2.5 rounded-xl border border-purple-100 flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900">{new Date(f.date).toLocaleDateString()} at {f.time}</div>
                                  {f.note && <div className="text-gray-500 text-[11px]">{f.note}</div>}
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                  {f.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {enquiryDetail.siteVisits?.length > 0 && (
                        <div className="bg-indigo-50/60 border border-indigo-200/60 p-3.5 rounded-2xl space-y-2">
                          <h4 className="font-bold text-indigo-900 text-xs flex items-center justify-between">
                            <span>Scheduled Site Visits</span>
                            <span className="text-[10px] font-normal text-indigo-600">{enquiryDetail.siteVisits.length} visits</span>
                          </h4>
                          <div className="space-y-1.5">
                            {enquiryDetail.siteVisits.map((v: any) => (
                              <div key={v.id} className="text-xs bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900">{new Date(v.date).toLocaleDateString()} at {v.time}</div>
                                  {v.notes && <div className="text-gray-500 text-[11px]">{v.notes}</div>}
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                  {v.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formal Quotations for this Enquiry */}
                  {enquiryDetail.quotations && enquiryDetail.quotations.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-2xl space-y-2">
                      <h4 className="font-bold text-amber-900 text-xs flex items-center justify-between">
                        <span>Formal Quotations</span>
                        <span className="text-[10px] font-normal text-amber-700">{enquiryDetail.quotations.length} generated</span>
                      </h4>
                      <div className="space-y-1.5">
                        {enquiryDetail.quotations.map((q: any) => (
                          <div key={q.id} className="text-xs bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-gray-900">{q.quotationNumber}</div>
                              <div className="text-gray-500 text-[11px]">Total: ₹{q.total?.toLocaleString("en-IN")}</div>
                            </div>
                            <Link
                              href={`/admin/quotations`}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] transition-colors"
                            >
                              View Proposal →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity History Timeline */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-500" />
                      Contact & Activity History
                    </h3>

                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                      {enquiryDetail.activities && enquiryDetail.activities.length > 0 ? (
                        enquiryDetail.activities.map((act: any) => (
                          <div key={act.id} className="relative pl-7">
                            <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-white" />
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                                <span className="font-bold text-gray-700">{act.type}</span>
                                <span>{new Date(act.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-gray-800">{act.note}</div>
                              {act.userName && <div className="text-[10px] text-gray-400 mt-1">By: {act.userName}</div>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs py-3">No activity logs recorded yet.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Record Customer Interaction</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-xs">Interaction Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp Discussion</option>
                  <option value="EMAIL">Email Discussion</option>
                  <option value="NOTE">General Discussion Note</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-xs">Discussion Notes</label>
                <textarea
                  rows={4}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Spoke with customer regarding catering headcount. Agreed on ₹1,200 per plate..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-500 text-white rounded-lg font-bold">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Schedule Lead Follow-up</h3>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Follow-up Date</label>
                <input
                  type="date"
                  required
                  value={followUpData.date}
                  onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Time</label>
                <input
                  type="text"
                  value={followUpData.time}
                  onChange={(e) => setFollowUpData({ ...followUpData, time: e.target.value })}
                  placeholder="e.g. 11:00 AM"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reminder Note</label>
                <input
                  type="text"
                  value={followUpData.note}
                  onChange={(e) => setFollowUpData({ ...followUpData, note: e.target.value })}
                  placeholder="e.g. Call to finalize menu and payment schedule"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-bold">Schedule Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Site Visit Modal */}
      {showSiteVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Schedule Venue Site Visit</h3>
            <p className="text-gray-500">
              Customer inspection of halls, lawn, and bridal rooms.
            </p>
            <form onSubmit={handleScheduleSiteVisit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Visit Date</label>
                <input
                  type="date"
                  required
                  value={siteVisitData.date}
                  onChange={(e) => setSiteVisitData({ ...siteVisitData, date: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Visit Time</label>
                <input
                  type="text"
                  value={siteVisitData.time}
                  onChange={(e) => setSiteVisitData({ ...siteVisitData, time: e.target.value })}
                  placeholder="e.g. 04:00 PM"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Inspection Notes / Client Requests</label>
                <input
                  type="text"
                  value={siteVisitData.notes}
                  onChange={(e) => setSiteVisitData({ ...siteVisitData, notes: e.target.value })}
                  placeholder="e.g. Customer wants to see parking and kitchen"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowSiteVisitModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold">Schedule Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Convert Enquiry to Confirmed Booking</h3>
            <p className="text-gray-500">
              This will lock the venue date and record the initial booking deposit in a transaction.
            </p>

            <form onSubmit={handleConvertToBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Agreed Total Booking (₹)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={convertData.totalAmount}
                    onChange={(e) => setConvertData({ ...convertData, totalAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Advance Amount Received (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={convertData.advanceAmount}
                    onChange={(e) => setConvertData({ ...convertData, advanceAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Method for Advance</label>
                <select
                  value={convertData.paymentMethod}
                  onChange={(e) => setConvertData({ ...convertData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Transaction / Reference Number</label>
                <input
                  type="text"
                  value={convertData.referenceNumber}
                  onChange={(e) => setConvertData({ ...convertData, referenceNumber: e.target.value })}
                  placeholder="e.g. UPI/10293847"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Special Notes / Requirements</label>
                <input
                  type="text"
                  value={convertData.specialNotes}
                  onChange={(e) => setConvertData({ ...convertData, specialNotes: e.target.value })}
                  placeholder="Stage decor, AC timing, etc."
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowConvertModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold">Confirm & Lock Dates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
