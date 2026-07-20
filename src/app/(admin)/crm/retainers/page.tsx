import { db } from "@/db";
import { retainers, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { RefreshCwIcon } from "lucide-react";

export default async function RetainersPage() {
  const allRetainers = await db
    .select({
      id: retainers.id,
      name: retainers.name,
      status: retainers.status,
      amount: retainers.amount,
      startDate: retainers.startDate,
      organizationName: organizations.name,
    })
    .from(retainers)
    .innerJoin(organizations, eq(retainers.organizationId, organizations.id))
    .orderBy(desc(retainers.createdAt));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center">
            <RefreshCwIcon className="w-6 h-6 mr-3 text-indigo-600" />
            Active Retainers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your monthly recurring client engagements.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {allRetainers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No retainers found.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Retainer Name</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">MRR Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allRetainers.map(ret => (
                <tr key={ret.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {ret.name}
                  </td>
                  <td className="px-6 py-4">
                    {ret.organizationName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700">
                    ${ret.amount.toLocaleString()} / mo
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ret.status === "active" ? "bg-green-100 text-green-800" :
                      ret.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/crm/retainers/${ret.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                      View Periods &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
