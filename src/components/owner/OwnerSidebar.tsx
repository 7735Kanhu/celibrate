"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  MessageSquareText,
  Users,
  FileSpreadsheet,
  CalendarCheck,
  Receipt,
  PackageCheck,
  Sparkles,
  Image as ImageIcon,
  Star,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Array<{ id: string; name: string; slug: string; status: string }>;
  selectedVenueId?: string;
  onSelectVenue?: (id: string) => void;
}

export default function OwnerSidebar({
  isOpen,
  onClose,
  venues = [],
  selectedVenueId,
  onSelectVenue,
}: OwnerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "My Venue", href: "/owner/venue", icon: Building2 },
    { name: "Calendar", href: "/owner/calendar", icon: Calendar },
    { name: "Enquiries", href: "/owner/enquiries", icon: MessageSquareText },
    { name: "Customers", href: "/owner/customers", icon: Users },
    { name: "Quotations", href: "/owner/quotations", icon: FileSpreadsheet },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
    { name: "Payments", href: "/owner/payments", icon: Receipt },
    { name: "Packages", href: "/owner/packages", icon: PackageCheck },
    { name: "Amenities", href: "/owner/amenities", icon: Sparkles },
    { name: "Gallery", href: "/owner/gallery", icon: ImageIcon },
    { name: "Reviews", href: "/owner/reviews", icon: Star },
    { name: "Reports", href: "/owner/reports", icon: BarChart3 },
    { name: "Settings", href: "/owner/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-xl font-black text-brand-500 tracking-tight">CELIBRATE</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200 uppercase tracking-wide">
              Owner ERP
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-venue Selector Dropdown (Requirement 56) */}
        {venues.length > 0 && (
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
              Active Managed Venue
            </label>
            <div className="relative">
              <select
                value={selectedVenueId || venues[0]?.id}
                onChange={(e) => {
                  if (onSelectVenue) onSelectVenue(e.target.value);
                  // Refresh current view with selected venue parameter
                  const url = new URL(window.location.href);
                  url.searchParams.set("venueId", e.target.value);
                  router.push(url.toString());
                }}
                className="w-full text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl py-2 px-3 pr-8 focus:outline-none focus:border-brand-500 appearance-none shadow-2xs truncate cursor-pointer"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.status === "PENDING" ? "(Pending Approval)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/owner/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-brand-50 text-brand-600 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive ? "text-brand-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer with logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
