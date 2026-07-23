import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/blog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generateArticleSchema } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};

  return {
    title: `${post.title} | Aarotech Blog`,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    headline: post.title,
    image: post.featuredImage || "/icon.png",
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    authorName: post.author || "Aarotech Team",
    urlPath: `/blog/${post.slug}`
  });

  // A very simple markdown to HTML parser for standard tags used in the blog data
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-6 leading-relaxed">');
    return `<p class="mb-6 leading-relaxed">${html}</p>`;
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24 bg-slate-50 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <article className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <header className="mb-12 border-b border-slate-100 pb-12 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              {post.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">{post.title}</h1>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {post.author?.charAt(0) || "A"}
                </div>
                {post.author || "Aarotech Team"}
              </span>
              <span>•</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </header>
          
          {post.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-md">
              <img src={post.featuredImage} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}
          
          <div 
            className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
