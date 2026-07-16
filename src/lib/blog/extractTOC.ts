import GithubSlugger from 'github-slugger';

export interface TOCItem {
  level: number;
  text: string;
  id: string;
}

export function extractTOC(content: string): TOCItem[] {
  const lines = content.split('\n');
  const toc: TOCItem[] = [];
  const slugger = new GithubSlugger();
  
  // We need to parse headers like `## Title` or `### Title`
  
  lines.forEach(line => {
    // Only match headings (h2) that start at the beginning of the line
    const match = line.match(/^(#{2})\s+(.+)$/);
    if (match) {
      const level = 2;
      const rawText = match[2];
      
      // Strip common markdown formatting for the text display and slug generation
      const text = rawText
        .replace(/\*\*(.*?)\*\*/g, '$1') // bold
        .replace(/\*(.*?)\*/g, '$1')     // italic
        .replace(/`(.*?)`/g, '$1')       // code
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // links
        .trim();
        
      // Generate ID using github-slugger to match rehype-slug exactly
      const id = slugger.slug(text);
      
      toc.push({ level, text, id });
    }
  });
  
  return toc;
}
