import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Heart, Search, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Celibrate",
  description: "Learn about Celibrate, India's premier event venue discovery platform.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="relative py-24 bg-brand-50 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find the Perfect Place for <span className="text-brand-500">Every Celebration</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Celibrate helps people discover beautiful venues and event services for weddings, birthdays, corporate events and celebrations across India.
          </p>
        </div>
      </section>

      {/* How it works details */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Enquiry-Based Model</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Unlike confusing booking platforms, Celibrate operates on a personalized enquiry model. We believe that booking a venue for a milestone event requires human touch, negotiation, and careful planning.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                    <Search className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">1. Customers Discover Venues</h4>
                    <p className="text-gray-600 text-sm">Browse thousands of Kalyan Mandaps, hotels, and resorts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">2. Submit Requirements</h4>
                    <p className="text-gray-600 text-sm">Tell us your event date, guest count, and required services without any upfront payment.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">3. Expert Coordination</h4>
                    <p className="text-gray-600 text-sm">Our event coordination team contacts you to discuss availability, negotiate pricing, and arrange the final booking offline.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000" 
                alt="Celibrate Wedding Coordination" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats or Vision */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <Heart className="w-12 h-12 text-brand-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-300 font-light leading-relaxed mb-10">
            To eliminate the stress of event planning by providing a transparent, beautifully designed platform where families can find their dream venues and connect with verified vendors effortlessly.
          </p>
          <Link href="/venues" className="btn-primary text-lg px-8 py-4">
            Start Exploring Venues
          </Link>
        </div>
      </section>

    </div>
  );
}
