import Link from "next/link";
import { Heart, User, Search, Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-500 tracking-tight">CELIBRATE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Home</Link>
          <Link href="/venues" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Venues</Link>
          <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Events</Link>
          <Link href="/cities" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Cities</Link>
          <Link href="/vendors" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Vendors</Link>
          <Link href="/offers" className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors">Offers</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/search" className="p-2 text-gray-600 hover:text-brand-500 transition-colors rounded-full hover:bg-gray-50">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/favorites" className="p-2 text-gray-600 hover:text-brand-500 transition-colors rounded-full hover:bg-gray-50 flex items-center gap-1">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Favorites</span>
          </Link>

          {user ? (
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </Link>
          )}

          <Link href="/contact" className="ml-2 px-5 py-2.5 rounded-xl bg-brand-50 text-brand-600 font-semibold text-sm hover:bg-brand-100 transition-colors border border-brand-200">
            List Your Venue
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/search" className="p-2 text-gray-600">
            <Search className="w-5 h-5" />
          </Link>
          <button className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
