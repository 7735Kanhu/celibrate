"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle, Percent, Phone, Mail, MessageSquare, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    platform_name: "Celibrate",
    tagline: "Find the Perfect Place for Every Celebration",
    contact_phone: "+91 98765 43210",
    contact_email: "support@celibrate.in",
    whatsapp_number: "919876543210",
    commission_type: "PERCENTAGE",
    commission_rate: "5.0",
    currency: "INR",
    currency_symbol: "₹",
    tax_rate: "18.0",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data.map) {
        setSettings((prev) => ({ ...prev, ...json.data.map }));
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
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Configuration & Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Configure commission rate, currency parameters, support contacts, and business rules.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8">
        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Platform settings saved and applied successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Commission Engine (Requirement 41) */}
          <div className="bg-brand-50/40 p-5 rounded-2xl border border-brand-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-brand-600" />
              Platform Commission Architecture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Commission Type</label>
                <select
                  value={settings.commission_type}
                  onChange={(e) => setSettings({ ...settings, commission_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Commission Value *</label>
                <input
                  type="text"
                  required
                  value={settings.commission_rate}
                  onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                  placeholder="5.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-xs focus:outline-none focus:border-brand-500"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Example: 5% of ₹5,25,000 = ₹26,250 platform revenue.
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Support Settings */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Support & Communication Channels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Platform Currency</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
