"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.append("city", location.toLowerCase());
    if (eventType) params.append("eventType", eventType);
    if (guests) params.append("guestCapacity", guests);
    
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 md:p-6 mt-8 max-w-4xl mx-auto border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-4">
        
        <div className="w-full md:flex-1 relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">LOCATION</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. Bhubaneswar" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:flex-1 relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">EVENT</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none appearance-none"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">Select Event</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Reception">Reception</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Party">Party</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-32 relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">GUESTS</label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="number" 
              placeholder="500" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all shadow-soft flex items-center justify-center h-[50px]"
        >
          Search Venues
        </button>

      </form>
    </div>
  );
}
