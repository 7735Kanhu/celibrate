"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users2,
  UserCheck,
  MessageSquareText,
  CalendarCheck2,
  FileSpreadsheet,
  Receipt,
  Star,
  Store,
  Layers,
  MapPin,
  Tag,
  BookOpen,
  BarChart3,
  Settings,
  History,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Venues", href: "/admin/venues", icon: Building2 },
    { name: "Venue Owners", href: "/admin/owners", icon: Users2 },
    { name: "Customers", href: "/admin/customers", icon: UserCheck },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquareText },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck2 },
    { name: "Quotations", href: "/admin/quotations", icon: FileSpreadsheet },
    { name: "Payments", href: "/admin/payments", icon: Receipt },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Vendors", href: "/admin/vendors", icon: Store },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Cities & Areas", href: "/admin/cities", icon: MapPin },
    { name: "Offers", href: "/admin/offers", icon: Tag },
    { name: "Blog Posts", href: "/admin/blog", icon: BookOpen },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: History },
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
          <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-xl font-black text-brand-500 tracking-tight">CELIBRATE</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200 uppercase tracking-wide">
              Admin
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));

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
