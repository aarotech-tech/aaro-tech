import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPost } from "@/data/blog";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo";
import { BlogArticlePage } from "./article/BlogArticlePage";

export function BlogPostLayout({ post }: { post: BlogPost }) {
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
        
        <BlogArticlePage post={post} />
        
      </main>
      <Footer />
    </>
  );
}
