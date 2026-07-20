"use server";
import { db } from "@/db";
import { trackingEvents, proposals, deals, organizations, services, dealLineItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateProposalWithAI } from "./actions";
import { EyeIcon, CheckCircleIcon } from "lucide-react";
import LineItemsEditor from "./_components/LineItemsEditor";

export default async function ProposalEditorPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const resolvedParams = await params;
  
  const proposalData = await db
    .select({
      id: proposals.id,
      dealId: deals.id,
      status: proposals.status,
      documentData: proposals.documentData,
      dealName: deals.name,
      organizationName: organizations.name,
      value: deals.value,
      approvedAt: proposals.approvedAt,
      signatureText: proposals.signatureText,
      approvedByIp: proposals.approvedByIp,
    })
    .from(proposals)
    .innerJoin(deals, eq(proposals.dealId, deals.id))
    .innerJoin(organizations, eq(deals.organizationId, organizations.id))
    .where(eq(proposals.id, resolvedParams.proposalId))
    .limit(1);

  if (proposalData.length === 0) {
    notFound();
  }

  const proposal = proposalData[0];

  // Fetch line items and services catalog
  const currentLineItems = await db.query.dealLineItems.findMany({
    where: eq(dealLineItems.dealId, proposal.dealId),
    orderBy: (items, { asc }) => [asc(items.createdAt)]
  });

  const allServices = await db.query.services.findMany({
    where: eq(services.isActive, true)
  });

  // Fetch Spy Analytics (views)
  const views = await db
    .select()
    .from(trackingEvents)
    .where(eq(trackingEvents.entityId, proposal.id))
    .orderBy(desc(trackingEvents.createdAt));

  // We bind the action so we can use it directly in the form
  const generateAction = generateProposalWithAI.bind(null, proposal.id, proposal.dealName, proposal.organizationName!);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-4">
        <Link href="/crm/proposals" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Proposals
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Proposal: {proposal.dealName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Prepared for {proposal.organizationName}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
            {proposal.status}
          </span>
          <form action={async () => {
                        await generateAction();
          }}>
            <Button type="submit" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm transition-colors">
              ✨ Auto-Generate with AI
            </Button>
          </form>
          <Button variant="outline" className="shadow-sm">
            Save Draft
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            Send to Client
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-8 overflow-y-auto">
        {/* For MVP, we'll just render the HTML data. In reality, this would be a TipTap or Slate.js editor */}
        <div 
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: proposal.documentData || "<p class='text-gray-400 italic'>No content generated yet. Add line items and click Auto-Generate.</p>" }}
        />
        
        {/* Deal Line Items Editor */}
        <LineItemsEditor 
          proposalId={proposal.id} 
          dealId={proposal.dealId} 
          services={allServices} 
          currentLineItems={currentLineItems} 
        />
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-right">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Deal Value</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            ${proposal.value?.toLocaleString() || 0}
          </p>
        </div>
      </div>
      
      {/* PHASE 10: Spy Analytics & Approvals Widget */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spy Analytics Panel */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-4 uppercase tracking-wider">
            <EyeIcon className="w-4 h-4 mr-2 text-indigo-500" />
            Client Activity Tracking
          </h3>
          {views.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No views recorded yet.</p>
          ) : (
            <div>
              <p className="text-sm text-gray-900 font-medium mb-3">
                Viewed {views.length} time{views.length === 1 ? "" : "s"}
              </p>
              <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                {views.map((view, i) => (
                  <div key={view.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{i === 0 ? "Latest view" : "Previous view"}</span>
                    <span className="font-medium text-gray-700">{view.createdAt?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approvals Panel */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-4 uppercase tracking-wider">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
            Approval Status
          </h3>
          {proposal.status === "accepted" ? (
            <div className="bg-green-50 rounded p-4 border border-green-100">
              <p className="text-sm text-green-800 font-medium mb-1">Approved & Signed</p>
              <p className="text-xs text-green-700 mb-1">By: {proposal.signatureText}</p>
              <p className="text-xs text-green-700 mb-1">IP: {proposal.approvedByIp}</p>
              <p className="text-xs text-green-700">Date: {proposal.approvedAt?.toLocaleString()}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded p-4 border border-gray-100 text-center h-full flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium">Pending Approval</p>
              <p className="text-xs text-gray-400 mt-1">Waiting for client signature...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
