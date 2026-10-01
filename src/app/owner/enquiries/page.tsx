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
  ChevronRight,
} from "lucide-react";

export default function OwnerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const kanbanColumns = [
    { id: "NEW", title: "New Lead", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { id: "CONTACTED", title: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "SITE_VISIT", title: "Site Visit", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "QUOTATION_SENT", title: "Quotation Sent", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "NEGOTIATION", title: "Negotiation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { id: "ADVANCE_PENDING", title: "Advance Due", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { id: "BOOKED", title: "Confirmed Booking", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
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
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Venue Enquiries Pipeline</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Track customer celebration leads from first enquiry to locked booking.
          </p>
        </div>

        {/* View Toggle */}
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
            placeholder="Search by customer name, phone, or enquiry #..."
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

      {/* KANBAN BOARD */}
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
                    <Link
                      key={enq.id}
                      href={`/owner/enquiries/${enq.id}`}
                      className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-brand-300 shadow-2xs hover:shadow-sm transition-all space-y-2 block group"
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
                          {enq.eventType} ({enq.guestCount} guests)
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                        <span>{enq.customerPhone}</span>
                        <span className="text-brand-600 font-semibold group-hover:underline">Manage →</span>
                      </div>
                    </Link>
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
                  <th className="py-3.5 px-4">Event Date & Slot</th>
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
                      <Link
                        href={`/owner/enquiries/${enq.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        Open Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
