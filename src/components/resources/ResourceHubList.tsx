"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Tag, Download } from "lucide-react";
import { BlogPost } from "@/data/blog";
import { Resource } from "@/data/resources";

type HubItem = {
  type: "article" | "resource";
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date?: string;
  readTime?: string;
};

export function ResourceHubList({ 
  blogPosts, 
  resources 
}: { 
  blogPosts: BlogPost[], 
  resources: Resource[] 
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Normalize data into a single array
  const normalizedItems: HubItem[] = [
    ...resources.map(r => ({
      type: "resource" as const,
      slug: r.slug,
      title: r.title,
      category: r.category,
      excerpt: r.heroDescription,
    })),
    ...blogPosts.map(b => ({
      type: "article" as const,
      slug: b.slug,
      title: b.title,
      category: b.category,
      excerpt: b.excerpt,
      date: b.date,
      readTime: b.readTime,
    }))
  ];

  // Extract unique categories
  const categories = Array.from(new Set(normalizedItems.map(item => item.category)));

  // Filter items
  const filteredItems = activeCategory === "All" 
    ? normalizedItems 
    : normalizedItems.filter(item => item.category === activeCategory);

  return (
    <div>
      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-16 justify-center">
        <button 
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeCategory === "All" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}
        >
          All Insights
        </button>
        {categories.map(category => (
          <button 
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeCategory === category ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No resources found for this category.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <Link 
              href={`/${item.slug}`} 
              key={item.slug} 
              className={`group flex flex-col bg-white rounded-2xl border ${item.type === 'resource' ? 'border-primary/30 shadow-md hover:shadow-xl' : 'border-slate-200 shadow-sm hover:shadow-lg'} overflow-hidden hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm mb-5">
                  <span className={`inline-flex items-center font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded-full ${item.type === 'resource' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                    {item.type === 'resource' ? <FileText className="w-3 h-3 mr-1.5" /> : <Tag className="w-3 h-3 mr-1.5" />}
                    {item.type === 'resource' ? 'Checklist / Guide' : 'Article'}
                  </span>
                  <span className="text-slate-500 font-medium">{item.category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 mb-6 line-clamp-3 text-sm">
                  {item.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    {item.type === 'article' && item.date ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Free Download
                      </>
                    )}
                  </div>
                  <span className="text-primary font-semibold text-sm flex items-center">
                    {item.type === 'resource' ? 'Get Resource' : 'Read Article'} 
                    <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
