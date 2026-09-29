import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorCard from "@/components/ui/VendorCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Vendors | Celibrate",
  description: "Find and compare the best event vendors including photographers, caterers, and decorators.",
};

export default async function VendorsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const { city, category, minRating, search, sort, page: pageStr } = searchParams;

  const page = parseInt(pageStr || "1", 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build Prisma where filter
  const where: any = {};

  if (city) where.city = { equals: city };
  
  if (category) {
    where.category = { equals: category };
  }
  
  if (minRating) {
    const rating = parseFloat(minRating);
    if (!isNaN(rating)) where.rating = { gte: rating };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { category: { contains: search } },
    ];
  }

  // Determine sorting order
  let orderBy: any = { rating: "desc" };
  if (sort === "popular") orderBy = { reviewCount: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        services: true,
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-brand-500">Home</Link> &gt; <span className="text-gray-900">Search Vendors</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {city ? `Event Vendors in ${city.charAt(0).toUpperCase() + city.slice(1)}` : "Explore Event Vendors"}
          </h1>
          <p className="text-gray-600">{total} vendors found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-1/4">
            <div className="hidden lg:block">
              <VendorFilters />
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="w-full lg:w-3/4">
            {/* Active filters & Sort */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {city && <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full border border-brand-100">{city}</span>}
                {category && <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full border border-brand-100">{category}</span>}
                {minRating && <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full border border-brand-100">{minRating}+ Stars</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-brand-500">
                  <option value="recommended">Recommended</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Vendors Grid */}
            {vendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any vendors matching your current filters.</p>
                <Link href="/vendors" className="btn-primary">
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Link 
                    key={i} 
                    href={`/vendors?${new URLSearchParams({...searchParams as any, page: (i + 1).toString()}).toString()}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${page === i + 1 ? 'bg-brand-500 text-white shadow-soft' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
