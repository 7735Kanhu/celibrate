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
  Users,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function OwnerEnquiryDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnquiry = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/enquiries/${id}`);
      const data = await res.json();
      if (data.success && data.data?.enquiry) {
        setEnquiry(data.data.enquiry);
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

  // Generate WhatsApp pre-filled template
  const cleanPhone = enquiry.customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappText = encodeURIComponent(
    `Hello ${enquiry.customerName}, this is regarding your ${enquiry.eventType} enquiry (${enquiry.enquiryNumber}) for ${enquiry.venue.name}. Please let us know if you have any questions.`
  );
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${whatsappText}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Read-only Indicator Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/enquiries"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Managed by Admin
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              {enquiry.customerName} — {enquiry.eventType}
            </h1>
          </div>
        </div>

        {/* Quick Contact Buttons */}
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
          {enquiry.status === "BOOKED" && enquiry.booking && (
            <Link
              href={`/owner/bookings/${enquiry.booking.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              View Booking ({enquiry.booking.bookingNumber})
            </Link>
          )}
        </div>
      </div>

      {/* Admin Managed Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200 text-amber-900 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <div className="font-bold text-sm mb-0.5 text-amber-950">Managed by Admin Only</div>
          Customer celebration enquiries, quotations, status progressions, and bookings are managed exclusively by the Celibrate Admin concierge team. You have read-only visibility into the requirements and customer contact history. Confirmed bookings will automatically appear in your Bookings and Calendar.
        </div>
      </div>

      {/* Main Grid: Info + Pipeline Status & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Quotations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Pipeline Step Tracker (Read-Only) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Stage</h2>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" /> Stage updated by Admin
              </span>
            </div>
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
                <div
                  key={st}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-default transition-all ${
                    enquiry.status === st
                      ? "bg-rose-500 text-white font-bold shadow-sm ring-2 ring-rose-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </div>
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
                <p className="text-sm text-slate-700 italic">&ldquo;{enquiry.message}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Quotations Module for this Enquiry (Admin Prepared) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Formal Quotations</h3>
                <p className="text-xs text-slate-400">Proposals prepared by Celibrate Admin team</p>
              </div>
              <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                Managed by Admin
              </span>
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
                        {q.items?.length || 0} line items · Total: <span className="font-bold text-slate-800">₹{(q.grandTotal || q.total || 0).toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                    <Link
                      href={`/owner/quotations?viewId=${q.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Proposal
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No formal quotation sent by admin yet.
              </div>
            )}
          </div>

          {/* Activity & Interaction Timeline */}
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
              <p className="text-xs text-slate-400 py-4 text-center">No interactions recorded yet.</p>
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

          {/* Follow-Ups Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Follow-Ups</h3>
              <span className="text-[10px] text-gray-400 font-medium">By Admin</span>
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

          {/* Site Visits Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Site Visits</h3>
              <span className="text-[10px] text-gray-400 font-medium">By Admin</span>
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
    </div>
  );
}
