import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";

export default async function KnowledgeBasePage() {
  const articles = await db.query.knowledgeBase.findMany({
    orderBy: [desc(knowledgeBase.createdAt)]
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Knowledge Base</h2>
          <p className="text-sm text-gray-500 mt-1">Standard Operating Procedures (SOPs) and Agency Documentation.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No SOPs found</h3>
            <p className="text-gray-500 mt-1">Start building your agency&apos;s brain by writing your first SOP.</p>
          </div>
        ) : (
          articles.map((article) => (
            <Link 
              href={`/crm/kb/${article.id}`} 
              key={article.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                {article.category && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {article.content?.replace(/<[^>]*>?/gm, '') || "No content summary available."}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {article.createdAt?.toLocaleDateString()}
                </span>
                <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Article &rarr;
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
