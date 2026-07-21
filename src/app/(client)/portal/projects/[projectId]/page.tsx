import { requireAuthenticatedUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, tasks, deliverables, organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeliverableActions } from "@/components/delivery/DeliverableActions";

export const metadata = {
  title: "Project Details | Client Hub",
};

export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  await requireAuthenticatedUser();
  const { orgId } = await auth();
  const projectId = (await params).projectId;

  if (!orgId) {
    return <div className="text-center py-10">Organization required.</div>;
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, orgId)
  });

  if (!org) {
    return <div className="text-center py-10">Organization not found.</div>;
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.organizationId, org.id)
    )
  });

  if (!project) {
    return <div className="text-center py-10">Project not found or unauthorized.</div>;
  }

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  const projectDeliverables = await db.select().from(deliverables).where(eq(deliverables.projectId, projectId));

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">Started {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
            {project.status}
          </Badge>
          <Badge variant={project.health === 'green' ? 'default' : 'outline'} className="px-3 py-1 text-sm capitalize">
            {project.health} Health
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Project Tasks</CardTitle>
            <CardDescription>Current execution plan</CardDescription>
          </CardHeader>
          <CardContent>
            {projectTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks defined yet.</p>
            ) : (
              <ul className="space-y-3">
                {projectTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500' : 'bg-secondary'}`} />
                    <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Deliverables</CardTitle>
            <CardDescription>Items awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {projectDeliverables.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deliverables ready for review yet.</p>
            ) : (
              <div className="space-y-6">
                {projectDeliverables.map(del => (
                  <div key={del.id} className="flex flex-col space-y-3 border p-4 rounded-lg bg-card shadow-sm hover:shadow transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col space-y-1">
                        <span className="font-semibold">{del.name}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">{del.status ? del.status.replace("_", " ") : 'Draft'}</Badge>
                    </div>

                    <div className="pt-3 border-t flex justify-end">
                      {del.status === "in_review" || del.status === "approved" ? (
                        <DeliverableActions deliverableId={del.id} currentStatus={del.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not ready for review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
