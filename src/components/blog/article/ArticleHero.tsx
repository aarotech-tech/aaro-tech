import { Clock, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface ArticleHeroProps {
  title: string;
  excerpt: string;
  category: string;
  author?: string;
  date: string;
  readTime: string;
  slug: string;
}

export function ArticleHero({ title, excerpt, category, author, date, readTime, slug }: ArticleHeroProps) {
  return (
    <header className="bg-slate-50 pt-16 pb-12 border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs items={[{ name: "Blog", item: "/blog" }, { name: title, item: `/${slug}` }]} />
        
        <div className="flex items-center flex-wrap gap-3 text-sm text-slate-500 mb-6 mt-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            <Tag className="w-3.5 h-3.5" />
            {category}
          </span>
          {author && (
            <span className="font-medium text-slate-700">By {author}</span>
          )}
          <span className="hidden sm:inline">•</span>
          <time dateTime={date}>{new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {readTime}</span>
        </div>
        
        {/* Support natural wrapping for long/short titles */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          {title}
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
          {excerpt}
        </p>
      </div>
    </header>
  );
}
