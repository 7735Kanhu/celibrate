"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  Users,
  IndianRupee,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  CalendarClock,
  Eye,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function OwnerEnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteType, setNoteType] = useState("CALL");
  const [noteText, setNoteText] = useState("");

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("11:00 AM");
  const [followUpNote, setFollowUpNote] = useState("");

  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [siteVisitDate, setSiteVisitDate] = useState("");
  const [siteVisitTime, setSiteVisitTime] = useState("04:00 PM");
  const [siteVisitNotes, setSiteVisitNotes] = useState("");

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [bookingAmount, setBookingAmount] = useState<number | string>("");
  const [advanceAmount, setAdvanceAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [specialNotes, setSpecialNotes] = useState("");

  const fetchEnquiry = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/enquiries/${id}`);
      const data = await res.json();
      if (data.success && data.data?.enquiry) {
        setEnquiry(data.data.enquiry);
        setBookingAmount(data.data.enquiry.budget || 150000);
        setAdvanceAmount(Math.round(Number(data.data.enquiry.budget || 150000) * 0.25));
      } else {
        setError(data.error?.message || "Failed to load enquiry");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load enquiry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEnquiry();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          activityType: "STATUS_CHANGE",
          activityNote: `Status updated to ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Status updated to ${newStatus}`);
        fetchEnquiry();
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert(data.error?.message || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddActivityNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: noteType,
          activityNote: noteText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteText("");
        setShowNoteModal(false);
        fetchEnquiry();
      } else {
        alert(data.error?.message || "Failed to add activity note");
      }
    } catch (err: any) {
      alert(err.message || "Error adding note");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUp: {
            date: followUpDate,
            time: followUpTime,
            note: followUpNote,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowFollowUpModal(false);
        setFollowUpDate("");
        setFollowUpNote("");
        fetchEnquiry();
      } else {
        alert(data.error?.message || "Failed to schedule follow up");
      }
    } catch (err: any) {
      alert(err.message || "Error scheduling follow-up");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitDate) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SITE_VISIT",
          siteVisit: {
            date: siteVisitDate,
            time: siteVisitTime,
            notes: siteVisitNotes,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSiteVisitModal(false);
        setSiteVisitDate("");
        setSiteVisitNotes("");
        fetchEnquiry();
      } else {
        alert(data.error?.message || "Failed to schedule site visit");
      }
    } catch (err: any) {
      alert(err.message || "Error scheduling site visit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingAmount || Number(bookingAmount) <= 0) {
      alert("Please provide a valid total booking amount");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/enquiries/convert-to-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          totalAmount: Number(bookingAmount),
          advanceAmount: Number(advanceAmount || 0),
          paymentMethod,
          specialNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConvertModal(false);
        router.push(`/owner/bookings/${data.data.booking.id}`);
      } else {
        alert(data.error?.message || "Failed to convert booking. Double-booking conflict may exist.");
      }
    } catch (err: any) {
      alert(err.message || "Error during conversion");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading enquiry details...</p>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Enquiry Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || "The requested enquiry does not exist or you do not have permission to view it."}</p>
        <Link
          href="/owner/enquiries"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Enquiries
        </Link>
      </div>
    );
  }

  // Generate WhatsApp pre-filled template (Requirement 47)
  const cleanPhone = enquiry.customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappText = encodeURIComponent(
    `Hello ${enquiry.customerName}, this is Celibrate regarding your ${enquiry.eventType} enquiry (${enquiry.enquiryNumber}) for ${enquiry.venue.name}. Please let us know a convenient time to discuss your requirements.`
  );
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${whatsappText}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/enquiries"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                {enquiry.enquiryNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  enquiry.status === "BOOKED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : enquiry.status === "QUOTATION_SENT"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : enquiry.status === "SITE_VISIT"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {enquiry.status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              {enquiry.customerName} — {enquiry.eventType}
            </h1>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${enquiry.customerPhone}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs shadow-sm transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Call Customer
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Customer
          </a>
          <button
            onClick={() => setShowNoteModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-500" />
            Add Note
          </button>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs shadow-sm transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
            Follow Up
          </button>
          <button
            onClick={() => setShowSiteVisitModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs shadow-sm transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            Site Visit
          </button>
          {enquiry.status !== "BOOKED" ? (
            <button
              onClick={() => setShowConvertModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm shadow-rose-200 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4" />
              Convert to Booking
            </button>
          ) : (
            enquiry.booking && (
              <Link
                href={`/owner/bookings/${enquiry.booking.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                View Booking ({enquiry.booking.bookingNumber})
              </Link>
            )
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Main Grid: Info + Pipeline Status & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Quotations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Pipeline Step Changer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pipeline Status</h2>
            <div className="flex flex-wrap gap-2">
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
                  disabled={actionLoading || enquiry.status === "BOOKED"}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    enquiry.status === st
                      ? "bg-rose-500 text-white shadow-sm ring-2 ring-rose-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  } ${enquiry.status === "BOOKED" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Key Requirement Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Event Requirements</span>
              <span className="text-xs font-normal text-slate-500">
                Created: {new Date(enquiry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Event Date</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not Specified"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Guest Count</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {enquiry.guestCount ? `${enquiry.guestCount} Guests` : "Flexible"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Est. Budget</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  {enquiry.budget ? `₹${Number(enquiry.budget).toLocaleString("en-IN")}` : "Flexible"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Time Slot</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {enquiry.preferredTime || "Full Day"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-xs text-slate-400 font-medium">Target Venue</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1 truncate">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  {enquiry.venue.name} — {enquiry.venue.city?.name}
                </p>
              </div>
            </div>

            {/* Requested Services Badges */}
            {enquiry.services && enquiry.services.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Requested Services</span>
                <div className="flex flex-wrap gap-2">
                  {enquiry.services.map((svc: any) => (
                    <span key={svc.id} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium border border-rose-100">
                      {svc.serviceName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Message */}
            {enquiry.message && (
              <div className="bg-amber-50/70 border border-amber-200/70 p-4 rounded-xl">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Customer Message:</span>
                <p className="text-sm text-slate-700 italic">"{enquiry.message}"</p>
              </div>
            )}
          </div>

          {/* Quotations Module for this Enquiry */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Formal Quotations</h3>
                <p className="text-xs text-slate-400">Generate itemized proposals for this customer</p>
              </div>
              <Link
                href={`/owner/quotations?enquiryId=${enquiry.id}&customerName=${encodeURIComponent(enquiry.customerName)}&customerPhone=${encodeURIComponent(enquiry.customerPhone)}&customerEmail=${encodeURIComponent(enquiry.customerEmail)}&eventType=${encodeURIComponent(enquiry.eventType)}&eventDate=${enquiry.eventDate ? encodeURIComponent(new Date(enquiry.eventDate).toISOString().split("T")[0]) : ""}&guests=${enquiry.guestCount || 300}&venueId=${enquiry.venueId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Quotation
              </Link>
            </div>

            {enquiry.quotations && enquiry.quotations.length > 0 ? (
              <div className="space-y-3">
                {enquiry.quotations.map((q: any) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{q.quotationNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {q.items?.length || 0} line items · Total: <span className="font-bold text-slate-800">₹{q.grandTotal.toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                    <Link
                      href={`/owner/quotations?viewId=${q.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Proposal PDF
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No formal quotation sent yet. Click "Create New Quotation" to draft a customized package.
              </div>
            )}
          </div>

          {/* Activity & Interaction Timeline (Requirement 21) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span>Customer Contact History & Timeline</span>
              <span className="text-xs font-normal text-slate-400">{enquiry.activities?.length || 0} logs</span>
            </h3>

            {enquiry.activities && enquiry.activities.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {enquiry.activities.map((act: any) => (
                  <div key={act.id} className="relative flex items-start gap-3 pl-1">
                    <div className="w-6 h-6 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase">{act.type.replace(/_/g, " ")}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(act.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{act.note}</p>
                      {act.userName && <span className="text-[10px] text-slate-400 block mt-1">Logged by: {act.userName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No interactions recorded yet. Click "Add Note" to log your discussions.</p>
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile & Schedule Cards */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                {enquiry.customerName?.charAt(0) || "C"}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{enquiry.customerName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {enquiry.venue?.city?.name || "Bhubaneswar"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{enquiry.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium truncate">{enquiry.customerEmail}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Send WhatsApp Message
              </a>
            </div>
          </div>

          {/* Follow-Ups Card (Requirement 22) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Follow-Ups</h3>
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                + Add
              </button>
            </div>

            {enquiry.followUps && enquiry.followUps.length > 0 ? (
              <div className="space-y-2">
                {enquiry.followUps.map((f: any) => (
                  <div key={f.id} className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> {new Date(f.date).toLocaleDateString()} at {f.time}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-800">
                        {f.status}
                      </span>
                    </div>
                    {f.note && <p className="text-xs text-amber-950 mt-1">{f.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No pending follow-ups scheduled.</p>
            )}
          </div>

          {/* Site Visits Card (Requirement 23) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Site Visits</h3>
              <button
                onClick={() => setShowSiteVisitModal(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                + Schedule
              </button>
            </div>

            {enquiry.siteVisits && enquiry.siteVisits.length > 0 ? (
              <div className="space-y-2">
                {enquiry.siteVisits.map((v: any) => (
                  <div key={v.id} className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" /> {new Date(v.date).toLocaleDateString()} at {v.time}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-800">
                        {v.status}
                      </span>
                    </div>
                    {v.notes && <p className="text-xs text-indigo-950 mt-1">{v.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No site visits scheduled yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD INTERACTION NOTE */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Record Customer Interaction</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAddActivityNote} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Interaction Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="EMAIL">Email</option>
                  <option value="NOTE">General Note</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Discussion Details / Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Spoke with Rahul regarding catering package. Requested ₹15,000 discount..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE FOLLOW UP */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Schedule Follow-up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Time</label>
                  <input
                    type="text"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Reminder Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Call to confirm catering headcount and send revised quote"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE SITE VISIT */}
      {showSiteVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Schedule Venue Site Visit</h3>
              <button onClick={() => setShowSiteVisitModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleScheduleSiteVisit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={siteVisitDate}
                    onChange={(e) => setSiteVisitDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Time</label>
                  <input
                    type="text"
                    value={siteVisitTime}
                    onChange={(e) => setSiteVisitTime(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Special Requirements / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Customer wants to inspect bridal suite and check mandap space"
                  value={siteVisitNotes}
                  onChange={(e) => setSiteVisitNotes(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSiteVisitModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Schedule Site Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONVERT TO BOOKING (Requirement 27, 28, 30) */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Convert Enquiry into Internal Booking</h3>
                <p className="text-xs text-slate-500">Includes server-side double-booking conflict check</p>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleConvertToBooking} className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-1">
                <p><strong>Customer:</strong> {enquiry.customerName} ({enquiry.customerPhone})</p>
                <p><strong>Event:</strong> {enquiry.eventType} on {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString() : "TBD"}</p>
                <p><strong>Venue:</strong> {enquiry.venue.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Agreed Total Booking (₹)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-rose-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Advance Received (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-rose-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Method for Advance</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Special Notes / Terms</label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Includes stage decor and 5 guest rooms. Advance received via UPI."
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
                >
                  {actionLoading ? "Validating & Confirming..." : "Confirm & Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
