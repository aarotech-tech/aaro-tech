import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/seo";

export interface BreadcrumbItem {
  name: string;
  item: string; // The URL path
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
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
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.item} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {index === items.length - 1 ? (
                <span className="text-slate-800 font-semibold" aria-current="page">
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
