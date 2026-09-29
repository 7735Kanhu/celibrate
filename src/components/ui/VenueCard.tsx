"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Users, Star, BadgeCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface VenueCardProps {
  venue: any;
  isFavorite?: boolean;
}

export default function VenueCard({ venue, isFavorite = false }: VenueCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const primaryImage = venue.images?.find((img: any) => img.isPrimary)?.url || venue.images?.[0]?.url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800";

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    setFavorite(!favorite);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: venue.id })
      });
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      setFavorite(favorite);
    }
  };

  return (
    <Link href={`/venues/${venue.slug}`} className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image 
          src={primaryImage} 
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {venue.isFeatured && (
            <span className="bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {venue.type}
          </span>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-5 h-5 transition-colors ${favorite ? 'fill-brand-500 text-brand-500' : 'text-gray-600 hover:text-brand-500'}`} />
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-brand-600 transition-colors">
            {venue.name}
          </h3>
          {venue.isVerified && (
            <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
        </div>
        
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-gray-900">{venue.rating}</span>
          <span className="text-sm text-gray-500">({venue.reviewCount} Reviews)</span>
        </div>

        {/* Location & Capacity */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm line-clamp-1">{venue.city?.name || venue.cityName}, {venue.address?.split(',').pop()?.trim() || "India"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-sm">Up to {venue.capacity} Guests</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
            <p className="font-bold text-lg text-gray-900">{formatPrice(venue.startingPrice)}</p>
          </div>
          <span className="text-sm font-semibold text-brand-500 group-hover:text-brand-600">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
