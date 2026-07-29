import { db } from "@/db";
import { services } from "@/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ServicesClient } from "./ServicesClient";

export default async function ServicesSettingsPage() {
  const data = await db.select().from(services);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Services Catalog"
          description="Manage the list of services and base prices for your agency."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Services" }
          ]}
          primaryAction={<Button>Add Service</Button>}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col mt-6">
        <ServicesClient data={data} />
      </div>
    </div>
  );
}
