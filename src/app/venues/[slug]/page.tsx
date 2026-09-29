import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, CheckCircle, Heart, Star, Phone, MessageCircle, Info, Wind, Car, Zap, Coffee, Music, Building, Accessibility } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import VenueCard from "@/components/ui/VenueCard";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const venue = await prisma.venue.findUnique({
    where: { slug: params.slug },
    include: { city: true },
  });

  if (!venue) return { title: "Venue Not Found" };

  return {
    title: `${venue.name}, ${venue.city.name} | Celibrate`,
    description: `Explore ${venue.name} in ${venue.city.name} for weddings, receptions, and events. View photos, capacity, amenities and send an enquiry.`,
  };
}

export default async function VenueDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const venue = await prisma.venue.findUnique({
    where: { slug: params.slug },
    include: {
      city: true,
      area: true,
      images: { orderBy: { sortOrder: "asc" } },
      amenities: true,
      packages: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!venue) notFound();

  // Fetch similar venues
  const similarVenues = await prisma.venue.findMany({
    where: {
      id: { not: venue.id },
      cityId: venue.cityId,
      type: venue.type,
    },
    take: 4,
    include: { city: true, images: { where: { isPrimary: true } } },
  });

  const primaryImage = venue.images.find(img => img.isPrimary)?.url || venue.images[0]?.url;
  const otherImages = venue.images.filter(img => !img.isPrimary).slice(0, 4);

  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('ac') || n.includes('air conditioning')) return <Wind className="w-5 h-5 text-gray-500" />;
    if (n.includes('parking')) return <Car className="w-5 h-5 text-gray-500" />;
    if (n.includes('generator') || n.includes('power')) return <Zap className="w-5 h-5 text-gray-500" />;
    if (n.includes('kitchen') || n.includes('dining')) return <Coffee className="w-5 h-5 text-gray-500" />;
    if (n.includes('sound') || n.includes('dj') || n.includes('music')) return <Music className="w-5 h-5 text-gray-500" />;
    if (n.includes('room')) return <Building className="w-5 h-5 text-gray-500" />;
    if (n.includes('wheelchair') || n.includes('lift')) return <Accessibility className="w-5 h-5 text-gray-500" />;
    return <CheckCircle className="w-5 h-5 text-brand-500" />;
  };

  let faqs = [];
  try {
    if (venue.faqs) faqs = JSON.parse(venue.faqs);
  } catch (e) {}

  let policies = [];
  try {
    if (venue.policies) policies = JSON.parse(venue.policies);
  } catch (e) {}

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-brand-500">Home</Link>
          <span>&gt;</span>
          <Link href="/venues" className="hover:text-brand-500">Venues</Link>
          <span>&gt;</span>
          <Link href={`/cities/${venue.city.slug}`} className="hover:text-brand-500">{venue.city.name}</Link>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">{venue.name}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 rounded-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9]">
          <div className="lg:col-span-2 lg:row-span-2 relative bg-gray-200">
            <Image src={primaryImage} alt={venue.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          {otherImages.map((img, idx) => (
            <div key={img.id} className="hidden lg:block relative bg-gray-200">
              <Image src={img.url} alt={`${venue.name} - view ${idx+1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              {idx === 3 && venue.images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors">
                  <span className="text-white font-bold text-lg">+{venue.images.length - 5} Photos</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Details */}
          <div className="w-full lg:w-2/3 space-y-10">
            
            {/* Header Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 font-semibold text-xs rounded-lg uppercase tracking-wider">{venue.type}</span>
                    {venue.isVerified && (
                      <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-1.5 font-medium text-gray-900 bg-amber-50 px-2 py-1 rounded text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {venue.rating} <span className="text-gray-500 font-normal">({venue.reviewCount} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {venue.address}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 self-start shrink-0">
                  <button className="flex items-center justify-center gap-2 p-3 rounded-full md:rounded-xl border border-gray-200 text-gray-600 hover:text-brand-500 hover:border-brand-500 bg-white transition-all shadow-sm">
                    <Heart className="w-5 h-5" /> <span className="hidden md:inline font-medium">Save</span>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">{venue.description}</p>
            </div>

            {/* Capacity & Highlights */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-brand-500" /> Capacity & Facilities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1">Max Capacity</p>
                  <p className="font-bold text-xl text-gray-900">{venue.capacity}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1">Indoor Hall</p>
                  <p className="font-bold text-xl text-gray-900">{venue.indoorCap || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1">Outdoor Lawn</p>
                  <p className="font-bold text-xl text-gray-900">{venue.outdoorCap || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1">Guest Rooms</p>
                  <p className="font-bold text-xl text-gray-900">{venue.roomCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {venue.amenities.map(am => (
                  <div key={am.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      {getAmenityIcon(am.name)}
                    </div>
                    <span className="font-medium text-gray-700">{am.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Venue Packages</h2>
              <div className="space-y-4 mb-6">
                {venue.packages.map(pkg => {
                  let includes = [];
                  try { includes = JSON.parse(pkg.includes); } catch(e) {}
                  return (
                    <div key={pkg.id} className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-soft transition-all bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                          <p className="text-gray-600 text-sm">{pkg.description}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-500 mb-0.5">Starting from</p>
                          <p className="text-2xl font-bold text-brand-500">{formatPrice(pkg.price)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                        {includes.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Link href={`/enquiry?venueId=${venue.id}&package=${pkg.name}`} className="btn-secondary text-sm py-2 px-4">
                          Enquire About This Package
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <strong>Pricing Disclaimer:</strong> Prices shown are indicative and may vary based on event date, guest count, package selection and additional services. Final pricing will be confirmed by our event coordinator.
                </p>
              </div>
            </div>

            {/* Policies */}
            {policies.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Venue Policies</h2>
                <ul className="space-y-3">
                  {policies.map((pol: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0"></span>
                      <span>{pol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold">{venue.rating}</span>
                  <span className="text-gray-500">/ 5</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {venue.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          {review.isVerified && <p className="text-xs text-green-600 font-medium">✓ Verified Event</p>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Sticky Booking/Enquiry CTA */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-200 shadow-card">
              <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-1">Starting from</p>
                <h3 className="text-3xl font-bold text-gray-900">{formatPrice(venue.startingPrice)}</h3>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Planning an event?</h4>
                <p className="text-sm text-gray-600 mb-6">Send us your event details and our team will confirm venue availability and exact pricing with you.</p>
                
                <Link href={`/enquiry?venueId=${venue.id}`} className="btn-primary w-full text-lg shadow-lg shadow-brand-500/20 mb-3">
                  Send Enquiry
                </Link>
                
                <Link href={`/enquiry?venueId=${venue.id}`} className="btn-secondary w-full mb-6">
                  Check Availability
                </Link>
                
                <div className="flex items-center gap-3 mt-4">
                  <a href="tel:+919876543210" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200">
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-medium hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-brand-50 p-4 rounded-xl">
                <h4 className="font-semibold text-brand-900 text-sm mb-2">Why enquire through Celibrate?</h4>
                <ul className="text-sm text-brand-800 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" /> Lowest price guarantee</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" /> Dedicated event coordinator</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" /> No hidden platform fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Venues */}
      {similarVenues.length > 0 && (
        <div className="container mx-auto px-4 mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVenues.map(simVenue => (
              <VenueCard key={simVenue.id} venue={simVenue} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40 md:hidden flex items-center gap-3 pb-[80px]">
        <a href="https://wa.me/919876543210" className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] shrink-0 border border-[#25D366]/20">
          <MessageCircle className="w-6 h-6" />
        </a>
        <Link href={`/enquiry?venueId=${venue.id}`} className="btn-primary flex-1 h-12 shadow-lg shadow-brand-500/20 text-base">
          Send Enquiry
        </Link>
      </div>

    </div>
  );
}
