"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Calendar, Plus } from "lucide-react";

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/venues") // Or direct fetch
      .catch(() => {});
    // Demo blog list from database
    setBlogs([
      { title: "Top 10 Best Wedding Venues & Kalyan Mandaps in Bhubaneswar", slug: "best-wedding-venues-in-bhubaneswar", category: "Destination Guides", readTime: "8 min read" },
      { title: "How Much Does a Wedding Venue Cost in Odisha? Complete Price Breakdown", slug: "wedding-venue-cost-guide-odisha", category: "Budget & Pricing", readTime: "5 min read" },
      { title: "The Ultimate Indian Wedding Planning Checklist (12-Month Timeline)", slug: "ultimate-indian-wedding-planning-checklist", category: "Checklists", readTime: "10 min read" },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Blog & Content Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Published editorial guides, venue cost breakdowns, and event checklists.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden divide-y divide-gray-50">
        {blogs.map((b) => (
          <div key={b.slug} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider block mb-1">
                {b.category}
              </span>
              <h3 className="text-sm font-bold text-gray-900">{b.title}</h3>
              <span className="text-xs text-gray-400 mt-0.5 block">{b.readTime}</span>
            </div>
            <Link
              href={`/blog/${b.slug}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Read Post</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
