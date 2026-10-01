"use client";

import { useEffect, useState } from "react";
import { Layers, Heart, Cake, Sparkles, GlassWater, Award, Briefcase, Presentation, Music, Baby, Users } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.categories) {
        setCategories(json.categories);
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Event Categories Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Standard celebration categories configured across Celibrate venue discovery filters.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>
              <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                /{c.slug}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
            <div className="pt-2 text-[11px] text-brand-600 font-semibold">
              Active Category
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
