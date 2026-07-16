import { ReactNode } from "react";

export function ArticleReadingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative items-start justify-between">
        {children}
      </div>
    </div>
  );
}
