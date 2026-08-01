import { db } from "@/db";
import { organizations } from "@/db/schema";
import { isNull } from "drizzle-orm";
import Link from "next/link";
import { Building2, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { OrganizationsTableClient } from "./_components/OrganizationsTableClient";
import { CreateOrganizationDialog } from "./_components/CreateOrganizationDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default async function OrganizationsDirectoryPage() {
  const orgs = await db
    .select()
    .from(organizations)
    .where(isNull(organizations.deletedAt));

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Organizations Directory"
          description="The master record of all clients, prospects, and internal entities."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory/organizations" },
            { label: "Organizations" }
          ]}
          primaryAction={
            <CreateOrganizationDialog>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" /> New Organization
              </Button>
            </CreateOrganizationDialog>
          }
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <OrganizationsTableClient initialOrgs={orgs} />
      </div>
    </div>
  );
}
