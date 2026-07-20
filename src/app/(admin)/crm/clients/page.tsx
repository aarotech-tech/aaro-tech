import { db } from "@/db";
import { organizations, clientOnboardings, onboardingSteps } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon } from "lucide-react";

export default async function ClientsPage() {
  // Fetch all organizations that are clients
  const clients = await db.query.organizations.findMany({
    where: eq(organizations.type, "client"),
    orderBy: (orgs, { desc }) => [desc(orgs.createdAt)],
  });

  // Fetch onboarding states for these clients
  // Since drizzle doesn't natively do easy grouped eager loading by reverse without relation, we can fetch all onboardings and join in code, or use relations.
  // Actually, we'll just fetch all onboardings and their steps.
  const allOnboardings = await db.query.clientOnboardings.findMany({
    with: {
      steps: true
    }
  });

  const clientOnboardingMap = new Map();
  for (const o of allOnboardings) {
    clientOnboardingMap.set(o.organizationId, o);
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Active Clients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your converted clients and their onboarding process.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No active clients found. Move a deal to &quot;Won&quot; to convert a lead into a client!
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Client / Business Name</th>
                <th className="px-6 py-3 font-medium">Contact Details</th>
                <th className="px-6 py-3 font-medium">Onboarding Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map(client => {
                const onboarding = clientOnboardingMap.get(client.id);
                let onboardingProgress = 0;
                let stepsTotal = 0;
                let stepsCompleted = 0;
                
                if (onboarding && onboarding.steps) {
                  stepsTotal = onboarding.steps.length;
                  stepsCompleted = onboarding.steps.filter((s: any) => s.status === "completed").length;
                  onboardingProgress = stepsTotal > 0 ? (stepsCompleted / stepsTotal) * 100 : 0;
                }

                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 italic">See profile for contacts</div>
                    </td>
                    <td className="px-6 py-4">
                      {onboarding ? (
                        <div className="w-48">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className={onboarding.status === "completed" ? "text-green-600 font-medium" : "text-blue-600 font-medium"}>
                              {onboarding.status === "completed" ? "Completed" : "In Progress"}
                            </span>
                            <span className="text-gray-500">{stepsCompleted} / {stepsTotal} steps</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${onboardingProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${onboardingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No onboarding record</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/crm/clients/${client.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
