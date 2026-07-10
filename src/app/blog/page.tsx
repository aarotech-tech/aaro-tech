import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/data/blog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Growth Marketing Blog | Aarotech",
  description: "Actionable digital marketing strategies, SEO tips, and growth guides from the Aarotech team.",
};

export default function BlogIndex() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-24 bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Growth Insights</h1>
            <p className="text-xl text-slate-600">Actionable digital marketing strategies, SEO tips, and growth guides from the Aarotech team.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-8">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-slate-600 mb-6">{post.excerpt}</p>
                  <div className="flex items-center text-primary font-semibold">
                    Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
