import Link from "next/link";
import { Heart, User, Search, Shield, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "VENUE_OWNER") return "/owner/dashboard";
    return "/profile";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-500 tracking-tight">CELIBRATE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Home</Link>
          <Link href="/venues" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Venues</Link>
          <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Events</Link>
          <Link href="/cities" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Cities</Link>
          <Link href="/vendors" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Vendors</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors">Blog</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/search" className="p-2 text-gray-600 hover:text-brand-500 transition-colors rounded-full hover:bg-gray-50" title="Search venues">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/favorites" className="p-2 text-gray-600 hover:text-brand-500 transition-colors rounded-full hover:bg-gray-50 flex items-center gap-1.5" title="Favorites">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Favorites</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {user.role === "ADMIN" ? (
                  <Shield className="w-4 h-4 text-brand-600" />
                ) : user.role === "VENUE_OWNER" ? (
                  <Building2 className="w-4 h-4 text-brand-600" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-800">
                  {user.name.split(" ")[0]} ({user.role === "ADMIN" ? "Admin" : user.role === "VENUE_OWNER" ? "Owner" : "Customer"})
                </span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 text-sm font-medium text-gray-700"
            >
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </Link>
          )}

          <Link
            href="/owner/register"
            className="ml-1 px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm"
          >
            List Your Venue
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/search" className="p-2 text-gray-600">
            <Search className="w-5 h-5" />
          </Link>
          {user ? (
            <Link href={getDashboardLink()} className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </Link>
          ) : (
            <Link href="/login" className="p-2 text-gray-600">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
