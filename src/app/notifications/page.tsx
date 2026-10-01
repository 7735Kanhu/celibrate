"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCheck,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "READ") return n.isRead;
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Real-time updates regarding enquiries, quotation proposals, follow-ups, and booking confirmations
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-rose-500" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["ALL", "UNREAD", "READ"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === tab
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab === "ALL" ? `All (${notifications.length})` : tab === "UNREAD" ? `Unread (${unreadCount})` : "Read"}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-500 border border-gray-200">
            No notifications in this view.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  !n.isRead
                    ? "bg-white border-rose-300 shadow-sm ring-1 ring-rose-100"
                    : "bg-white border-gray-200/80 opacity-80"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    !n.isRead ? "bg-rose-50 text-rose-500" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-sm ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-1 leading-relaxed">{n.message}</p>

                  <div className="mt-3 flex items-center justify-between">
                    {n.link ? (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span />
                    )}

                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
