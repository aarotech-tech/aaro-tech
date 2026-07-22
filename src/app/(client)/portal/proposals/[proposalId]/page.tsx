import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PenToolIcon, CheckCircleIcon } from "lucide-react";
import { ApproveProposalForm } from "./_components/ApproveProposalForm";
import { PageHeader } from "@/components/ui/page-header";
import { getClientProposalView, logTrackingEventSilently } from "@/modules/sales/services";

export default async function ClientProposalViewPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const resolvedParams = await params;
  const proposalId = resolvedParams.proposalId;

  const proposalData = await getClientProposalView(proposalId);

  if (proposalData.length === 0) {
    notFound();
  }

  const proposal = proposalData[0];

  // PHASE 10: Spy Analytics - Log the view event silently
  await logTrackingEventSilently(proposal.organizationId, "proposal", proposal.id, "viewed");

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-4xl mx-auto w-full">
        <PageHeader 
          title={proposal.dealName}
          description={`Prepared by Aarotech for ${proposal.organizationName}`}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-200">
          <div 
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: proposal.documentData || "<p>No content available.</p>" }}
          />
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Total Investment</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${proposal.value?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        {/* Approvals Engine */}
        <div className="bg-gray-50 p-10">
          {proposal.status === "accepted" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-4 mt-0.5" />
              <div>
                <h3 className="text-green-800 font-semibold text-lg">Proposal Accepted</h3>
                <p className="text-green-700 mt-1">
                  Signed by <strong>{proposal.signatureText}</strong> on {proposal.approvedAt?.toLocaleDateString()}.
                </p>
                <p className="text-green-600 text-sm mt-2">We will be in touch shortly to kick off the project!</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <PenToolIcon className="w-5 h-5 mr-2 text-blue-600" />
                Sign & Approve
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                By signing below, you agree to the scope of work and investment summarized in this proposal.
              </p>
              
              <ApproveProposalForm proposalId={proposal.id} />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
