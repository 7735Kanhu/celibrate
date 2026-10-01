"use client";

import { useEffect, useState } from "react";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function OwnerSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
  });

  const [notifications, setNotifications] = useState({
    newEnquiry: true,
    followUpReminder: true,
    bookingConfirmation: true,
    smsAlerts: false,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.user) {
        setProfile(json.user);
        setFormData({
          name: json.user.name || "",
          phone: json.user.phone || "",
          city: json.user.city || "",
        });
      }
    } catch (err: any) {
      setError("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Profile settings updated successfully!");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(json.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Owner Account & Business Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified venue manager profile, contact information, and notifications
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-rose-500" />
          Profile Information
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">City / Region *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-sm shadow-rose-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          Alerts & Notification Preferences
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-semibold text-slate-800 block">Instant New Enquiry Notification</span>
              <span className="text-[11px] text-slate-400">Receive alert when customer submits enquiry for your venue</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.newEnquiry}
              onChange={(e) => setNotifications({ ...notifications, newEnquiry: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-semibold text-slate-800 block">Daily Follow-up Reminders</span>
              <span className="text-[11px] text-slate-400">Receive reminder of pending customer follow-ups and site visits</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.followUpReminder}
              onChange={(e) => setNotifications({ ...notifications, followUpReminder: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-semibold text-slate-800 block">Booking Confirmation & Advance Payment Alerts</span>
              <span className="text-[11px] text-slate-400">Notification when internal bookings or payments are logged</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.bookingConfirmation}
              onChange={(e) => setNotifications({ ...notifications, bookingConfirmation: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
