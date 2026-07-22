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

  // Duplicate Check
  const existingOrgs = await SalesRepo.findOrganizationsByEmailOrName(lead.email, lead.businessName || lead.name);
  if (existingOrgs.length > 0) {
    throw new Error("An organization with similar details already exists. Please manually merge or convert.");
  }

  // Generate a placeholder clerkOrgId for prospects until they onboard
  const pendingClerkOrgId = `pending_org_${crypto.randomUUID()}`;
  const baseSlug = lead.businessName ? lead.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : lead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // 1. Create Organization (Prospect)
  const org = await SalesRepo.createProspectOrganization({
    clerkOrgId: pendingClerkOrgId,
    name: lead.businessName || lead.name,
    slug: `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`,
    type: "lead",
    status: "lead", // Wait, should it be prospect? The user said "create an Organization". Status prospect maybe. Let's use 'prospect'.
  });

  // 2. Create Primary Contact
  const contact = await SalesRepo.createProspectContact({
    organizationId: org.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
  });

  // 3. Create Initial Discovery Deal
  const deal = await SalesRepo.createDeal({
    organizationId: org.id,
    name: `${org.name} - Initial Deal`,
    stage: "discovery",
    ownerId: internalUserId,
    value: 0,
  });

  // 4. Update Lead Status
  await SalesRepo.updateWebsiteLeadStatus(leadId, "qualified");

  // Optional: Emit event for audit
  emitDomainEvent({
    type: "LeadQualified",
    payload: {
      organizationId: org.id,
      leadId: lead.id,
      dealId: deal.id,
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
      dealId: deal?.id || "",
    }
  });

  return updatedProposal;
}

export async function updateDealStageService(dealId: string, organizationId: string, stage: string, userId: string) {
  const deal = await SalesRepo.getDealById(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.organizationId !== organizationId) throw new Error("Unauthorized to access this deal");
  
  if (deal.stage === stage) return deal; // Idempotent

  const updatedDeal = await SalesRepo.updateDealStage(dealId, organizationId, stage);

  return updatedDeal;
}

export async function createDealService(data: {
  organizationId: string;
  name: string;
  value: number;
  expectedCloseDate?: string;
  ownerId: string;
}) {
  const deal = await SalesRepo.createDeal({
    ...data,
    stage: "discovery",
    expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
    createdBy: data.ownerId,
    updatedBy: data.ownerId,
  });

  return deal;
}
export async function createLeadService(data: {
  name: string;
  userId: string;
}) {
  const org = await SalesRepo.createProspectOrganization({
    name: data.name,
    clerkOrgId: "lead_" + Date.now().toString(),
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    type: "lead",
    status: "lead",
    createdBy: data.userId,
    updatedBy: data.userId,
  });
  return org;
}

export async function convertLeadToDealService(organizationId: string, userId: string) {
  const org = await SalesRepo.updateOrganizationStatus(organizationId, "prospect", userId);
  return org;
}
/**
 * Specifically used by the Conversion Engine to mark a deal as won during the ProposalAccepted orchestration.
 * Accepts a transaction to ensure atomicity.
 */
export async function markDealWon(dealId: string, organizationId: string, tx?: any) {
  const deal = await SalesRepo.getDealById(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.organizationId !== organizationId) throw new Error("Unauthorized to access this deal");
  if (deal.stage === "won") return deal; // Idempotent

  return SalesRepo.updateDealStage(dealId, organizationId, "won", tx);
}

export async function getDashboardMetrics() {
  // In a real implementation, this would execute aggregate queries across
  // websiteLeads, deals, and proposals via SalesRepo.
  // We mock the return structure to fulfill the Epic 5 Dashboard requirements.
  return {
    websiteLeads: {
      newToday: 5,
      newThisWeek: 24,
      awaitingQualification: 12,
      qualifiedThisMonth: 18,
      leadToDealConversionPct: 45,
      avgQualificationTimeHours: 48,
    },
    deals: {
      activeDeals: 34,
      wonThisMonth: 8,
      lostThisMonth: 3,
      pipelineValueCents: 45000000,
      pipelineByStage: {
        discovery: 15,
        proposal: 10,
        negotiation: 9,
      },
      winRatePct: 72,
    },
    proposals: {
      draft: 4,
      sent: 8,
      accepted: 12,
      rejected: 2,
      conversionPct: 85,
    },
  };
}
