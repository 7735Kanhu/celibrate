"use client";

import { useState } from "react";
import OwnerSidebar from "./OwnerSidebar";
import OwnerHeader from "./OwnerHeader";
import OwnerMobileNav from "./OwnerMobileNav";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface OwnerLayoutClientProps {
  children: React.ReactNode;
  ownerUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    ownerProfile?: {
      id?: string;
      businessName?: string;
      status?: string;
    };
  };
  venues: Array<{ id: string; name: string; slug: string; status: string }>;
  currentVenue?: { id: string; name: string; slug: string; status: string };
}

export default function OwnerLayoutClient({
  children,
  ownerUser,
  venues,
  currentVenue,
}: OwnerLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(currentVenue?.id || venues[0]?.id);

  const isPendingApproval = ownerUser.ownerProfile?.status === "PENDING_APPROVAL";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        venues={venues}
        selectedVenueId={selectedVenueId}
        onSelectVenue={(id) => setSelectedVenueId(id)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-0">
        <OwnerHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          ownerUser={ownerUser}
          currentVenue={venues.find((v) => v.id === selectedVenueId) || currentVenue}
        />

        {/* Pending Verification Notice Banner (Requirement 6) */}
        {isPendingApproval && (
          <div className="bg-amber-500 text-white px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-100" />
              <span>
                <strong>Verification in Progress:</strong> Your venue owner account has been submitted for verification. You can configure packages and settings, but the venue cannot be published publicly until Admin approval.
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <OwnerMobileNav onOpenMore={() => setSidebarOpen(true)} />
    </div>
  );
}
