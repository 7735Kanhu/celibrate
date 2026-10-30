"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  X,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  Building2,
  CalendarCheck,
  MessageSquareText,
} from "lucide-react";

function OwnerCustomersContent() {
  const searchParams = useSearchParams();
  const venueIdParam = searchParams.get("venueId");

  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCustomers: 0,
    bookedCustomers: 0,
    leadCustomers: 0,
    repeatCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "BOOKED" | "LEADS" | "REPEAT">("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "SPENT" | "BOOKINGS" | "NAME">("RECENT");

  // Selected customer for history drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (venueIdParam) params.set("venueId", venueIdParam);

      const res = await fetch(`/api/owner/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(json.data.customers || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [venueIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  // Dynamic Filtering & Sorting
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Filter
    if (filterType === "BOOKED") {
      result = result.filter((c) => c.bookingCount > 0);
    } else if (filterType === "LEADS") {
      result = result.filter((c) => c.bookingCount === 0 && c.enquiryCount > 0);
    } else if (filterType === "REPEAT") {
      result = result.filter((c) => c.bookingCount > 1 || (c.bookingCount >= 1 && c.enquiryCount > 1));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "RECENT") {
        const dateA = a.latestDate ? new Date(a.latestDate).getTime() : 0;
        const dateB = b.latestDate ? new Date(b.latestDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "SPENT") {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      if (sortBy === "BOOKINGS") {
        return (b.bookingCount || 0) - (a.bookingCount || 0);
      }
      if (sortBy === "NAME") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return result;
  }, [customers, filterType, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Venue Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles and celebration history of clients who have enquired or booked at your managed venue
          </p>
        </div>
      </div>

      {/* Dynamic Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalCustomers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Unique customer profiles</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.bookedCustomers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Clients with confirmed events</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pipeline Leads</span>
            <MessageSquareText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.leadCustomers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Enquiries awaiting confirmation</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Repeat Clients</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{stats.repeatCustomers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Clients with multiple events</div>
        </div>
      </div>

      {/* Search & Dynamic Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, email, or event..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchCustomers(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-rose-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="bg-transparent font-medium text-slate-700 pr-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Clients ({stats.totalCustomers})</option>
              <option value="BOOKED">Confirmed Bookings ({stats.bookedCustomers})</option>
              <option value="LEADS">Pipeline Leads ({stats.leadCustomers})</option>
              <option value="REPEAT">Repeat Clients ({stats.repeatCustomers})</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-slate-700 pr-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="RECENT">Recent Activity</option>
              <option value="SPENT">Highest Booking Value</option>
              <option value="BOOKINGS">Most Bookings</option>
              <option value="NAME">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading customers...</div>
        ) : filteredAndSortedCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No customers found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Enquiries / Bookings</th>
                  <th className="py-3 px-4">Latest Event</th>
                  <th className="py-3 px-4">Total Value</th>
                  {/* <th className="py-3 px-4 text-right">Quick Contact</th> */}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{c.name}</span>
                            {(c.bookingCount > 1 || (c.bookingCount >= 1 && c.enquiryCount > 1)) && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                VIP Repeat
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">Client Profile</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{c.phone || "—"}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.city}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-100">
                          {c.enquiryCount} Enquiries
                        </span>
                        {c.bookingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                            {c.bookingCount} Booked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.latestEvent || "Celebration"}</div>
                      {c.latestDate && (
                        <div className="text-[10px] text-slate-400">
                          {new Date(c.latestDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString("en-IN")}` : "—"}
                      </div>
                    </td>
                    {/* <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${c.name}, this is Celibrate reaching out regarding your event venue enquiry.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td> */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 hover:border-brand-200 font-semibold text-xs transition-colors"
                        title="View client history"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Celebration History Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                  {selectedCustomer.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCustomer.phone} • {selectedCustomer.city}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Financial & Booking Summary Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bookings</span>
                  <div className="text-sm font-black text-emerald-600 mt-0.5">
                    {selectedCustomer.bookingCount}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Enquiries</span>
                  <div className="text-sm font-black text-brand-600 mt-0.5">
                    {selectedCustomer.enquiryCount}
                  </div>
                </div>
              </div>

              {/* Confirmed Bookings Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Confirmed Celebrations ({selectedCustomer.bookings?.length || 0})</span>
                  <Link href="/owner/bookings" className="text-[10px] text-brand-600 font-semibold hover:underline">
                    View All Bookings →
                  </Link>
                </h3>

                {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.bookings.map((b: any) => (
                      <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {b.status}
                          </span>
                        </div>
                        <div className="text-slate-700 font-semibold">
                          {b.eventType} on {new Date(b.eventDate).toLocaleDateString()} ({b.timeSlot})
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Total: ₹{b.totalAmount.toLocaleString("en-IN")}</span>
                          <span className="text-emerald-700 font-semibold">Paid: ₹{b.paidAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                    No confirmed bookings for this client yet.
                  </div>
                )}
              </div>

              {/* Enquiries History Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Enquiry History ({selectedCustomer.enquiries?.length || 0})</span>
                  <Link href="/owner/enquiries" className="text-[10px] text-brand-600 font-semibold hover:underline">
                    View All Enquiries →
                  </Link>
                </h3>

                {selectedCustomer.enquiries && selectedCustomer.enquiries.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.enquiries.map((e: any) => (
                      <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700">{e.enquiryNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {e.status}
                          </span>
                        </div>
                        <div className="text-slate-800 font-medium">
                          {e.eventType} • {e.guestCount} guests
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Date: {new Date(e.eventDate).toLocaleDateString()} | Budget: {e.budget || "Standard"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                    No enquiry history found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerCustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading customer directory...</div>}>
      <OwnerCustomersContent />
    </Suspense>
  );
}
