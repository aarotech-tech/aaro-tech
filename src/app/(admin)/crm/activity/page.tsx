import { db } from "@/db";
import { activityLogs, organizations, users } from "@/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import { ActivityIcon, FileTextIcon, ReceiptIcon, UserIcon } from "lucide-react";
import Link from "next/link";

export default async function ActivityLogPage() {
  const logs = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      orgName: organizations.name,
      userFirstName: users.firstName,
      userLastName: users.lastName
    })
    .from(activityLogs)
    .innerJoin(organizations, eq(activityLogs.organizationId, organizations.id))
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(100);

  const getIcon = (action: string) => {
    if (action.includes('invoice')) return <ReceiptIcon className="w-5 h-5 text-indigo-500" />;
    if (action.includes('deliverable')) return <FileTextIcon className="w-5 h-5 text-emerald-500" />;
    return <ActivityIcon className="w-5 h-5 text-gray-500" />;
  };

  const formatActionStr = (action: string) => {
    return action.replace('.', ' ').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getLink = (entityType: string, entityId: string) => {
    if (entityType === 'invoice') return `/crm/billing/${entityId}`;
    if (entityType === 'deliverable') return `/crm/deliverables/${entityId}`;
    return '#';
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <ActivityIcon className="w-8 h-8 mr-3 text-indigo-600" />
            Activity Log
          </h1>
          <p className="text-sm text-gray-500 mt-2">A centralized feed of all system and user events across the platform.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No activity recorded yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                <div className="bg-gray-100 p-2 rounded-full mt-1">
                  {getIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {formatActionStr(log.action)}
                    </p>
                    <time className="text-xs text-gray-500 whitespace-nowrap">
                      {log.createdAt?.toLocaleString()}
                    </time>
                  </div>
                  
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-3">
                    <span className="flex items-center">
                      <strong className="text-gray-700 mr-1">Client:</strong> {log.orgName}
                    </span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="flex items-center">
                      <UserIcon className="w-3.5 h-3.5 mr-1" />
                      {log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : 'System'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs">
                    <Link href={getLink(log.entityType, log.entityId)} className="text-indigo-600 hover:underline">
                      View {log.entityType} record &rarr;
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
