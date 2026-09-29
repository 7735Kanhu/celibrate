import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog & Event Planning Tips | Celibrate",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" }
  });

  if (posts.length === 0) {
    return <div className="py-20 text-center">No blog posts available at the moment.</div>;
  }

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Celibrate Event Guide</h1>
          <p className="text-lg text-gray-600">
            Expert advice, planning checklists, and inspiration for your weddings, birthdays, and celebrations.
          </p>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featuredPost.slug}`} className="group block mb-16 bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 relative aspect-[4/3] md:aspect-auto">
              <Image 
                src={featuredPost.image} 
                alt={featuredPost.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider rounded-md mb-4 self-start">
                {featuredPost.category}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-brand-600 transition-colors leading-tight">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{featuredPost.author}</span>
                  <span>•</span>
                  <span>{formatDate(featuredPost.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-brand-500">
                  <Clock className="w-4 h-4" /> {featuredPost.readTime}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all border border-gray-100 flex flex-col">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                  <span className="flex items-center text-xs font-semibold text-brand-500 group-hover:text-brand-600">
                    Read Article <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
