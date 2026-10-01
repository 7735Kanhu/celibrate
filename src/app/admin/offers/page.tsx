"use client";

import { Tag, Sparkles, Percent } from "lucide-react";

export default function AdminOffersPage() {
  const offers = [
    { title: "Early Bird Muhurat Booking", discount: "10% OFF", code: "MUHURAT2026", validity: "Valid till 30 Nov 2026", description: "Applicable on Kalyan Mandap full hall reservations" },
    { title: "Weekday Celebration Deal", discount: "₹15,000 Flat", code: "WEEKDAY15", validity: "Valid on Mon-Thu events", description: "Discount on catering and venue combo packages" },
    { title: "Corporate Annual Meet Combo", discount: "Free DJ & Sound", code: "CORPCELEB", validity: "Valid for 200+ guests", description: "Complimentary AV lighting rig for business banquets" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Offers & Promotional Campaigns</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Special booking promotions and seasonal voucher discounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((off) => (
          <div key={off.code} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600">
                {off.discount}
              </span>
              <span className="font-mono text-xs font-bold text-gray-400">{off.code}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{off.title}</h3>
            <p className="text-xs text-gray-600">{off.description}</p>
            <div className="pt-2 text-[11px] text-gray-400 border-t border-gray-50">{off.validity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
