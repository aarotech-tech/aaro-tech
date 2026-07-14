import { db } from "@/db";
import { deals, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import KanbanBoard from "./_components/KanbanBoard";
import AddDealModal from "./_components/AddDealModal";

export default async function CRMPage() {
  // Fetch all deals and join with their respective organizations
  const allDeals = await db
    .select({
      id: deals.id,
      name: deals.name,
      value: deals.value,
      stage: deals.stage,
      organizationName: organizations.name,
    })
    .from(deals)
    .leftJoin(organizations, eq(deals.organizationId, organizations.id));

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sales Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Manage leads and proposals through the sales process.</p>
        </div>
        <AddDealModal />
      </div>
      
      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialDeals={allDeals} />
      </div>
    </div>
  );
}
