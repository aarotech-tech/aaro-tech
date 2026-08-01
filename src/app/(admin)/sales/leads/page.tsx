import { db } from "@/db";
import { websiteLeads } from "@/db/schema";
import { eq, inArray, isNull } from "drizzle-orm";
import { LeadsTable } from "./LeadsTable";
import { PageHeader } from "@/components/ui/page-header";

export default async function LeadsPage() {
  const activeLeads = await db
    .select()
    .from(websiteLeads)
    .where(inArray(websiteLeads.status, ["new", "contacted"]));

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Leads"
          description="Manage and convert your prospective clients."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/sales/pipeline" },
            { label: "Leads" }
          ]}
        />
      </div>
      <div className="p-6 pt-0 flex-1">
        <LeadsTable leads={activeLeads} />
      </div>
    </div>
  );
}
