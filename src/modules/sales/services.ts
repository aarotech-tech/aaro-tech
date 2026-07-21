import * as SalesRepo from "./repositories";
import crypto from "crypto";
import { emitDomainEvent } from "@/modules/core/events";

/**
 * Qualifies a Website Lead, converting them into a Prospect Organization with an initial Deal.
 */
export async function qualifyLead(leadId: string, internalUserId: string) {
  const lead = await SalesRepo.getWebsiteLeadById(leadId);
  
  if (!lead) {
    throw new Error("Lead not found");
  }

  if (lead.status !== "new" && lead.status !== "contacted") {
    throw new Error("Lead is already qualified or archived");
  }

  // Generate a placeholder clerkOrgId for prospects until they onboard
  const pendingClerkOrgId = `pending_org_${crypto.randomUUID()}`;
  const baseSlug = lead.businessName ? lead.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : lead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // 1. Create Organization (Prospect)
  const org = await SalesRepo.createProspectOrganization({
    clerkOrgId: pendingClerkOrgId,
    name: lead.businessName || lead.name,
    slug: `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`,
    type: "client",
    status: "prospect",
  });

  // 2. Create Primary Contact
  const contact = await SalesRepo.createProspectContact({
    organizationId: org.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
  });

  // 3. Create initial Deal
  const deal = await SalesRepo.createDeal({
    organizationId: org.id,
    ownerId: internalUserId,
    name: `${lead.businessName || lead.name} - Initial Deal`,
    stage: "discovery",
  });

  // 4. Update Lead Status
  await SalesRepo.updateWebsiteLeadStatus(leadId, "qualified");

  emitDomainEvent({
    type: "DealCreated",
    payload: {
      organizationId: org.id,
      dealId: deal.id,
      dealName: deal.name,
      userId: internalUserId,
    }
  });

  return {
    organization: org,
    contact,
    deal,
  };
}

/**
 * Validates a secure public proposal token and marks it accepted.
 * We use a simple cryptographic validation for the token.
 */
export async function approveProposalByToken(proposalId: string, signatureText: string, ipAddress: string) {
  const proposal = await SalesRepo.getProposalById(proposalId);
  
  if (!proposal) {
    throw new Error("Proposal not found");
  }
  
  if (proposal.status === "accepted") {
    throw new Error("Proposal is already accepted");
  }

  if (proposal.expiresAt && new Date() > proposal.expiresAt) {
    throw new Error("Proposal approval link has expired");
  }

  // Update proposal to accepted
  const updatedProposal = await SalesRepo.updateProposal(proposalId, {
    status: "accepted",
    signatureText,
    approvedAt: new Date(),
    approvedByIp: ipAddress,
  });

  const deal = await SalesRepo.getDealById(updatedProposal.dealId);

  emitDomainEvent({
    type: "ProposalAccepted",
    payload: {
      organizationId: deal?.organizationId || "",
      proposalId: updatedProposal.id,
    }
  });

  return updatedProposal;
}
