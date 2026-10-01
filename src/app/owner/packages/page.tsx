"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  IndianRupee,
  Users,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function OwnerPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    venueId: "",
    name: "Premium Wedding Package",
    price: 175000,
    guestLimit: 300,
    description: "All-inclusive celebration bundle with hall rental, mandap decor, DJ, and bridal suite.",
    includes: ["Venue Rental", "Decoration & Stage", "DJ & Lighting", "Generator Backup", "Bridal Room", "Valet Parking"],
  });
  const [includeInput, setIncludeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/packages");
      const json = await res.json();
      if (json.success && json.data?.packages) {
        setPackages(json.data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await fetch("/api/owner/venue");
      const json = await res.json();
      if (json.success && json.data?.venues) {
        setVenues(json.data.venues);
        if (json.data.venues.length > 0 && !formData.venueId) {
          setFormData((prev) => ({ ...prev, venueId: json.data.venues[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load venues:", err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchVenues();
  }, []);

  const handleAddInclude = () => {
    if (!includeInput.trim()) return;
    if (!formData.includes.includes(includeInput.trim())) {
      setFormData({ ...formData, includes: [...formData.includes, includeInput.trim()] });
    }
    setIncludeInput("");
  };

  const handleRemoveInclude = (idx: number) => {
    setFormData({ ...formData, includes: formData.includes.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.venueId || !formData.name || !formData.price) return;

    try {
      setSubmitting(true);
      if (editingPackageId) {
        const res = await fetch("/api/owner/packages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPackageId,
            ...formData,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setShowModal(false);
          setEditingPackageId(null);
          fetchPackages();
        } else {
          alert(json.error?.message || "Failed to update package");
        }
      } else {
        const res = await fetch("/api/owner/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setShowModal(false);
          fetchPackages();
        } else {
          alert(json.error?.message || "Failed to create package");
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = (pkg: any) => {
    let incList = [];
    try {
      incList = typeof pkg.includes === "string" ? JSON.parse(pkg.includes) : pkg.includes;
    } catch (e) {
      incList = [pkg.includes];
    }
    setFormData({
      venueId: pkg.venueId,
      name: `${pkg.name} (Copy)`,
      price: pkg.price,
      guestLimit: pkg.guestLimit,
      description: pkg.description || "",
      includes: Array.isArray(incList) ? incList : [],
    });
    setEditingPackageId(null);
    setShowModal(true);
  };

  const handleToggleActive = async (pkg: any) => {
    try {
      await fetch("/api/owner/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id, isActive: !pkg.isActive }),
      });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/owner/packages?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPackages();
      } else {
        alert(json.error?.message || "Failed to delete package");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Venue Event Packages</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure pre-packaged celebration tiers (Basic, Premium, Luxury) to speed up customer quotations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPackageId(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-rose-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Package
        </button>
      </div>

      {/* Packages Grid (Requirement 18) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading venue packages...</div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
          No packages created yet. Click "Create New Package" to build your first bundle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            let incList: string[] = [];
            try {
              incList = typeof pkg.includes === "string" ? JSON.parse(pkg.includes) : pkg.includes;
            } catch (e) {
              incList = typeof pkg.includes === "string" ? [pkg.includes] : [];
            }
            if (!Array.isArray(incList)) incList = [];

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                  pkg.isActive ? "border-slate-200/80 hover:shadow-md" : "border-slate-200 opacity-60 bg-slate-50/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {pkg.venue?.name}
                    </span>
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                      title={pkg.isActive ? "Deactivate" : "Activate"}
                    >
                      {pkg.isActive ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400">Inactive</span>
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mt-2">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Package Price</span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Guest Limit</span>
                      <div className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3 text-indigo-500" />
                        Up to {pkg.guestLimit} Guests
                      </div>
                    </div>
                  </div>

                  {/* Included Services List */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Included In This Bundle:
                    </span>
                    {incList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPackageId(pkg.id);
                        setFormData({
                          venueId: pkg.venueId,
                          name: pkg.name,
                          price: pkg.price,
                          guestLimit: pkg.guestLimit,
                          description: pkg.description || "",
                          includes: incList,
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Edit package"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(pkg)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Duplicate package"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PACKAGE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingPackageId ? "Edit Package" : "Create Event Package"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Venue *</label>
                <select
                  required
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="">Select venue...</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding Luxury Package"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Package Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Guests Limit *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formData.guestLimit}
                    onChange={(e) => setFormData({ ...formData, guestLimit: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-rose-500"
                />
              </div>

              {/* Included Services Tags */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Included Services</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Sound System & DJ"
                    value={includeInput}
                    onChange={(e) => setIncludeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInclude();
                      }
                    }}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddInclude}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.includes.map((inc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
                    >
                      {inc}
                      <button
                        type="button"
                        onClick={() => handleRemoveInclude(i)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-200"
                >
                  {submitting ? "Saving..." : editingPackageId ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
