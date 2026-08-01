import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { ProjectsTable } from "./ProjectsTable";
import { PageHeader } from "@/components/ui/page-header";
import { CreateProjectModal } from "./_components/CreateProjectModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProjectsPage() {
  const activeProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      value: projects.value,
      expectedDeliveryDate: projects.expectedDeliveryDate,
      organizationName: organizations.name,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(isNull(projects.deletedAt));

  const orgsList = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Active Projects"
          description="Manage delivery pipelines for won deals."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Delivery" },
            { label: "Projects" }
          ]}
          primaryAction={
            <CreateProjectModal organizations={orgsList}>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </CreateProjectModal>
          }
        />
      </div>
      
      <div className="p-6 pt-0 flex-1">
        <ProjectsTable projects={activeProjects} />
      </div>
    </div>
  );
}
