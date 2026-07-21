import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { LeadsTable } from "./LeadsTable";

export default async function LeadsPage() {
  const leads = await db
    .select()
    .from(organizations)
    .where(
      or(
        eq(organizations.type, "lead"),
        eq(organizations.status, "lead")
      )
    );

  // We should also filter out deleted items based on soft deletes
  const activeLeads = leads.filter(l => !l.deletedAt);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and convert your prospective clients.</p>
        </div>
      </div>
      
      <LeadsTable leads={activeLeads} />
    </div>
  );
}
