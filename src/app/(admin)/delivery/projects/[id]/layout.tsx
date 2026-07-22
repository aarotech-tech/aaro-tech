import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

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
        
        <div className="flex space-x-4 border-b border-gray-200 mt-6">
          {tabs.map((tab) => (
            <Link 
              key={tab.name}
              href={tab.href}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
