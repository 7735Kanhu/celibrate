import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OwnerLayoutClient from "@/components/owner/OwnerLayoutClient";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If unauthenticated or accessing public owner registration, render children directly
  if (!user || (user.role !== "VENUE_OWNER" && user.role !== "ADMIN")) {
    return <>{children}</>;
  }

  // Fetch owner's managed venues
  const venues = await prisma.venue.findMany({
    where: user.role === "ADMIN" ? { isArchived: false } : { ownerId: user.id, isArchived: false },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <OwnerLayoutClient
      ownerUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ownerProfile: user.ownerProfile
          ? {
              id: user.ownerProfile.id,
              businessName: user.ownerProfile.businessName,
              status: user.ownerProfile.status,
            }
          : undefined,
      }}
      venues={venues}
      currentVenue={venues[0]}
    >
      {children}
    </OwnerLayoutClient>
  );
}
