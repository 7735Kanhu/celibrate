import Link from "next/link";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-brand-500 tracking-tight">CELIBRATE</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm">
              Find the Perfect Place for Every Celebration. Discover beautiful venues for weddings, birthdays, corporate events and every special moment across India.
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                <span>Near KIIT Square, Bhubaneswar, Odisha 751005</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                <span>hello@celibrate.demo</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-5 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-1/2 after:h-0.5 after:bg-brand-500">Explore</h3>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><Link href="/venues" className="hover:text-brand-500 transition-colors">All Venues</Link></li>
              <li><Link href="/categories/wedding" className="hover:text-brand-500 transition-colors">Wedding Venues</Link></li>
              <li><Link href="/categories/birthday" className="hover:text-brand-500 transition-colors">Birthday Venues</Link></li>
              <li><Link href="/venues?venueType=Hotel" className="hover:text-brand-500 transition-colors">Luxury Hotels</Link></li>
              <li><Link href="/venues?venueType=Kalyan+Mandap" className="hover:text-brand-500 transition-colors">Kalyan Mandaps</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-5 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-1/2 after:h-0.5 after:bg-brand-500">Popular Cities</h3>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><Link href="/cities/bhubaneswar" className="hover:text-brand-500 transition-colors">Bhubaneswar</Link></li>
              <li><Link href="/cities/cuttack" className="hover:text-brand-500 transition-colors">Cuttack</Link></li>
              <li><Link href="/cities/puri" className="hover:text-brand-500 transition-colors">Puri</Link></li>
              <li><Link href="/cities/kolkata" className="hover:text-brand-500 transition-colors">Kolkata</Link></li>
              <li><Link href="/cities/hyderabad" className="hover:text-brand-500 transition-colors">Hyderabad</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-5 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-1/2 after:h-0.5 after:bg-brand-500">Company</h3>
            <ul className="flex flex-col gap-3 text-gray-600">
              <li><Link href="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-brand-500 transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="hover:text-brand-500 transition-colors">Blog</Link></li>
              <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Celibrate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-all">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-all">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
