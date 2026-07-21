import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { users, websiteLeads, organizations, deals, proposals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { qualifyLeadAction, publicApproveProposalAction } from "@/modules/sales/actions";
import crypto from "crypto";

const rand = () => crypto.randomBytes(4).toString("hex");

// Mock Clerk
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Sales & CRM - Milestone 2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Internal Action Client (CRM)", () => {
    it("Client user access is denied for internal CRM actions", async () => {
      const uId = rand();
      
      const [testUser] = await db.insert(users).values({
        clerkId: `client_${uId}`, email: `client_${uId}@example.com`, userType: "client"
      }).returning();

      mockAuth.mockResolvedValue({ userId: `client_${uId}` });
      mockCurrentUser.mockResolvedValue({ id: `client_${uId}`, emailAddresses: [{ emailAddress: `client_${uId}@example.com` }] });

      const result = await qualifyLeadAction({ leadId: crypto.randomUUID() });
      
      expect(result?.serverError).toContain("Internal access required");

      await db.delete(users).where(eq(users.id, testUser.id));
    });

    it("Internal user access succeeds and qualifies a lead", async () => {
      const uId = rand();
      
      const [internalUser] = await db.insert(users).values({
        clerkId: `staff_${uId}`, email: `staff_${uId}@aarotech.in`, userType: "internal"
      }).returning();

      const [lead] = await db.insert(websiteLeads).values({
        name: "Acme Corp", email: `acme_${uId}@example.com`, status: "new"
      }).returning();

      mockAuth.mockResolvedValue({ userId: `staff_${uId}` });
      mockCurrentUser.mockResolvedValue({ id: `staff_${uId}`, emailAddresses: [{ emailAddress: `staff_${uId}@aarotech.in` }] });

      const result = await qualifyLeadAction({ leadId: lead.id });
      
      expect(result?.serverError).toBeUndefined();
      expect(result?.data).toBeDefined();
      expect(result?.data?.organization.status).toBe("prospect");
      expect(result?.data?.organization.clerkOrgId).toContain("pending_org_");
      expect(result?.data?.deal.stage).toBe("discovery");

      // Verify DB updates
      const updatedLead = await db.query.websiteLeads.findFirst({ where: eq(websiteLeads.id, lead.id) });
      expect(updatedLead?.status).toBe("qualified");

      // Cleanup
      await db.delete(deals).where(eq(deals.id, result.data!.deal.id));
      await db.delete(organizations).where(eq(organizations.id, result.data!.organization.id));
      await db.delete(websiteLeads).where(eq(websiteLeads.id, lead.id));
      await db.delete(users).where(eq(users.id, internalUser.id));
    });
  });

  describe("Public Proposal Approval", () => {
    it("Public proposal token validation succeeds", async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: "Prop Org", clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: "Prop Deal", stage: "discovery" }).returning();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: "draft",
        expiresAt: futureDate
      }).returning();

      // No auth required for public action
      mockAuth.mockResolvedValue({ userId: null, orgId: null });

      const result = await publicApproveProposalAction({
        proposalId: proposal.id,
        signatureText: "Jane Doe Signature",
        ipAddress: "192.168.1.1"
      });

      expect(result?.serverError).toBeUndefined();
      expect(result?.data?.status).toBe("accepted");
      expect(result?.data?.signatureText).toBe("Jane Doe Signature");
      expect(result?.data?.approvedByIp).toBe("192.168.1.1");

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    });

    it("Expired token rejection", async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: "Prop Org 2", clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: "Prop Deal 2", stage: "discovery" }).returning();
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: "draft",
        expiresAt: pastDate
      }).returning();

      const result = await publicApproveProposalAction({
        proposalId: proposal.id,
        signatureText: "Jane Doe Expired",
      });

      expect(result?.serverError).toContain("expired");

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    });

    it("Single-use token enforcement", async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: "Prop Org 3", clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: "Prop Deal 3", stage: "discovery" }).returning();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: "accepted", // Already accepted
        expiresAt: futureDate
      }).returning();

      const result = await publicApproveProposalAction({
        proposalId: proposal.id,
        signatureText: "Jane Doe Double",
      });

      expect(result?.serverError).toContain("already accepted");

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    });
  });
});
