"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export default function VendorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");

  const vendorCategories = [
    "Photography", "Catering", "Decoration", "Makeup", 
    "DJ", "Mehendi", "Event Planner", "Invitation", "Transportation"
  ];

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) params.set("category", category);
    else params.delete("category");
    
    if (minRating) params.set("minRating", minRating);
    else params.delete("minRating");

    params.set("page", "1"); // reset to page 1
    
    router.push(`/vendors?${params.toString()}`);
  };

  const clearFilters = () => {
    setCategory("");
    setMinRating("");
    router.push('/vendors');
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

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Service</h3>
        <select 
          className="input-field py-2.5"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Services</option>
          {vendorCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Minimum Rating */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="flex flex-col gap-2">
          {["4.5", "4.0", "3.5", "3.0"].map(rating => (
            <label key={rating} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="radio" 
                name="rating" 
                value={rating}
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="text-brand-500 focus:ring-brand-500" 
              />
              {rating}+ Stars
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
