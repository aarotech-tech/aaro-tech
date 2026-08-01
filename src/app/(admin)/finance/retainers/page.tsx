import { db } from "@/db";
import { retainers, organizations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RetainersClient } from "./RetainersClient";
import { CreateRetainerDialog } from "./_components/CreateRetainerDialog";
import { PlusIcon } from "lucide-react";

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

  const orgsList = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);

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
          primaryAction={
            <CreateRetainerDialog organizations={orgsList}>
              <Button><PlusIcon className="w-4 h-4 mr-2" /> New Retainer</Button>
            </CreateRetainerDialog>
          }
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <RetainersClient data={data} />
      </div>
    </div>
  );
}
