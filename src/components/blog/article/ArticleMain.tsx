import { ReactNode } from "react";

export function ArticleMain({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0 max-w-full lg:max-w-[760px] w-full">
      {children}
    </div>
  );
}
