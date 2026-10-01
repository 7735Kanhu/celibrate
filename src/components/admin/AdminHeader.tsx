"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Shield, ExternalLink, Check, ChevronDown } from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminHeader({ onToggleSidebar, adminUser }: AdminHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Hamburger on mobile + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-gray-900">Platform Management System</h1>
          <p className="text-[11px] text-gray-500">Eastern India Event Discovery & Internal Booking ERP</p>
        </div>
      </div>

      {/* Right side: Public Site Link, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Link to public website */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-brand-600 hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <span>Live Customer Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-gray-50 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-600 hover:underline font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "/admin/dashboard"}
                      onClick={() => setShowNotifications(false)}
                      className={`block px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        !n.isRead ? "bg-brand-50/40" : ""
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-gray-900 leading-tight">{adminUser.name}</div>
            <div className="text-[10px] font-semibold text-brand-600">Platform Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
