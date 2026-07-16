"use client";

import { useEffect, useState } from "react";
import { TOCItem } from "@/lib/blog/extractTOC";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ShareButtons } from "./ShareButtons";

interface TableOfContentsProps {
  toc: TOCItem[];
  title?: string;
  slug?: string;
}

export function TableOfContents({ toc, title, slug }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" } // Adjust margins so the active item updates properly when scrolling past header
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <>
      {/* Mobile Collapsible TOC */}
      <div className="lg:hidden mb-10 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-900"
        >
          <span>On this page</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isOpen && (
          <div className="p-4 pt-0 border-t border-slate-200">
            <nav className="space-y-3 mt-4">
              {toc.map((item, i) => (
                <a
                  key={i}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm transition-colors ${
                    activeId === item.id ? "text-primary font-semibold" : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop TOC */}
      <aside className="hidden lg:block w-[220px] xl:w-[240px] shrink-0 sticky top-32 self-start max-h-[calc(100vh-140px)] flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-4">
          <h4 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-6">Table of Contents</h4>
          <nav className="space-y-4 border-l-2 border-slate-100 pl-5">
            {toc.map((item, i) => (
              <a 
                key={i} 
                href={`#${item.id}`} 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveId(item.id);
                }}
                className={`block text-sm transition-colors duration-200 ${
                  activeId === item.id 
                    ? 'text-primary font-bold -ml-[21px] border-l-2 border-primary pl-5' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>

        {title && slug && (
          <div className="shrink-0 pt-6 mt-2 border-t border-slate-100 pr-2">
            <ShareButtons title={title} slug={slug} />
          </div>
        )}
      </aside>
    </>
  );
}
