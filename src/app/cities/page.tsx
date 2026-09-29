import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Cities | Celibrate",
  description: "Browse event venues across top cities in India.",
};

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: { venueCount: "desc" }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Discover Venues by City</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect venue in your city or destination.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {cities.map((city) => (
            <Link key={city.id} href={`/venues?city=${city.slug}`} className="group block text-center">
              <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-4 border-white shadow-soft mx-auto w-full">
                <Image 
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-500 transition-colors">{city.name}</h3>
                <p className="text-sm text-gray-500">{city.venueCount} Venues</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
