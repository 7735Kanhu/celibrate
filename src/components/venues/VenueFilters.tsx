"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";

export default function VenueFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [eventType, setEventType] = useState(searchParams.get("eventType") || "");
  const [venueType, setVenueType] = useState(searchParams.get("venueType") || "");
  const [guestCapacity, setGuestCapacity] = useState(searchParams.get("guestCapacity") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",") || []
  );

  const amenitiesList = [
    "Air Conditioning", "Parking", "Generator Backup", "Kitchen", 
    "Bridal Room", "Guest Rooms", "Stage", "Sound System", "Wi-Fi", "Outdoor Lawn"
  ];

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (eventType) params.set("eventType", eventType);
    else params.delete("eventType");
    
    if (venueType) params.set("venueType", venueType);
    else params.delete("venueType");
    
    if (guestCapacity) params.set("guestCapacity", guestCapacity);
    else params.delete("guestCapacity");
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    else params.delete("amenities");

    params.set("page", "1"); // reset to page 1
    
    router.push(`/venues?${params.toString()}`);
  };

  const clearFilters = () => {
    setEventType("");
    setVenueType("");
    setGuestCapacity("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    router.push('/venues');
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters
        </h2>
        <button onClick={clearFilters} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Clear All
        </button>
      </div>

      {/* Event Type */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Type</h3>
        <select 
          className="input-field py-2.5"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="">All Events</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate-event">Corporate</option>
          <option value="engagement">Engagement</option>
          <option value="party">Party</option>
          <option value="reception">Reception</option>
        </select>
      </div>

      {/* Venue Type */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Venue Type</h3>
        <select 
          className="input-field py-2.5"
          value={venueType}
          onChange={(e) => setVenueType(e.target.value)}
        >
          <option value="">All Venues</option>
          <option value="Kalyan Mandap">Kalyan Mandap</option>
          <option value="Banquet Hall">Banquet Hall</option>
          <option value="Hotel">Hotel</option>
          <option value="Resort">Resort</option>
          <option value="Lawn">Lawn</option>
          <option value="Convention Centre">Convention Centre</option>
          <option value="Party Hall">Party Hall</option>
        </select>
      </div>

      {/* Guest Capacity */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Guest Capacity</h3>
        <div className="flex flex-col gap-2">
          {["50", "100", "200", "500", "1000", "2000"].map(cap => (
            <label key={cap} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="radio" 
                name="capacity" 
                value={cap}
                checked={guestCapacity === cap}
                onChange={() => setGuestCapacity(cap)}
                className="text-brand-500 focus:ring-brand-500" 
              />
              {cap}+ Guests
            </label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="input-field py-2 w-full text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="input-field py-2 w-full text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {amenitiesList.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="rounded text-brand-500 focus:ring-brand-500" 
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <button onClick={applyFilters} className="btn-primary w-full py-2.5 text-sm">
        Apply Filters
      </button>
    </div>
  );
}
