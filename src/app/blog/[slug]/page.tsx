import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { blogPosts } from "@/data/blog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts.find(p => p.slug === resolvedParams.slug);
  if (!post) return {};

  return {
    title: `${post.title} | Aarotech Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find(p => p.slug === resolvedParams.slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-24 bg-white">
        <article className="container mx-auto px-4 py-16 max-w-4xl">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{post.title}</h1>
          </header>
          
          <div className="prose prose-lg max-w-none prose-slate">
            {/* In a real app, this would be parsed markdown or rich text */}
            <p className="lead text-xl text-slate-600 mb-8 font-medium">
              {post.excerpt}
            </p>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-slate-700">
              <p className="mb-4">This is a dynamic template designed to render comprehensive, value-driven marketing insights. When connected to a Headless CMS (such as Sanity or Contentful), this page will automatically generate deeply researched, SEO-optimized content to help you capture high-intent organic traffic.</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Driving Real Results</h2>
              <p>Consistently publishing high-quality insights builds industry authority, nurtures trust with prospective clients, and significantly lowers your blended cost-per-acquisition over time.</p>
            </div>
          </div>
        </article>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
