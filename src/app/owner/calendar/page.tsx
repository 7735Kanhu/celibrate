"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  IndianRupee,
  CheckCircle,
  X,
  Building2,
} from "lucide-react";

export default function OwnerCalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Oct 2026
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success) {
        setBookings(json.data.bookings);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Venue Booking Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time visual event calendar, date availability, and double-booking protection tracking.
          </p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "month" ? "bg-brand-500 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "week" ? "bg-brand-500 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "day" ? "bg-brand-500 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-900 px-2">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Legends */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <span className="font-bold text-gray-400 uppercase text-[10px]">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Confirmed / Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" /> Advance Hold
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Completed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" /> Cancelled
        </div>
      </div>

      {/* Visual Calendar Grid (Month View) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden p-4 sm:p-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty cells before month start */}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-gray-50/50 rounded-2xl p-2" />
          ))}

          {/* Days of the month */}
          {[...Array(totalDays)].map((_, i) => {
            const dayNum = i + 1;
            const currentDayDate = new Date(year, month, dayNum);

            // Find bookings for this day
            const dayBookings = bookings.filter((b) => {
              const bDate = new Date(b.eventDate);
              return (
                bDate.getFullYear() === year &&
                bDate.getMonth() === month &&
                bDate.getDate() === dayNum
              );
            });

            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[90px] sm:min-h-[110px] rounded-2xl p-2 border transition-all flex flex-col justify-between ${
                  isToday
                    ? "bg-brand-50/30 border-brand-200"
                    : dayBookings.length > 0
                    ? "bg-white border-gray-200 shadow-2xs"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className={isToday ? "w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[11px]" : ""}>
                    {dayNum}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>

                {/* Day Bookings badges */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {dayBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="w-full text-left p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold truncate block transition-colors shadow-2xs"
                    >
                      {b.customerName} ({b.eventType})
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-gray-400 font-medium">
                  {dayBookings.length === 0 ? "Open" : `${dayBookings.length} Booked`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Detail Modal (Requirement 29) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 text-xs shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">
                  {selectedBooking.bookingNumber}
                </span>
                <h3 className="text-base font-bold text-gray-900">Reservation Details</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Customer:</span>
                <span className="font-bold text-gray-900">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Event:</span>
                <span className="font-semibold text-gray-800">{selectedBooking.eventType}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Event Date & Slot:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(selectedBooking.eventDate).toLocaleDateString()} ({selectedBooking.timeSlot})
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Guest Count:</span>
                <span className="font-semibold text-gray-900">{selectedBooking.guestCount} guests</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Total Amount:</span>
                <span className="font-black text-gray-900">₹{selectedBooking.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Payment Status:</span>
                <span className="font-bold text-emerald-600">{selectedBooking.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Booking Status:</span>
                <span className="font-bold text-brand-600">{selectedBooking.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href={`/owner/bookings`}
                className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-xs"
              >
                Go to Bookings Management →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
