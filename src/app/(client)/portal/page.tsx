import { db } from "@/db";
import { organizations, deals, clientAssets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon } from "lucide-react";

export default async function ClientDashboardPage() {
  const user = await currentUser();
  
  // NOTE FOR MVP: Since we haven't built the Clerk webhook to sync users to organizations yet, 
  // we will just display the first organization that has type === "client".
  // In production, we would use the logged-in user's ID to find their organization.
  const myOrg = await db.query.organizations.findFirst({
    where: eq(organizations.type, "client")
  });

  if (!myOrg) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h3 className="text-xl font-medium text-white mb-2">No Active Organization</h3>
          <p>You have not been assigned to a client organization yet.</p>
        </div>
      </div>
    );
  }

  // Fetch active projects (deals) for this client
  const activeProjects = await db.query.deals.findMany({
    where: eq(deals.organizationId, myOrg.id),
    orderBy: [desc(deals.createdAt)]
  });

  // Fetch recent assets
  const recentAssets = await db.query.clientAssets.findMany({
    where: eq(clientAssets.organizationId, myOrg.id),
    orderBy: [desc(clientAssets.createdAt)],
    limit: 5
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, {user?.firstName || "Client"}
        </h1>
        <p className="text-gray-400 mt-2">
          Here is the latest status for <strong className="text-gray-200">{myOrg.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              ${activeProjects.reduce((acc, proj) => acc + (proj.value || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Account Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">Excellent</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Project Status</h2>
          {activeProjects.length === 0 ? (
            <p className="text-gray-500">No active projects.</p>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-200">{project.name}</h3>
                    <span className="text-xs font-medium bg-blue-900/50 text-blue-400 px-2.5 py-0.5 rounded-full capitalize">
                      {project.stage}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: project.stage === 'won' ? '100%' : '50%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assets */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Documents</h2>
          {recentAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FileIcon className="w-12 h-12 mb-3 opacity-20" />
              <p>No documents shared yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {recentAssets.map((asset) => (
                <li key={asset.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.createdAt?.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
