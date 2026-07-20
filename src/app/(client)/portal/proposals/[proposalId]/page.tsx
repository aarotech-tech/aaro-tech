"use server";
import { db } from "@/db";
import { proposals, deals, organizations, trackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PenToolIcon, CheckCircleIcon } from "lucide-react";
import { approveProposalAction } from "./actions";

export default async function ClientProposalViewPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const resolvedParams = await params;
  const proposalId = resolvedParams.proposalId;

  const proposalData = await db
    .select({
      id: proposals.id,
      status: proposals.status,
      documentData: proposals.documentData,
      dealName: deals.name,
      value: deals.value,
      organizationId: deals.organizationId,
      organizationName: organizations.name,
      approvedAt: proposals.approvedAt,
      signatureText: proposals.signatureText,
    })
    .from(proposals)
    .innerJoin(deals, eq(proposals.dealId, deals.id))
    .innerJoin(organizations, eq(deals.organizationId, organizations.id))
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (proposalData.length === 0) {
    notFound();
  }

  const proposal = proposalData[0];

  // PHASE 10: Spy Analytics - Log the view event silently
  try {
    await db.insert(trackingEvents).values({
      organizationId: proposal.organizationId,
      entityType: "proposal",
      entityId: proposal.id,
      eventType: "viewed",
    });
  } catch (error) {
    console.error("Failed to log tracking event", error);
  }

  const approveAction = approveProposalAction.bind(null, proposal.id);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">{proposal.dealName}</h1>
        <p className="text-gray-400 mt-2">Prepared by Aarotech for {proposal.organizationName}</p>
      </div>

      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
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
              
              <form action={async (fd) => {
                                await approveAction(fd);
              }} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type your full name to sign
                  </label>
                  <input 
                    type="text"
                    name="signature"
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 rounded-lg text-lg">
                  Approve Proposal
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  IP address and timestamp will be recorded for security.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
