import { db } from "@/db";
import { retainers, organizations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RetainersClient } from "./RetainersClient";

export default async function RetainersPage() {
  const data = await db
    .select({
      id: retainers.id,
      name: retainers.name,
      amount: retainers.amount,
      status: retainers.status,
      startDate: retainers.startDate,
      organization: {
        name: organizations.name,
      }
    })
    .from(retainers)
    .innerJoin(organizations, eq(retainers.organizationId, organizations.id))
    .orderBy(desc(retainers.createdAt));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Retainers"
          description="Manage recurring revenue streams and retainers."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Retainers" }
          ]}
          primaryAction={<Button>New Retainer</Button>}
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <RetainersClient data={data} />
      </div>
    </div>
  );
}
