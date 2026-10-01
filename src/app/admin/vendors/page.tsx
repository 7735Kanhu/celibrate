"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Star, Phone, MapPin } from "lucide-react";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      const json = await res.json();
      if (json.vendors) {
        setVendors(json.vendors);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vendor Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage preferred partner services: Catering, Decor, Photography, DJs, Makeup, and Event Planners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div key={v.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {v.category}
                </span>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{v.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{v.city}</span>
                </div>
              </div>
              <span className="text-amber-500 font-bold text-xs">★ {v.rating}</span>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">{v.description}</p>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">{v.startingPrice}</span>
              <a href={`tel:${v.phone}`} className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" /> {v.phone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
