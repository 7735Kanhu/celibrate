"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Plus,
  Edit,
  Eye,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: "",
    type: "Kalyan Mandap",
    cityId: "",
    address: "",
    capacity: 500,
    startingPrice: 100000,
    description: "",
  });

  useEffect(() => {
    fetchVenues();
  }, [statusFilter, cityFilter, search]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (cityFilter !== "ALL") params.set("city", cityFilter);

      const res = await fetch(`/api/admin/venues?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVenues(json.data.venues);
        setCities(json.data.cities);
        if (!newVenue.cityId && json.data.cities.length > 0) {
          setNewVenue((prev) => ({ ...prev, cityId: json.data.cities[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch venues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (venueId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/venues/${venueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchVenues();
      }
    } catch {
      alert("Failed to update venue status");
    }
  };

  const handleToggleFeatured = async (venueId: string, currentVal: boolean) => {
    try {
      await fetch(`/api/admin/venues/${venueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentVal }),
      });
      fetchVenues();
    } catch {
      alert("Failed to toggle feature");
    }
  };

  const handleArchiveVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to archive this venue?")) return;
    try {
      await fetch(`/api/admin/venues/${venueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARCHIVE" }),
      });
      fetchVenues();
    } catch {
      alert("Failed to archive venue");
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVenue),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchVenues();
      } else {
        alert(json.error?.message || "Failed to create venue");
      }
    } catch {
      alert("Error creating venue");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Venue Directory Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Oversee venue verification, approval status, ratings, capacity, and active listings.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Venue</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search venue name, address, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Venues Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading venues data...</div>
        ) : venues.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No venues match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Venue & Location</th>
                  <th className="py-3.5 px-4">Owner / Partner</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Capacity & Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Enquiries / Bookings</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {venues.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-gray-900">{v.name}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5 truncate max-w-xs">
                        {v.address}, {v.city?.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          ★ {v.rating} <span className="text-gray-400 font-normal">({v.reviewCount})</span>
                        </span>
                        {v.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-semibold text-[10px]">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {v.owner ? (
                        <div>
                          <div className="font-semibold text-gray-800">{v.owner.name}</div>
                          <div className="text-[11px] text-gray-400">{v.owner.ownerProfile?.businessName || v.owner.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Celibrate Direct</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-gray-700 font-medium">{v.type}</td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{v.capacity} guests</div>
                      <div className="text-gray-500 text-[11px]">Starts ₹{v.startingPrice?.toLocaleString("en-IN")}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          v.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : v.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : v.status === "SUSPENDED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{v._count?.enquiries || 0} enquiries</div>
                      <div className="text-emerald-600 font-semibold text-[11px]">
                        {v._count?.bookings || 0} confirmed
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/venues/${v.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View live public page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleToggleFeatured(v.id, v.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            v.isFeatured ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-500"
                          }`}
                          title="Toggle Featured"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        {v.status !== "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, "APPROVED")}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve Venue"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {v.status === "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, "SUSPENDED")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Suspend Venue"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleArchiveVenue(v.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Archive Venue"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add New Venue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add New Venue Listing</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  placeholder="e.g. Grand Celebration Lawn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type *</label>
                  <select
                    value={newVenue.type}
                    onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Kalyan Mandap">Kalyan Mandap</option>
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Lawn">Lawn</option>
                    <option value="Convention Centre">Convention Centre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City *</label>
                  <select
                    value={newVenue.cityId}
                    onChange={(e) => setNewVenue({ ...newVenue, cityId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                  placeholder="e.g. Plot 45, Patia, Bhubaneswar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guest Capacity</label>
                  <input
                    type="number"
                    value={newVenue.capacity}
                    onChange={(e) => setNewVenue({ ...newVenue, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={newVenue.startingPrice}
                    onChange={(e) => setNewVenue({ ...newVenue, startingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold"
                >
                  Create Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
