import { getAdminProposalDetails } from "@/modules/sales/services";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ProposalEditorClient } from "./_components/ProposalEditorClient";

export default async function ProposalEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string, proposalId: string }> 
}) {
  const resolvedParams = await params;
  const data = await getAdminProposalDetails(resolvedParams.proposalId);
  
  if (!data) {
    notFound();
  }

  const { proposal, currentLineItems } = data;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-7xl mx-auto w-full">
        <PageHeader 
          title={`Proposal Document`}
          description="Build scope of work, generate proposal document, and send to client."
          breadcrumbs={[
            { label: "Aarotech", href: "/dashboard" },
            { label: "Sales", href: "/sales/pipeline" },
            { label: proposal.dealName, href: `/sales/deals/${resolvedParams.id}` },
            { label: "Proposal Editor" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-7xl mx-auto w-full">
        <ProposalEditorClient 
          proposal={proposal} 
          currentLineItems={currentLineItems}
          dealId={resolvedParams.id}
        />
      </div>
    </div>
  );
}
