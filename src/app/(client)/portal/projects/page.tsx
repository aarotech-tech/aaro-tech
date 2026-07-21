import { requireAuthenticatedUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Projects | Client Hub",
};

export default async function ClientProjectsPage() {
  await requireAuthenticatedUser();
  const { orgId } = await auth();

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-2xl font-bold">No Organization Selected</h2>
      </div>
    );
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, orgId)
  });

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-2xl font-bold">Organization Syncing...</h2>
      </div>
    );
  }

  const clientProjects = await db.select().from(projects).where(eq(projects.organizationId, org.id));

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
        <p className="text-muted-foreground">Track the status and deliverables for your active and past projects.</p>
      </div>

      {clientProjects.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="mt-4 text-lg font-semibold">No active projects</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              You don't have any projects currently in progress. When you accept a proposal, your project will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientProjects.map(project => (
            <Card key={project.id} className="group overflow-hidden border transition-all hover:shadow-md">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>{project.status}</Badge>
                </div>
                <CardDescription>Started {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Health</span>
                    <Badge variant={project.health === 'green' ? 'default' : 'outline'} className="capitalize">{project.health}</Badge>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="text-sm font-medium text-primary hover:underline">View Deliverables &rarr;</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
