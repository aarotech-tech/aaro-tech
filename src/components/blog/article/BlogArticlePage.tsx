import { BlogPost } from "@/data/blog";
import { extractTOC } from "@/lib/blog/extractTOC";
import { getRelatedArticles } from "@/lib/blog/relatedArticles";

import { ArticleHero } from "./ArticleHero";
import { ArticleFeaturedImage } from "./ArticleFeaturedImage";
import { ArticleReadingLayout } from "./ArticleReadingLayout";
import { TableOfContents } from "./TableOfContents";
import { ArticleMain } from "./ArticleMain";
import { ArticleContent } from "./ArticleContent";
import { ArticleFeedback } from "./ArticleFeedback";
import { ArticleFAQ } from "./ArticleFAQ";
import { ArticleSidebar } from "./ArticleSidebar";
import { RelatedArticles } from "./RelatedArticles";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { ShareButtons } from "./ShareButtons";

export function BlogArticlePage({ post }: { post: BlogPost }) {
  const toc = extractTOC(post.content);
  const related = getRelatedArticles(post, 2);

  return (
    <article className="bg-white min-h-screen relative">
      <ReadingProgressBar />
      <ArticleHero 
        title={post.title}
        excerpt={post.excerpt}
        category={post.category}
        author={post.author}
        date={post.date}
        readTime={post.readTime}
        slug={post.slug}
      />
      
      <ArticleFeaturedImage src={post.featuredImage} alt={post.title} />

      <ArticleReadingLayout>
        <TableOfContents toc={toc} title={post.title} slug={post.slug} />
        
        <ArticleMain>
          <ArticleContent content={post.content} />
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
            {post.keywords.map(keyword => (
              <span key={keyword} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                #{keyword}
              </span>
            ))}
          </div>
          
          <div className="mt-8 mb-12 lg:hidden">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          <ArticleFeedback />
        </ArticleMain>
        
        <ArticleSidebar>
          <RelatedArticles articles={related} />
        </ArticleSidebar>
      </ArticleReadingLayout>

      <ArticleFAQ faqs={post.faqs} />
    </article>
  );
}
