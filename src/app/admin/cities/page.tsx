"use client";

import { useEffect, useState } from "react";
import { MapPin, Building2, Plus } from "lucide-react";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const json = await res.json();
      if (json.cities) {
        setCities(json.cities);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cities & Neighborhood Areas</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Hierarchy: State → City → Neighborhoods / Localities (e.g. Odisha → Bhubaneswar → Patia, Chandrasekharpur).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cities.map((city) => (
          <div key={city.id} className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider">
                  {city.state}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{city.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                {city.venueCount} Venues
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Registered Neighborhood Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {city.areas?.map((area: any) => (
                  <span
                    key={area.id}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg font-medium"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
