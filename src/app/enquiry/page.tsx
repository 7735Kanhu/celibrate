import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import EnquiryForm from "@/components/enquiry/EnquiryForm";

export const metadata: Metadata = {
  title: "Send Enquiry | Celibrate",
  description: "Send your event details and let us find the perfect venue.",
};

export default async function EnquiryPage(props: { searchParams: Promise<{ venueId?: string, package?: string }> }) {
  const searchParams = await props.searchParams;
  const initialVenueId = searchParams.venueId;
  const selectedPackage = searchParams.package;

  // Fetch data for dropdowns
  const [venues, eventCategories] = await Promise.all([
    prisma.venue.findMany({
      select: { id: true, name: true, type: true, city: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.eventCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Plan Your Event</h1>
          <p className="text-gray-600 text-lg">
            Send us your event requirements and our dedicated event coordinator will contact you to discuss availability and packages.
          </p>
        </div>

        <EnquiryForm 
          venues={venues} 
          eventCategories={eventCategories} 
          initialVenueId={initialVenueId} 
          selectedPackage={selectedPackage}
        />
      </div>
    </div>
  );
}
