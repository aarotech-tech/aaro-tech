import Link from 'next/link';
import { BlogPost } from "@/data/blog";

interface RelatedArticlesProps {
  articles: BlogPost[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-slate-100 lg:border-t-0 lg:pt-0 lg:mt-0">
      <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-4 h-1 bg-primary rounded-full"></span> Related Reads
      </h4>
      <div className="space-y-6">
        {articles.map(related => (
          <Link href={`/${related.slug}`} key={related.slug} className="group block bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow lg:border-0 lg:p-0 lg:bg-transparent lg:shadow-none lg:hover:shadow-none">
            <div className="text-xs text-primary font-medium mb-1">{related.category}</div>
            <h5 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors mb-2">
              {related.title}
            </h5>
            <div className="text-xs text-slate-500">{related.readTime}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
