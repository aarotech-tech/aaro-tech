import { getClientProposalView } from "@/modules/sales/services";
import crypto from "crypto";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProposalSignatureClient } from "./_components/ProposalSignatureClient";

export default async function PublicProposalPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ proposalId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const sig = resolvedSearchParams.sig as string;
  const expires = resolvedSearchParams.expires as string;
  const proposalData = await getClientProposalView(resolvedParams.proposalId);
  
  if (!proposalData || proposalData.length === 0) {
    notFound();
  }

  const proposal = proposalData[0];

  // Enforce signed tokens for proposals created after Day 4 rollout (July 24, 2026)
  const cutoffDate = new Date("2026-07-24T00:00:00Z");
  if (proposal.createdAt && new Date(proposal.createdAt) > cutoffDate) {
    if (!sig || !expires) {
      notFound();
    }
    
    if (Date.now() > parseInt(expires, 10)) {
      notFound(); // Link expired
    }


    const secret = process.env.PROPOSAL_SECRET || process.env.JWT_SECRET || "default_insecure_secret_for_dev";
    const expectedSig = crypto.createHmac("sha256", secret).update(`${proposal.id}:${expires}`).digest("hex");
    
    if (sig !== expectedSig) {
      notFound(); // Invalid signature
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Aarotech<span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Proposal for {proposal.organizationName}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              proposal.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
              proposal.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              proposal.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-gray-50'
            }>
              {proposal.status === 'sent' ? 'Awaiting Signature' : proposal.status}
            </Badge>
          </div>
        </div>

        {/* Document Viewer */}
        <Card className="mb-8 shadow-md">
          <CardContent className="p-0 overflow-hidden">
            {!proposal.documentData ? (
              <div className="p-12 text-center text-gray-500">
                This proposal document is currently being prepared.
              </div>
            ) : (
              <div 
                className="p-8 sm:p-12 bg-white min-h-[600px] prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: proposal.documentData }}
              />
            )}
          </CardContent>
        </Card>

        {/* Signature Area */}
        {proposal.status === 'sent' && (
          <ProposalSignatureClient 
            proposalId={proposal.id} 
            organizationName={proposal.organizationName} 
            sig={sig}
            expires={expires}
          />
        )}

        {proposal.status === 'accepted' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Proposal Accepted 🎉</h3>
              <p className="text-sm text-green-800 mb-4">
                Thank you for choosing Aarotech! Your project is now active. We will be in touch shortly with next steps and onboarding information.
              </p>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Signed by:</strong> {proposal.signatureText}</p>
                <p><strong>Date:</strong> {proposal.approvedAt ? new Date(proposal.approvedAt).toLocaleString() : ''}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
