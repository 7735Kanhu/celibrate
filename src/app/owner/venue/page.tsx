"use client";

import { useEffect, useState } from "react";
import { Building2, Save, CheckCircle, MapPin, Users, IndianRupee, Layers } from "lucide-react";

export default function OwnerVenuePage() {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchVenue();
  }, []);

  const fetchVenue = async () => {
    try {
      const res = await fetch("/api/owner/venue");
      const json = await res.json();
      if (json.success) {
        setVenue(json.data.venue);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/owner/venue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: venue.id,
          name: venue.name,
          type: venue.type,
          description: venue.description,
          address: venue.address,
          capacity: venue.capacity,
          startingPrice: venue.startingPrice,
          parkingCap: venue.parkingCap,
          roomCount: venue.roomCount,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to update venue details");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading venue profile...</div>;
  }

  if (!venue) {
    return <div className="p-12 text-center text-xs text-gray-500">No venue linked to this account.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Venue Profile & Information</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Manage your primary venue details, pricing, guest capacities, and location specifications.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8">
        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Venue details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Basic Info */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Basic Venue Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Venue Type *</label>
                <select
                  value={venue.type}
                  onChange={(e) => setVenue({ ...venue, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Kalyan Mandap">Kalyan Mandap</option>
                  <option value="Banquet Hall">Banquet Hall</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Lawn">Lawn</option>
                  <option value="Convention Centre">Convention Centre</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={venue.description}
                  onChange={(e) => setVenue({ ...venue, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Capacity & Pricing */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Capacities & Base Rental Pricing
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  value={venue.capacity}
                  onChange={(e) => setVenue({ ...venue, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Starting Price (₹)</label>
                <input
                  type="number"
                  value={venue.startingPrice}
                  onChange={(e) => setVenue({ ...venue, startingPrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Parking Slots</label>
                <input
                  type="number"
                  value={venue.parkingCap || 0}
                  onChange={(e) => setVenue({ ...venue, parkingCap: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">AC Rooms Count</label>
                <input
                  type="number"
                  value={venue.roomCount || 0}
                  onChange={(e) => setVenue({ ...venue, roomCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Location & Address
            </h2>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Physical Address</label>
              <input
                type="text"
                required
                value={venue.address}
                onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Venue Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
