import { BlogPost, blogPosts } from "@/data/blog";

export function getRelatedArticles(post: BlogPost, maxCount: number = 2): BlogPost[] {
  // First priority: same category OR matching keywords
  // Exclude the current post itself
  const related = blogPosts.filter(p => {
    if (p.slug === post.slug) return false;
    
    const hasSameCategory = p.category === post.category;
    const hasMatchingKeywords = p.keywords.some(k => post.keywords.includes(k));
    
    return hasSameCategory || hasMatchingKeywords;
  });

  // If we have more than needed, we can just slice. 
  // In a more advanced implementation, we could score them by number of matching keywords.
  return related.slice(0, maxCount);
}
