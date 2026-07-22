import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProjects } from "@/modules/delivery/services";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientProjectsPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const projects = await getClientProjects(membershipData.myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Projects"
          description="Track the progress of your ongoing and completed projects."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Projects" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${project.status === 'active' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-700'}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Progress</span>
                  <span className="font-bold text-indigo-600">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              
              <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 text-sm">
                <span className="text-blue-700 font-semibold block mb-1">Next Milestone</span>
                <span className="text-blue-900">{project.nextMilestone}</span>
              </div>

              <div className="pt-2">
                <Link href={`/portal/projects/${project.id}`}>
                  <Button variant="outline" className="w-full">Open Workspace →</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
}
