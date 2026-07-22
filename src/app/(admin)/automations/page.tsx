import { requireAuthenticatedUser } from "@/lib/auth";
import { db } from "@/db";
import { automationLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function AutomationsPage() {
  await requireAuthenticatedUser();

  const logs = await db.query.automationLogs.findMany({
    orderBy: [desc(automationLogs.createdAt)],
    limit: 50,
  });

  const activeWorkflows = [
    { id: "handle-deal-won", name: "Create Project on Deal Won", status: "active", trigger: "Domain/DealWon" },
    { id: "handle-standard-notifications", name: "Standard Notifications Routing", status: "active", trigger: "Multiple Events" },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Automation Center"
          description="Operational visibility for Event-Driven Background Jobs."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Automations" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Hardcoded workflow registry</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activeWorkflows.map(wf => (
                  <li key={wf.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{wf.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{wf.trigger}</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      Active
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Job Executions</CardTitle>
              <CardDescription>Execution timeline and retry queues</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 text-gray-300 mb-4" />
                  <p>No jobs have executed yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
                      <tr>
                        <th className="px-4 py-3">Job Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payload</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{log.jobName}</td>
                          <td className="px-4 py-3">
                            {log.status === "success" && <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1"/> Success</Badge>}
                            {log.status === "failed" && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                            {log.status === "running" && <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200"><Activity className="w-3 h-3 mr-1 animate-spin"/> Running</Badge>}
                            {log.status === "queued" && <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200"><Clock className="w-3 h-3 mr-1"/> Queued</Badge>}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500 max-w-xs truncate" title={log.payload || ""}>
                            {log.payload}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
