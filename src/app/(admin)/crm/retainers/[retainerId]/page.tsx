import { db } from "@/db";
import { retainers, retainerPeriods, files, organizations, deliverables } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CalendarIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import DeliverablesList from "../../projects/[projectId]/_components/DeliverablesList";

export default async function RetainerDetailsPage({ params }: { params: Promise<{ retainerId: string }> }) {
  const resolvedParams = await params;
  const retainerId = resolvedParams.retainerId;

  // 1. Fetch Retainer
  const retainerData = await db
    .select({
      id: retainers.id,
      name: retainers.name,
      amount: retainers.amount,
      status: retainers.status,
      startDate: retainers.startDate,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(retainers)
    .innerJoin(organizations, eq(retainers.organizationId, organizations.id))
    .where(eq(retainers.id, retainerId))
    .limit(1);

  if (retainerData.length === 0) {
    notFound();
  }
  const retainer = retainerData[0];

  // 2. Fetch Periods
  const periods = await db.query.retainerPeriods.findMany({
    where: eq(retainerPeriods.retainerId, retainerId),
    orderBy: [desc(retainerPeriods.startDate)]
  });

  const periodIds = periods.map(p => p.id);
  let allDeliverables: any[] = [];
  if (periodIds.length > 0) {
    allDeliverables = await db.query.deliverables.findMany({
      where: (d, { inArray }) => inArray(d.retainerPeriodId, periodIds),
      orderBy: [desc(deliverables.createdAt)]
    });
  }

  const periodsWithDeliverables = periods.map(p => ({
    ...p,
    deliverables: allDeliverables.filter(d => d.retainerPeriodId === p.id)
  }));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <Link href="/crm/retainers" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">&larr; Back to Retainers</Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          {retainer.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
          <span className="font-semibold text-gray-700">{retainer.organizationName}</span>
          <span>•</span>
          <span className="text-green-700 font-semibold">${retainer.amount.toLocaleString()} / mo</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
            retainer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {retainer.status}
          </span>
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
          Retainer Periods
        </h3>

        {periods.length === 0 ? (
          <p className="text-gray-500 text-sm">No periods found for this retainer.</p>
        ) : (
          <div className="space-y-4">
            {periodsWithDeliverables.map(period => (
              <div key={period.id}>
                <div className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{period.periodName}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    period.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {period.status}
                  </span>
                </div>
              </div>
              <div className="border-x border-b border-gray-200 rounded-b-lg p-5 bg-white -mt-1 shadow-sm">
                <DeliverablesList retainerPeriodId={period.id} deliverables={period.deliverables} />
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
