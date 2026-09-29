import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Event Categories | Celibrate",
  description: "Browse venues by event type. Find the perfect venue for your wedding, birthday, or corporate event.",
};

export default async function CategoriesPage() {
  const categories = await prisma.eventCategory.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What are you celebrating?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of event categories and find the ideal venue for your special occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/venues?eventType=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <Image 
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-200 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
