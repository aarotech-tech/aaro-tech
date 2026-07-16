"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { BlogPost } from "@/data/blog";

export function BlogList({ initialPosts, categories }: { initialPosts: BlogPost[], categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All Articles");

  const filteredPosts = activeCategory === "All Articles" 
    ? initialPosts 
    : initialPosts.filter(post => post.category === activeCategory);

  return (
    <div>
      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-16 justify-center">
        <button 
          onClick={() => setActiveCategory("All Articles")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeCategory === "All Articles" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}
        >
          All Articles
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

      {/* Latest Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <span className="w-8 h-1 bg-slate-300 rounded-full"></span> 
          {activeCategory === "All Articles" ? "Latest Articles" : `${activeCategory} Articles`}
        </h2>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No articles found for this category.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link href={`/${post.slug}`} key={post.slug} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {post.featuredImage ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-slate-500 text-4xl font-bold">{post.category[0]}</span>
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-5">
                    <span className="text-primary font-medium">{post.category}</span>
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </div>
                    <span className="text-primary font-semibold text-sm flex items-center">
                      Read <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
