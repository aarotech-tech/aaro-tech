import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ProjectTabs } from "./ProjectTabs";

export default async function ProjectLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      organizationName: organizations.name,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(eq(projects.id, resolvedParams.id));

  if (!project) notFound();

  const tabs = [
    { name: "Overview", href: `/delivery/projects/${project.id}` },
    { name: "Task Board", href: `/delivery/projects/${project.id}/board` },
    { name: "Milestones", href: `/delivery/projects/${project.id}/milestones` },
    { name: "Finance", href: `/delivery/projects/${project.id}/finance` },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader
          title={project.name}
          description={project.organizationName || ""}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Delivery", href: "/delivery/projects" },
            { label: "Projects", href: "/delivery/projects" },
            { label: project.name }
          ]}
          kpiBadges={
            <>
              <Badge variant="outline" className="capitalize">{project.status}</Badge>
              <Badge variant={project.health === 'green' ? 'default' : 'destructive'} className="capitalize ml-2">
                {project.health} Health
              </Badge>
            </>
          }
        />
        
        <ProjectTabs tabs={tabs} />
      </div>
      
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
