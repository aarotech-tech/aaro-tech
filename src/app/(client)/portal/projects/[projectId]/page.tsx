import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProjectDetails } from "@/modules/delivery/services";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientProjectWorkspacePage(props: { params: { projectId: string } }) {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const params = await props.params;
  const project = await getClientProjectDetails(params.projectId, membershipData.myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title={project.name}
          description={project.overview}
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Projects", href: "/portal/projects" },
            { label: project.name }
          ]}
          kpiBadges={
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold uppercase tracking-wide">
              {project.status}
            </span>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverables */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.deliverables.map((del: any) => (
                  <div key={del.id} className="flex justify-between items-center p-4 border rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-900">{del.name}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Status: {del.status.replace("_", " ")}</p>
                    </div>
                    {del.status === 'client_review' ? (
                      <Link href={`/portal/reviews?id=${del.id}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Review Now</Button>
                      </Link>
                    ) : (
                      <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.timeline.map((phase: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-0.5">
                      {phase.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : phase.status === 'active' ? (
                        <Clock className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${phase.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>{phase.phase}</p>
                      <p className="text-xs text-gray-500">{phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
