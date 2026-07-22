import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';

export function ArticleContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg prose-slate max-w-none prose-headings:scroll-mt-32">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6 pb-2 border-b border-slate-100 scroll-mt-32" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4 scroll-mt-32" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-xl font-bold text-slate-900 mt-8 mb-4 scroll-mt-32" {...props} />,
          a: ({ node, href, children, ...props }) => {
            if (href?.startsWith('/')) {
              return <Link href={href} className="text-primary font-semibold hover:underline" {...props}>{children}</Link>;
            }
            return <a href={href!} className="text-primary font-semibold hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
          },
          p: ({ node, ...props }) => <p className="mb-6 text-slate-700 leading-[1.85] text-[17px] md:text-[18px]" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2 marker:text-slate-400" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 text-slate-700 space-y-2 marker:text-slate-400" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 bg-slate-50 rounded-r-lg italic text-slate-700" {...props} />,
          code: ({ node, ...props }) => {
            // @ts-ignore
            const isInline = !props.className;
            if (isInline) {
              return <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-primary font-mono" {...props} />;
            }
            return <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm my-6 font-mono" {...props} />;
          },
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null;
            return (
              <span className="block w-full my-10 rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt || ""} className="w-full h-auto object-cover block" {...props} />
              </span>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
