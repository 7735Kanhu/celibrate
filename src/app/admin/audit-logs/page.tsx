"use client";

import { useEffect, useState } from "react";
import { History, Search, Shield, Filter, Calendar } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (entityFilter !== "ALL") params.set("entity", entityFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
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
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Audit & Accountability Log</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Immutable tracking trail of administrative approvals, booking conversions, payments, and setting changes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, user, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
        >
          <option value="ALL">All Entities</option>
          <option value="Venue">Venues</option>
          <option value="Booking">Bookings</option>
          <option value="BookingPayment">Payments</option>
          <option value="Quotation">Quotations</option>
          <option value="VenueOwnerProfile">Venue Owners</option>
          <option value="PlatformSetting">Settings</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User & Role</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Details / Delta</th>
                  <th className="py-3.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{log.userName || "System"}</div>
                      <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {log.userRole || "ADMIN"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-gray-900">{log.action}</span>
                    </td>

                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                    </td>

                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate font-mono text-[11px]">
                      {log.newValue || log.oldValue || "—"}
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-[11px] text-gray-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
