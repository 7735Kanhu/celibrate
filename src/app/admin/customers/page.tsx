"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  MessageSquareText,
  CalendarCheck2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  X,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data.customers);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch {
      alert("Failed to update customer status");
    }
  };

  const handleViewDetail = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const json = await res.json();
      if (json.success) {
        setCustomerDetail(json.data);
      }
    } catch {
      alert("Failed to load customer profile");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Directory of registered customers, enquiry submissions, and confirmed celebration bookings.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone or city..."
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
          <option value="ALL">All Customers</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Deactivated</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Enquiries</th>
                  <th className="py-3.5 px-4">Bookings</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{c.id.slice(0, 8)}...</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{c.phone || "—"}</div>
                      <div className="text-[11px] text-gray-400">{c.email}</div>
                    </td>

                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {c.city || "Bhubaneswar"}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900">{c._count?.enquiries || 0}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-600">{c.totalBookings || 0}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(c.id)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View customer history"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            c.isActive
                              ? "bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Customer Profile & Celebration History</h2>
                <p className="text-xs text-gray-500">Trace from enquiries to internal bookings</p>
              </div>
              <button onClick={() => setSelectedCustomerId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading details...</div>
            ) : customerDetail ? (
              <div className="space-y-6 text-xs">
                {/* Personal Info */}
                <div className="bg-gray-50 p-4 rounded-2xl grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 font-semibold block">Customer Name</span>
                    <span className="font-bold text-sm text-gray-900">{customerDetail.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Email Address</span>
                    <span className="font-bold text-gray-800">{customerDetail.customer.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Phone</span>
                    <span className="font-bold text-gray-800">{customerDetail.customer.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">City</span>
                    <span className="font-bold text-gray-800">{customerDetail.customer.city || "Bhubaneswar"}</span>
                  </div>
                </div>

                {/* Enquiries History */}
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                    <MessageSquareText className="w-4 h-4 text-brand-500" />
                    Enquiry History ({customerDetail.customer.enquiries?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {customerDetail.customer.enquiries?.map((enq: any) => (
                      <div key={enq.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{enq.eventType} • {enq.venue?.name}</div>
                          <div className="text-[11px] text-gray-500">{enq.enquiryNumber} • {new Date(enq.eventDate).toLocaleDateString()}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600">
                          {enq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirmed Bookings History */}
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                    <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                    Confirmed Bookings ({customerDetail.bookings?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {customerDetail.bookings?.length === 0 ? (
                      <p className="text-gray-400 italic">No confirmed bookings yet.</p>
                    ) : (
                      customerDetail.bookings?.map((bk: any) => (
                        <div key={bk.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{bk.bookingNumber} • {bk.venue?.name}</div>
                            <div className="text-[11px] text-gray-500">
                              Event Date: {new Date(bk.eventDate).toLocaleDateString()} • {bk.eventType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-gray-900">₹{bk.totalAmount?.toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">{bk.paymentStatus}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
