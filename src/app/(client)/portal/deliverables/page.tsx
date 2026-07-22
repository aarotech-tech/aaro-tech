import { requireAuthenticatedUser } from "@/lib/auth";
import Link from "next/link";
import { FileCheck2Icon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { portalService } from "@/modules/portal/services";
import { getClientDeliverables } from "@/modules/delivery/services";

export default async function ClientDeliverablesPage() {
  const user = await requireAuthenticatedUser();
  
  const membershipData = await portalService.getClientMembership(user.id);
  if (!membershipData || !membershipData.myOrg) return null;

  const { myOrg } = membershipData;

  const allDeliverables = await getClientDeliverables(myOrg.id);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Deliverables"
          description="Review and approve work submitted by our team."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Deliverables" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {allDeliverables.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No deliverables to review at this time.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Deliverable Name</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Project</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Status</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allDeliverables.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{d.name}</td>
                    <td className="px-6 py-4">{d.projectName || "Retainer Work"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        d.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                        d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'changes_requested' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {d.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/portal/deliverables/${d.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
