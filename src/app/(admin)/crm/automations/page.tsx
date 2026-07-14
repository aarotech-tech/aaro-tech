import { db } from "@/db";
import { automationLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ActivityIcon, CheckCircle2Icon, XCircleIcon, ClockIcon } from "lucide-react";

export default async function AutomationsPage() {
  const logs = await db.query.automationLogs.findMany({
    orderBy: [desc(automationLogs.createdAt)]
  });

  const successfulRuns = logs.filter(log => log.status === "success").length;
  const failedRuns = logs.filter(log => log.status === "failed").length;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Automations</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor background jobs and system events.</p>
        </div>
        <Button variant="outline" className="text-gray-700">
          Trigger.dev Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-blue-50 rounded-full mr-4">
            <ActivityIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Runs</p>
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-green-50 rounded-full mr-4">
            <CheckCircle2Icon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Successful</p>
            <p className="text-2xl font-bold text-gray-900">{successfulRuns}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-red-50 rounded-full mr-4">
            <XCircleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-gray-900">{failedRuns}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent Job Executions</h3>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Powered by Trigger.dev
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium">Job Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Started At</th>
              <th className="px-6 py-4 font-medium">Payload Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <ActivityIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No background jobs have run yet.</p>
                  <p className="text-xs mt-2">Try winning a deal to trigger the deal-won-alert job!</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium font-mono text-xs">{log.jobName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${log.status === "queued" ? "bg-gray-100 text-gray-800" : 
                        log.status === "running" ? "bg-blue-100 text-blue-800" : 
                        log.status === "success" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"}`}
                    >
                      {log.status === "success" && <CheckCircle2Icon className="w-3 h-3 mr-1" />}
                      {log.status === "failed" && <XCircleIcon className="w-3 h-3 mr-1" />}
                      {log.status === "queued" && <ClockIcon className="w-3 h-3 mr-1" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{log.createdAt?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-100 rounded px-2 py-1 text-xs font-mono text-gray-600 truncate max-w-xs">
                      {log.payload || "{}"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
