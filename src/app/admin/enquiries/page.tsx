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
  const [noteText, setNoteText] = useState("");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({ date: "", time: "11:00 AM", note: "" });
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
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
      if (json.success) {
        setEnquiryDetail(json.data.enquiry);
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
      if (res.ok) {
        fetchEnquiries();
        if (selectedEnquiryId === id) {
          handleOpenDetail(id);
        }
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
          activityType: "NOTE",
          activityNote: noteText,
        }),
      });
      if (res.ok) {
        setNoteText("");
        setShowNoteModal(false);
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
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
      if (res.ok) {
        setShowFollowUpModal(false);
        handleOpenDetail(selectedEnquiryId);
        fetchEnquiries();
      }
    } catch {
      alert("Failed to schedule follow-up");
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
          advanceAmount: convertData.advanceAmount,
          paymentMethod: convertData.paymentMethod,
          referenceNumber: convertData.referenceNumber,
          specialNotes: convertData.specialNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowConvertModal(false);
        alert(`Booking ${json.data.booking.bookingNumber} created successfully!`);
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
            Manage incoming event leads, follow-ups, quotations, and booking conversions.
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
          <option value="SITE_VISIT">Site Visit</option>
          <option value="QUOTATION_SENT">Quotation Sent</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="ADVANCE_PENDING">Advance Pending</option>
          <option value="BOOKED">Booked</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* KANBAN VIEW (Requirement 19) */}
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
                          {enq.eventType} • {enq.venue?.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                        <span>{enq.guestCount} guests</span>
                        <span className="font-medium text-gray-600">{enq.preferredTime || "Evening"}</span>
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
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Event Date & Guests</th>
                  <th className="py-3.5 px-4">Stage Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-medium text-gray-900">
                      {enq.enquiryNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{enq.customerName}</div>
                      <div className="text-[11px] text-gray-500">{enq.customerPhone}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {enq.venue?.name}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">
                        {new Date(enq.eventDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {enq.eventType} ({enq.guestCount} guests)
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-200">
                        {enq.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(enq.id)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-brand-50 hover:text-brand-600 font-semibold text-[11px] transition-colors"
                      >
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENQUIRY DETAILS DRAWER (Requirement 20) */}
      {selectedEnquiryId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-semibold text-gray-400">
                  {enquiryDetail?.enquiryNumber || "Loading..."}
                </span>
                <h2 className="text-lg font-bold text-gray-900">Enquiry Management</h2>
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
                  {/* Status update quick buttons */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-2">
                      Pipeline Stage
                    </label>
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

                  {/* Primary Action Buttons (Requirement 20) */}
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
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors"
                    >
                      + Add Note
                    </button>

                    <button
                      onClick={() => setShowFollowUpModal(true)}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold transition-colors"
                    >
                      Schedule Follow-up
                    </button>

                    <Link
                      href={`/admin/quotations?enquiryId=${enquiryDetail.id}`}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                      <span>Create Quotation</span>
                    </Link>

                    {enquiryDetail.status !== "BOOKED" && (
                      <button
                        onClick={() => setShowConvertModal(true)}
                        className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-colors shadow-2xs"
                      >
                        Convert to Booking
                      </button>
                    )}
                  </div>

                  {/* Customer & Event Details Box */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                      Customer & Celebration Parameters
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

                    {enquiryDetail.message && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-400 block">Customer Message</span>
                        <p className="text-gray-700 italic mt-0.5">{enquiryDetail.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Activity History Timeline (Requirement 21) */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-500" />
                      Contact & Activity History
                    </h3>

                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                      {enquiryDetail.activities?.map((act: any) => (
                        <div key={act.id} className="relative pl-7">
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-white" />
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                              <span className="font-bold text-gray-700">{act.type}</span>
                              <span>{new Date(act.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-800">{act.note}</div>
                          </div>
                        </div>
                      ))}
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
            <h3 className="font-bold text-sm text-gray-900">Add Discussion Note</h3>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Customer interested in catering package, requested callback at 4 PM"
              className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setShowNoteModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAddNote} className="px-4 py-1.5 bg-brand-500 text-white rounded-lg font-bold">Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Schedule Lead Follow-up</h3>
            <div>
              <label className="block font-semibold mb-1">Date</label>
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
              <label className="block font-semibold mb-1">Note</label>
              <input
                type="text"
                value={followUpData.note}
                onChange={(e) => setFollowUpData({ ...followUpData, note: e.target.value })}
                placeholder="Discuss finalized price"
                className="w-full p-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowFollowUpModal(false)} className="px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleScheduleFollowUp} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-bold">Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Booking Modal (Requirement 27) */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Convert Enquiry to Confirmed Booking</h3>
            <p className="text-gray-500">
              This will lock the venue date and record the initial booking deposit in a transaction.
            </p>

            <form onSubmit={handleConvertToBooking} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Advance Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  value={convertData.advanceAmount}
                  onChange={(e) => setConvertData({ ...convertData, advanceAmount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Method</label>
                <select
                  value={convertData.paymentMethod}
                  onChange={(e) => setConvertData({ ...convertData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
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
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
