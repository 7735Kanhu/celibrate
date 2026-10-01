"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Calendar,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchOwners();
  }, [statusFilter, search]);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/owners?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOwners(json.data.owners);
      }
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ownerId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/owners/${ownerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchOwners();
      } else {
        alert(json.error?.message || "Failed to update status");
      }
    } catch {
      alert("Error updating owner status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Venue Owner Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Verify business credentials, approve new venue applications, and manage partner accounts.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by owner name, business, phone or email..."
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
          <option value="ALL">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Verification</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading owner accounts...</div>
        ) : owners.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No venue owners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Owner & Business</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Managed Venues</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {owners.map((o) => {
                  const venuesList = o.user?.venues || [];
                  const isPending = o.status === "PENDING_APPROVAL";

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-gray-900">{o.ownerName}</div>
                        <div className="text-gray-500 text-[11px] mt-0.5 font-medium">{o.businessName}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">{o.phone}</div>
                        <div className="text-[11px] text-gray-400">{o.email}</div>
                      </td>

                      <td className="py-4 px-4 text-gray-700 font-medium">
                        {o.city}
                      </td>

                      <td className="py-4 px-4">
                        {venuesList.length > 0 ? (
                          <div className="space-y-1">
                            {venuesList.map((v: any) => (
                              <div key={v.id} className="flex items-center gap-1.5 font-semibold text-gray-900">
                                <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                                <span>{v.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No venue attached</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : o.status === "PENDING_APPROVAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                              : o.status === "SUSPENDED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {o.status === "PENDING_APPROVAL" ? "Pending Approval" : o.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(o.id, "APPROVED")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                                title="Approve Owner Account"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id, "REJECTED")}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px]"
                                title="Reject Application"
                              >
                                Reject
                              </button>
                            </>
                          ) : o.status === "APPROVED" ? (
                            <button
                              onClick={() => handleUpdateStatus(o.id, "SUSPENDED")}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-[11px]"
                              title="Suspend Account"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(o.id, "APPROVED")}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px]"
                              title="Reactivate Account"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
