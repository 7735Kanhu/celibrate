import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Search as SearchIcon, Calendar, CheckCircle2 } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import VenueCard from "@/components/ui/VenueCard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Fetch data for homepage
  const [categories, popularVenues, cities] = await Promise.all([
    prisma.eventCategory.findMany({ take: 8 }),
    prisma.venue.findMany({
      where: { isFeatured: true },
      take: 6,
      include: {
        city: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.city.findMany({
      where: { isPopular: true },
      take: 6,
      orderBy: { venueCount: "desc" },
    }),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000"
            alt="Beautiful Wedding Venue"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-brand-300" />
              India's Premier Venue Discovery Platform
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Find the Perfect Place for <span className="text-brand-300 relative inline-block">
                Every Celebration
                <svg className="absolute -bottom-2 w-full h-3 text-brand-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
              Discover Kalyan Mandaps, banquet halls, luxury hotels, and resorts for your special day. Submit your requirements and let our experts handle the rest.
            </p>
          </div>

          <HeroSearch />
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What are you celebrating?</h2>
              <p className="text-gray-600 max-w-2xl text-lg">Explore venues perfectly suited for your specific event type.</p>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-600 transition-colors">
              View All Events <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/venues?eventType=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square md:aspect-[4/5] shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <Image 
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 md:line-clamp-none">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="py-20 bg-brand-50/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Venues</h2>
              <p className="text-gray-600 max-w-2xl text-lg">Handpicked premium venues for unforgettable celebrations.</p>
            </div>
            <Link href="/venues" className="inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-600 transition-colors">
              Explore All Venues <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {popularVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Celibrate Works</h2>
            <p className="text-gray-600 text-lg">We make venue booking simple. No online payments, just personalized assistance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10 border-t-2 border-dashed border-brand-200"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-brand-100 flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                <SearchIcon className="w-10 h-10 text-brand-500" />
              </div>
              <span className="text-brand-500 font-bold text-lg mb-2">01</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Discover</h3>
              <p className="text-gray-600">Explore venues based on location, event type, budget and guest count.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-brand-100 flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-10 h-10 text-brand-500" />
              </div>
              <span className="text-brand-500 font-bold text-lg mb-2">02</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Send Enquiry</h3>
              <p className="text-gray-600">Tell us about your event and requirements through our simple enquiry form.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-brand-500 border-4 border-brand-200 flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="text-brand-500 font-bold text-lg mb-2">03</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">We Contact You</h3>
              <p className="text-gray-600">Our team contacts you to discuss availability, negotiate pricing and arrange bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find Venues by City</h2>
            <p className="text-gray-600 text-lg">Top destinations for grand celebrations across India.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {cities.map((city) => (
              <Link key={city.id} href={`/cities/${city.slug}`} className="group block">
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-4 border-white shadow-soft mx-auto w-32 md:w-full max-w-[200px]">
                  <Image 
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-500 transition-colors">{city.name}</h3>
                  <p className="text-sm text-gray-500">{city.venueCount} Venues</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          {/* Abstract pattern background could go here */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Planning Something Special?</h2>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Let Celibrate help you find the perfect venue for your celebration. Our experts are ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/venues" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-lg hover:bg-brand-50 hover:scale-105 transition-all text-lg">
              Find Your Venue
            </Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 hover:scale-105 transition-all text-lg border border-brand-400">
              Send an Enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
