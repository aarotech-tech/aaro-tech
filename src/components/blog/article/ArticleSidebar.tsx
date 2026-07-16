import { ArticleCTA } from "./ArticleCTA";
import { ReactNode } from "react";

export function ArticleSidebar({ children }: { children?: ReactNode }) {
  return (
    <aside className="lg:w-[260px] xl:w-[300px] shrink-0 mt-12 lg:mt-0 lg:block sticky top-32 self-start max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide">
      <div className="space-y-10 pr-2">
        <ArticleCTA />
        {children}
      </div>
    </aside>
  );
}
