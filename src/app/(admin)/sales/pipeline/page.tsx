import { db } from "@/db";
import { deals, organizations, users, contacts } from "@/db/schema";
import { eq, isNull, sql } from "drizzle-orm";
import { DEAL_STAGES } from "@/lib/constants/pipeline";
import { PipelineBoard } from "./PipelineBoard";
import { KanbanColumn } from "@/components/ui/kanban";
import { PageHeader } from "@/components/ui/page-header";
import { NewDealModal } from "./_components/NewDealModal";

export default async function PipelinePage() {
  // Fetch deals with their organization and owner names
  const allDeals = await db
    .select({
      id: deals.id,
      name: deals.name,
      stage: deals.stage,
      value: deals.value,
      expectedCloseDate: deals.expectedCloseDate,
      organizationId: deals.organizationId,
      organizationName: organizations.name,
      contactName: contacts.name,
      ownerName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(deals)
    .leftJoin(organizations, eq(deals.organizationId, organizations.id))
    .leftJoin(contacts, eq(organizations.id, contacts.organizationId))
    .leftJoin(users, eq(deals.ownerId, users.id))
    .where(isNull(deals.deletedAt));

  const orgsList = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(isNull(organizations.deletedAt));

  // Format into columns
  const initialColumns: KanbanColumn[] = DEAL_STAGES.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage.id).map(d => ({
      ...d,
      organizationId: d.organizationId || "",
      organizationName: d.organizationName || "Unknown Org",
      contactName: d.contactName || null,
      value: d.value || 0,
    }));

    return {
      id: stage.id,
      title: stage.label,
      items: stageDeals,
    };
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Deal Pipeline"
          description="Track and manage active deals through the sales process."
          breadcrumbs={[
            { label: "Aarotech", href: "/dashboard" },
            { label: "Sales", href: "/sales/leads" },
            { label: "Pipeline" }
          ]}
          primaryAction={<NewDealModal organizations={orgsList} />}
        />
      </div>
      <div className="flex-1 overflow-hidden p-6 pt-0">
        <PipelineBoard initialColumns={initialColumns} />
      </div>
    </div>
  );
}
