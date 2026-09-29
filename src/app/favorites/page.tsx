import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import VenueCard from "@/components/ui/VenueCard";

export const metadata: Metadata = {
  title: "My Favorites | Celibrate",
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  let userId = user?.id;

  // Fallback to demo user if not logged in
  if (!userId) {
    const demoUser = await prisma.user.findUnique({
      where: { email: "customer@celibrate.demo" },
    });
    userId = demoUser?.id;
  }

  let favorites: any[] = [];
  if (userId) {
    favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          include: {
            city: true,
            images: { where: { isPrimary: true } },
          },
        },
      },
    });
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorite Venues</h1>
          <p className="text-gray-600">Venues you've saved for your upcoming celebrations.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-brand-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">You haven't saved any venues yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Tap the heart icon on any venue to save it to your favorites list so you can easily compare them later.
            </p>
            <Link href="/venues" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-5 h-5" /> Explore Venues
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <VenueCard key={fav.id} venue={fav.venue} isFavorite={true} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
