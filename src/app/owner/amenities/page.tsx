"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Wind,
  Car,
  Zap,
  Utensils,
  Heart,
  Bed,
  Mic2,
  Volume2,
  Wifi,
  Coffee,
  ArrowUpDown,
  Sun,
  Accessibility,
  Save,
  Building2,
} from "lucide-react";

const AMENITY_ICONS: Record<string, any> = {
  AC: Wind,
  Parking: Car,
  Generator: Zap,
  Kitchen: Utensils,
  "Bridal Room": Heart,
  "Guest Rooms": Bed,
  Stage: Mic2,
  "Sound System": Volume2,
  "Wi-Fi": Wifi,
  "Dining Area": Coffee,
  Lift: ArrowUpDown,
  "Outdoor Area": Sun,
  "Wheelchair Access": Accessibility,
};

export default function OwnerAmenitiesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [standardAmenities, setStandardAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/venue");
      const json = await res.json();
      if (json.success && json.data?.venues) {
        setVenues(json.data.venues);
        if (json.data.venues.length > 0) {
          const firstId = json.data.venues[0].id;
          setSelectedVenueId(firstId);
          fetchAmenities(firstId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async (venueId: string) => {
    try {
      const res = await fetch(`/api/owner/amenities?venueId=${venueId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedAmenities(json.data.activeList || []);
        setStandardAmenities(json.data.standardAmenities || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleToggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedVenueId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/owner/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: selectedVenueId,
          selectedAmenities,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert(json.error?.message || "Failed to save amenities");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Venue Amenities & Facilities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the amenities available at your venue to showcase to prospective customers
          </p>
        </div>

        {venues.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedVenueId}
              onChange={(e) => {
                setSelectedVenueId(e.target.value);
                fetchAmenities(e.target.value);
              }}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-200 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Amenities"}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Amenities updated successfully for this venue!
        </div>
      )}

      {/* Selectable Amenities Cards Grid (Requirement 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {standardAmenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity);
          const Icon = AMENITY_ICONS[amenity] || CheckCircle;

          return (
            <div
              key={amenity}
              onClick={() => handleToggleAmenity(amenity)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between select-none ${
                isSelected
                  ? "bg-rose-50/70 border-rose-400 shadow-sm ring-1 ring-rose-400"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-rose-500 text-white shadow-sm shadow-rose-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="mt-4">
                <h3 className={`text-sm font-bold ${isSelected ? "text-rose-900" : "text-slate-800"}`}>
                  {amenity}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isSelected ? "Available at venue" : "Click to enable"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
