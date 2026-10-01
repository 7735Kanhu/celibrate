"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  MessageCircle,
  Eye,
} from "lucide-react";

export default function OwnerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [internalFinancials, setInternalFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingOps, setSavingOps] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Event Operations State (Requirement 36)
  const [eventOps, setEventOps] = useState({
    notes: "",
    decorationInstructions: "",
    cateringInstructions: "",
    djInstructions: "",
    photographyInstructions: "",
    guestRequirements: "",
    specialRequests: "",
  });

  // Expense Modal State (Requirement 37)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "Food",
    title: "",
    amount: "",
    paidTo: "",
    notes: "",
  });
  const [addingExpense, setAddingExpense] = useState(false);

  // Payment Recording Modal (Requirement 31)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Selected Receipt for Preview/Print (Requirement 33)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();
      if (data.success && data.data?.booking) {
        const b = data.data.booking;
        setBooking(b);
        setInternalFinancials(data.data.internalFinancials || null);

        // Prepopulate event operations
        if (b.eventDetails) {
          setEventOps({
            notes: b.eventDetails.notes || "",
            decorationInstructions: b.eventDetails.decorationInstructions || "",
            cateringInstructions: b.eventDetails.cateringInstructions || "",
            djInstructions: b.eventDetails.djInstructions || "",
            photographyInstructions: b.eventDetails.photographyInstructions || "",
            guestRequirements: b.eventDetails.guestRequirements || "",
            specialRequests: b.eventDetails.specialRequests || "",
          });
        }
      } else {
        setError(data.error?.message || "Failed to load booking details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Booking status updated to ${newStatus}`);
        fetchBooking();
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert(data.error?.message || "Failed to update booking status");
      }
    } catch (err: any) {
      alert(err.message || "Error updating status");
    }
  };

  const handleSaveEventOps = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingOps(true);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventOperations: eventOps }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Event instructions & operations updated successfully");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert(data.error?.message || "Failed to save event operations");
      }
    } catch (err: any) {
      alert(err.message || "Error saving event operations");
    } finally {
      setSavingOps(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || Number(expenseForm.amount) <= 0) return;

    try {
      setAddingExpense(true);
      const res = await fetch(`/api/bookings/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowExpenseModal(false);
        setExpenseForm({ category: "Food", title: "", amount: "", paidTo: "", notes: "" });
        fetchBooking();
      } else {
        alert(data.error?.message || "Failed to record expense");
      }
    } catch (err: any) {
      alert(err.message || "Error adding expense");
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to remove this expense record?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}/expenses?expenseId=${expenseId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchBooking();
      } else {
        alert(data.error?.message || "Failed to delete expense");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting expense");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    try {
      setRecordingPayment(true);
      const res = await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(paymentAmount),
          paymentMethod,
          referenceNumber: paymentRef,
          notes: paymentNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentAmount("");
        setPaymentRef("");
        setPaymentNotes("");
        fetchBooking();
        if (data.data?.payment) {
          setSelectedReceipt(data.data.payment);
        }
      } else {
        alert(data.error?.message || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Error recording payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading booking records...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || "Access denied or booking record does not exist."}</p>
        <Link
          href="/owner/bookings"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>
      </div>
    );
  }

  const balanceDue = (booking.totalAmount || 0) - (booking.paidAmount || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/bookings"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
                {booking.bookingNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : booking.status === "CANCELLED"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {booking.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              {booking.customerName} — {booking.eventType}
            </h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {balanceDue > 0 && (
            <button
              onClick={() => {
                setPaymentAmount(balanceDue);
                setShowPaymentModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Record Payment
            </button>
          )}

          {/* Status selector */}
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700"
          >
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Internal Financial Ledger Card (Requirement 37, 41) - Internal to Venue Owner/Admin Only */}
      {internalFinancials && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Confidential Venue Financials (Internal Only)
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">Booking P&L & Profit Analysis</h2>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + Record Event Expense
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400">Agreed Revenue</span>
              <div className="text-base font-bold text-white mt-0.5">
                ₹{internalFinancials.totalRevenue?.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400">Received Advance</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                ₹{booking.paidAmount?.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400">Recorded Expenses</span>
              <div className="text-base font-bold text-rose-400 mt-0.5">
                ₹{internalFinancials.totalExpenses?.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400">Platform Comm.</span>
              <div className="text-base font-bold text-slate-300 mt-0.5">
                ₹{internalFinancials.platformCommission?.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-500/40">
              <span className="text-[11px] text-rose-300 font-semibold">Estimated Net Profit</span>
              <div className="text-lg font-black text-rose-200 mt-0.5">
                ₹{internalFinancials.estimatedProfit?.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Details, Payments, Operations & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Event Info, Payments, Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Event Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Event Specification</span>
              <span className="text-xs text-slate-400 font-normal">
                Venue: {booking.venue?.name} ({booking.venue?.city?.name})
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Event Date</span>
                <p className="text-slate-800 font-bold mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Time Slot</span>
                <p className="text-slate-800 font-bold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {booking.timeSlot || "Full Day"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Guest Headcount</span>
                <p className="text-slate-800 font-bold mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {booking.guestCount} Guests
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Total Agreed</span>
                <p className="text-slate-800 font-bold mt-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  ₹{booking.totalAmount?.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {booking.specialNotes && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Special Booking Agreement Notes:</span>
                <p className="text-slate-600">{booking.specialNotes}</p>
              </div>
            )}
          </div>

          {/* Payment Schedule & Receipts (Requirement 31, 32, 33) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Payment Schedule & Receipts</h3>
                <p className="text-xs text-slate-400">Track advances, scheduled installments, and generate receipts</p>
              </div>
              {balanceDue > 0 && (
                <button
                  onClick={() => {
                    setPaymentAmount(balanceDue);
                    setShowPaymentModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Payment
                </button>
              )}
            </div>

            {/* Scheduled Installments */}
            {booking.schedules && booking.schedules.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {booking.schedules.map((sc: any) => (
                  <div key={sc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 uppercase text-[10px]">{sc.installmentName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          sc.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sc.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-800">₹{sc.amount?.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-slate-400">
                      Due: {new Date(sc.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recorded Payments History */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Recorded Payment Receipts ({booking.payments?.length || 0})
              </span>
              {booking.payments && booking.payments.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method / Ref</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {booking.payments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{p.receiptNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-700">{p.paymentMethod}</span>
                            {p.referenceNumber && <span className="text-slate-400 block text-[10px]">{p.referenceNumber}</span>}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                            >
                              <Receipt className="w-3.5 h-3.5" /> View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No payment receipts recorded yet.</p>
              )}
            </div>
          </div>

          {/* Event Operations Form (Requirement 36) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Event Operations & Instructions</h3>
                <p className="text-xs text-slate-400">Logistics for mandap setup, buffet timings, and sound restrictions</p>
              </div>
              <button
                onClick={handleSaveEventOps}
                disabled={savingOps}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {savingOps ? "Saving..." : "Save Instructions"}
              </button>
            </div>

            <form onSubmit={handleSaveEventOps} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stage & Decoration Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Stage mandap must be ready by 4:00 PM. Bride entry floral walkway..."
                    value={eventOps.decorationInstructions}
                    onChange={(e) => setEventOps({ ...eventOps, decorationInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catering & Dining Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Vegetarian buffet on East Lawn. Welcome drinks start 6:30 PM..."
                    value={eventOps.cateringInstructions}
                    onChange={(e) => setEventOps({ ...eventOps, cateringInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DJ & Sound Setup</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sound check at 5:00 PM. Strict cut-off 10:00 PM."
                    value={eventOps.djInstructions}
                    onChange={(e) => setEventOps({ ...eventOps, djInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Photography & Video Team</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Drone operator clearance granted. Studio portrait booth in foyer."
                    value={eventOps.photographyInstructions}
                    onChange={(e) => setEventOps({ ...eventOps, photographyInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Guest Requirements & Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP seating in front row for senior family members. Wheelchair assistance required at gate."
                  value={eventOps.guestRequirements}
                  onChange={(e) => setEventOps({ ...eventOps, guestRequirements: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-rose-500"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Info & Internal Event Expenses */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Customer & Contact</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-base">
                {booking.customerName?.charAt(0) || "C"}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{booking.customerName}</h4>
                <p className="text-slate-400 text-[11px]">{booking.venue?.city?.name || "Bhubaneswar"}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${booking.customerPhone}`} className="hover:text-rose-600 font-medium">
                  {booking.customerPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{booking.customerEmail}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hello ${booking.customerName}, this is Celibrate regarding your upcoming booking ${booking.bookingNumber} at ${booking.venue?.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Send WhatsApp Message
            </a>
          </div>

          {/* Internal Expenses List (Requirement 37) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Internal Event Expenses</h3>
                <p className="text-[10px] text-slate-400">Food, Staff, Decor costs</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-rose-600 font-bold hover:text-rose-700 text-xs"
              >
                + Add
              </button>
            </div>

            {booking.eventDetails?.expenses && booking.eventDetails.expenses.length > 0 ? (
              <div className="space-y-2.5">
                {booking.eventDetails.expenses.map((exp: any) => (
                  <div key={exp.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{exp.description || exp.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {exp.category} {exp.recordedByName && `· ${exp.recordedByName}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600">₹{exp.amount.toLocaleString("en-IN")}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No event expenses recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Record Internal Event Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="Food">Food & Catering</option>
                  <option value="Decoration">Stage & Mandap Decor</option>
                  <option value="Staff">Venue Staff & Housekeeping</option>
                  <option value="Electricity">Electricity & Generator Diesel</option>
                  <option value="Cleaning">Post-Event Sanitization</option>
                  <option value="Vendor">External Vendor</option>
                  <option value="Transport">Transport & Logistics</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandap fresh flower procurement"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Spent (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 25000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paid To (Vendor/Contractor)</label>
                <input
                  type="text"
                  placeholder="e.g. Flora Decorators"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingExpense}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-200"
                >
                  {addingExpense ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Record Payment Installment</h3>
                <p className="text-[10px] text-slate-400">Total Due: ₹{balanceDue.toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-928174 or CHQ-0012"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  {recordingPayment ? "Saving..." : "Record & Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PAYMENT RECEIPT MODAL (Requirement 33) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="font-bold text-slate-800 text-sm">Payment Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="p-1 text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-4 print:border-none print:p-0 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xl font-black text-rose-500 tracking-tight">CELIBRATE</div>
                  <p className="text-[10px] text-slate-400">Official Payment Receipt</p>
                  <p className="font-bold text-slate-700 mt-2">{booking.venue?.name}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-slate-800">{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-semibold text-slate-800">{booking.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
                {selectedReceipt.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Ref:</span>
                    <span className="font-mono text-slate-800">{selectedReceipt.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                  <span className="text-slate-800">Amount Paid:</span>
                  <span className="text-emerald-600 text-base">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>Authorized Celibrate Venue Partner</span>
                <span>Automated Computer Generated Receipt</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
