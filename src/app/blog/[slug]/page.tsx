import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronLeft, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Celibrate Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) notFound();

  // Simple Markdown parser for our demo content
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('### ')) {
        return <h3 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{paragraph.replace('### ', '')}</h3>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-10 mb-5">{paragraph.replace('## ', '')}</h2>;
      }
      // Handle bold
      const formattedPara = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: formattedPara }} />;
    });
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      
      {/* Header Image & Title */}
      <div className="relative pt-32 pb-40 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={post.image} 
            alt={post.title} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="mb-6 flex items-center justify-center gap-4 text-sm text-gray-200">
            <span className="font-semibold px-3 py-1 bg-brand-500 rounded-md text-white">{post.category}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {post.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light">
            By {post.author}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-card p-8 md:p-12 border border-gray-100">
          
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-brand-500 hover:text-brand-600 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to all articles
          </Link>

          <div className="prose prose-lg max-w-none">
            {formatContent(post.content)}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-500">Event Expert at Celibrate</p>
                </div>
              </div>
              <button className="btn-secondary py-2 px-4 text-sm">Share Article</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
