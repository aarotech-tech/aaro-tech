import { getDealDetails } from "@/modules/sales/services";
import Link from "next/link";
import { GenerateProposalButton } from "./_components/GenerateProposalButton";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStageLabel } from "@/lib/constants/pipeline";
import { Building2, Calendar, DollarSign, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditDealModal } from "./_components/EditDealModal";

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getDealDetails(resolvedParams.id);
  
  if (!data) {
    notFound();
  }

  const { deal, proposals } = data;
  const formattedValue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(deal.value / 100);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-5xl mx-auto w-full">
        <PageHeader 
          title={deal.name}
          description="Manage this deal's progression and generate proposals."
          breadcrumbs={[
            { label: "Aarotech", href: "/dashboard" },
            { label: "Sales", href: "/sales/leads" },
            { label: "Pipeline", href: "/sales/pipeline" },
            { label: deal.name }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deal Info Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Deal Details</CardTitle>
              <EditDealModal deal={deal as any} />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Value</span>
                <span className="font-semibold text-green-700">{formattedValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Client</span>
                <span className="font-medium text-gray-900">{deal.organizationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Owner</span>
                <span className="font-medium text-gray-900">{deal.ownerName || "Unassigned"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Close Date</span>
                <span className="font-medium text-gray-900">
                  {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "Not set"}
                </span>
              </div>
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-500 block mb-1">Current Stage</span>
                <Badge variant="outline" className="w-full justify-center py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
                  {getStageLabel(deal.stage || "discovery")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Proposals</CardTitle>
              <GenerateProposalButton dealId={deal.id} />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Documents generated for this deal.</CardDescription>
              {proposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50 text-gray-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No proposals have been generated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((proposal: any) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Proposal Document</p>
                          <p className="text-xs text-gray-500">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={
                          proposal.status === 'accepted' ? 'bg-green-50 text-green-700' :
                          proposal.status === 'sent' ? 'bg-blue-50 text-blue-700' :
                          proposal.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50'
                        }>
                          {proposal.status}
                        </Badge>
                        <Link 
                          href={`/sales/deals/${deal.id}/proposals/${proposal.id}`}
                          className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-8 px-3 rounded-md"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
