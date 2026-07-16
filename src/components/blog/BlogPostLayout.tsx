import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPost, blogPosts } from "@/data/blog";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import React from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FAQSection } from "@/components/shared/FAQSection";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo";

// Simple Markdown Renderer
function renderMarkdown(content: string) {
  const blocks = content.trim().split(/\n\s*\n/);
  
  return blocks.map((block, index) => {
    // Headings
    if (block.startsWith('### ')) {
      return <h3 key={index} id={block.replace('### ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-2xl font-bold text-slate-900 mt-8 mb-4 scroll-mt-32">{block.replace('### ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>;
    }
    if (block.startsWith('#### ')) {
      return <h4 key={index} className="text-xl font-bold text-slate-900 mt-6 mb-3 scroll-mt-32">{block.replace('#### ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h4>;
    }
    if (block.startsWith('## ')) {
      return <h2 key={index} id={block.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-3xl font-bold text-slate-900 mt-10 mb-6 border-b border-slate-100 pb-2 scroll-mt-32">{block.replace('## ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>;
    }
    
    // Lists
    if (block.startsWith('* ') || block.startsWith('- ') || /^\d+\.\s/.test(block)) {
      const isOrdered = /^\d+\.\s/.test(block);
      const items = block.split('\n').map(line => {
        const match = line.match(/^(\s*)(?:[\*\-]|\d+\.)\s+(.*)/);
        return match ? { indent: match[1].length, text: match[2] } : null;
      }).filter(Boolean);
      
      const ListTag = isOrdered ? 'ol' : 'ul' as any;
      const listClass = isOrdered ? 'list-decimal' : 'list-disc';

      return (
        <ListTag key={index} className={`${listClass} pl-6 mb-6 text-slate-700 space-y-2`}>
          {items.map((item: any, i: number) => (
            <li 
              key={i} 
              className={item.indent > 0 ? "ml-6 md:ml-8 list-[circle] text-slate-600 mt-1" : ""}
              dangerouslySetInnerHTML={{ __html: item.text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary font-semibold hover:underline">$1</a>') }} 
            />
          ))}
        </ListTag>
      );
    }
    
    // Paragraphs — also handle inline bold, code, and markdown links
    const inlineHtml = block
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\`(.*?)\`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-primary">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary font-semibold hover:underline">$1</a>');
    return <p key={index} className="mb-6 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineHtml }} />;
  });
}

// Generate TOC from content
function extractTOC(content: string) {
  const lines = content.split('\n');
  const toc: { level: number, text: string, id: string }[] = [];
  
  lines.forEach(line => {
    const match = line.match(/^(##{1,2})\s+(.+)$/);
    if (match) {
      const level = match[1].length; // 2 or 3
      const text = match[2].replace(/\*\*/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      toc.push({ level, text, id });
    }
  });
  
  return toc;
}

export function BlogPostLayout({ post }: { post: BlogPost }) {
  const relatedPosts = blogPosts
    .filter(p => p.slug !== post.slug && (p.category === post.category || p.keywords.some(k => post.keywords.includes(k))))
    .slice(0, 2);

  const toc = extractTOC(post.content);

  return (
    <>
      <Header />
      <main className="flex-1 pt-24 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema({
            title: post.title,
            headline: post.title,
            image: post.featuredImage || "/images/placeholder.svg",
            datePublished: post.date,
            dateModified: post.updatedDate || post.date,
            authorName: post.author || "Aarotech Team",
            urlPath: `/${post.slug}`
          })) }}
        />
        {post.faqs && post.faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(post.faqs)) }}
          />
        )}
        {/* Article Header */}
        <header className="bg-slate-50 py-16 border-b border-slate-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <Breadcrumbs items={[{ name: "Blog", item: "/blog" }, { name: post.title, item: `/${post.slug}` }]} />
            
            <div className="flex items-center flex-wrap gap-3 text-sm text-slate-500 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                <Tag className="w-3.5 h-3.5" />
                {post.category}
              </span>
              {post.author && (
                <span className="font-medium text-slate-700">By {post.author}</span>
              )}
              <span>•</span>
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {post.readTime}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-slate-600 font-medium">
              {post.excerpt}
            </p>
          </div>
        </header>

        {/* Featured Hero Image */}
        {post.featuredImage && (
          <div className="w-full max-w-5xl mx-auto px-4 pt-10 pb-0">
            <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto block"
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
            
            {/* Sidebar TOC */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-32">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Table of Contents</h4>
                <nav className="space-y-3 border-l-2 border-slate-100 pl-4">
                  {toc.map((item, i) => (
                    <a 
                      key={i} 
                      href={`#${item.id}`}
                      className={`block text-sm text-slate-600 hover:text-primary transition-colors ${item.level === 3 ? 'ml-4' : ''}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-6">
              <div className="prose prose-lg prose-slate max-w-none">
                {renderMarkdown(post.content)}
              </div>
              
              {/* Keywords tags */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
                {post.keywords.map(keyword => (
                  <span key={keyword} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                    #{keyword}
                  </span>
                ))}
              </div>
            </article>

            {/* Right Sidebar - CTA & Related */}
            <aside className="lg:col-span-3">
              <div className="sticky top-32 space-y-10">
                {/* Sidebar CTA */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 text-center shadow-xl">
                  <h3 className="text-xl font-bold mb-3">Ready to grow your business?</h3>
                  <p className="text-slate-300 text-sm mb-6">Get a free, custom digital marketing plan tailored to your goals.</p>
                  <Link href="/#contact" className="block w-full py-3 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
                    Get Free Strategy
                  </Link>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="w-4 h-1 bg-primary rounded-full"></span> Related Reads
                    </h4>
                    <div className="space-y-6">
                      {relatedPosts.map(related => (
                        <Link href={`/${related.slug}`} key={related.slug} className="group block">
                          <div className="text-xs text-primary font-medium mb-1">{related.category}</div>
                          <h5 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors mb-2">
                            {related.title}
                          </h5>
                          <div className="text-xs text-slate-500">{related.readTime}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* FAQs */}
        {post.faqs && post.faqs.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100">
            <FAQSection faqs={post.faqs} title="Frequently Asked Questions" />
          </div>
        )}

        {/* Next Steps CTA Section */}
        <section className="bg-slate-50 py-24 border-t border-slate-200 mt-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Did you find this article helpful?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Implement these strategies to see growth, or let our experts handle it for you. Schedule a free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/#contact" className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl hover:-translate-y-1 hover:bg-primary/90 transition-all">
                Speak to an Expert
              </Link>
              <Link href="/blog" className="inline-flex h-14 items-center justify-center rounded-xl bg-white border border-slate-200 px-8 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                Read More Articles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
