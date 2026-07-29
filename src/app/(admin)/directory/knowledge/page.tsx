import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { KnowledgeClient } from "./KnowledgeClient";

export default async function KnowledgeBasePage() {
  const articles = await db
    .select()
    .from(knowledgeBase)
    .orderBy(desc(knowledgeBase.createdAt));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Knowledge Base"
          description="SOPs, guides, and platform documentation."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory" },
            { label: "Knowledge Base" }
          ]}
          primaryAction={<Button>New Article</Button>}
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <KnowledgeClient articles={articles} />
      </div>
    </div>
  );
}
