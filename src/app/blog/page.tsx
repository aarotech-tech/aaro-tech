import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/data/blog";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Digital Marketing & SEO Blog | Aarotech Insights",
  description: "Actionable digital marketing strategies, local SEO tips, and business growth guides specifically tailored for companies in Tamil Nadu.",
  keywords: ["Digital Marketing Blog", "SEO tips", "Tamil Nadu business growth", "Aarotech insights"],
  openGraph: {
    title: "Digital Marketing & SEO Blog | Aarotech Insights",
    description: "Actionable digital marketing strategies, local SEO tips, and business growth guides specifically tailored for companies in Tamil Nadu.",
    type: "website",
  }
};

export default function BlogIndex() {
  const featuredPost = blogPosts[0];
  const remainingPosts = blogPosts.slice(1);
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-24 bg-slate-50">
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Actionable Growth <span className="text-primary">Insights</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Master the digital landscape with our expert strategies on SEO, paid ads, and web design, tailored for businesses in Tamil Nadu.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Featured Post */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span> Featured Article
            </h2>
            <Link href={`/${featuredPost.slug}`} className="group block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      {featuredPost.category}
                    </span>
                    <time dateTime={featuredPost.date}>{new Date(featuredPost.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 group-hover:text-primary transition-colors leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-8 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                    <div className="inline-flex items-center justify-center rounded-full bg-slate-100 p-3 group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 bg-slate-100 relative min-h-[300px] lg:min-h-full flex items-center justify-center overflow-hidden">
                   {/* Abstract Featured Image Representation */}
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 opacity-50"></div>
                   <div className="w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                   <div className="w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 absolute top-10 right-10"></div>
                   <div className="relative z-10 text-slate-400 font-medium tracking-widest uppercase text-sm">Aarotech Insights</div>
                </div>
              </div>
            </Link>
          </div>

          <BlogList initialPosts={remainingPosts} categories={categories} />
        </div>
      </main>
      <Footer />
    </>
  );
}
