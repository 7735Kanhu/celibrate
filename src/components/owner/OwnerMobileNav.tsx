"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareText, Calendar, CalendarCheck, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerMobileNavProps {
  onOpenMore: () => void;
}

export default function OwnerMobileNav({ onOpenMore }: OwnerMobileNavProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Enquiries", href: "/owner/enquiries", icon: MessageSquareText },
    { name: "Calendar", href: "/owner/calendar", icon: Calendar },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/owner/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium",
                isActive ? "text-brand-600 font-bold" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-brand-600" : "text-gray-400")} />
              <span className="text-[10px]">{link.name}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-900 text-xs font-medium"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </div>
  );
}
