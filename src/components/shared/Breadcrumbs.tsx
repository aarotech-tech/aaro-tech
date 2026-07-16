import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/seo";

export interface BreadcrumbItem {
  name: string;
  item: string; // The URL path
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  theme?: "light" | "dark";
}

export function Breadcrumbs({ items, theme = "light" }: BreadcrumbsProps) {
  const schema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    ...items
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className={`mb-6 flex items-center text-sm overflow-x-auto whitespace-nowrap pb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.item} className="flex items-center space-x-2">
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
              {index === items.length - 1 ? (
                <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.item} className="hover:text-primary transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
