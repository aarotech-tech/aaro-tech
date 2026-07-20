import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuthenticatedUser, requireInternalUser, requireOrganizationMember } from '@/lib/auth';
import { db } from '@/db';
import { organizations, users, organizationMembers, proposals, deals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { approveProposalAction } from '@/app/(client)/portal/proposals/[proposalId]/actions';
import crypto from 'crypto';

// Mock Clerk
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(new Map([['x-forwarded-for', '127.0.0.1']])),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

const rand = () => crypto.randomBytes(4).toString('hex');

describe('Security Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication & Authorization', () => {
    it('Unauthenticated user cannot promote a lead (requireAuthenticatedUser throws)', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      mockCurrentUser.mockResolvedValue(null);
      await expect(requireAuthenticatedUser()).rejects.toThrow('NEXT_REDIRECT');
    }, 15000);

    it('Client cannot perform privileged CRM mutations (requireInternalUser throws)', async () => {
      const uId = rand();
      mockAuth.mockResolvedValue({ userId: `user_${uId}` });
      mockCurrentUser.mockResolvedValue({ id: `user_${uId}`, emailAddresses: [{ emailAddress: `client_${uId}@example.com` }] });

      const [testUser] = await db.insert(users).values({
        clerkId: `user_${uId}`,
        email: `client_${uId}@example.com`,
        userType: 'client'
      }).returning();

      await expect(requireInternalUser()).rejects.toThrow('Internal access required');

      await db.delete(users).where(eq(users.id, testUser.id));
    }, 15000);

    it('Organization A cannot access Organization B data (Tenant Isolation)', async () => {
      const uId = rand();
      const orgAId = rand();
      const orgBId = rand();
      
      const [orgA] = await db.insert(organizations).values({ name: 'Org A', clerkOrgId: orgAId, slug: orgAId }).returning();
      const [orgB] = await db.insert(organizations).values({ name: 'Org B', clerkOrgId: orgBId, slug: orgBId }).returning();
      
      const [testUser] = await db.insert(users).values({
        clerkId: `user_${uId}`, email: `userA_${uId}@example.com`, userType: 'client'
      }).returning();
      
      await db.insert(organizationMembers).values({
        userId: testUser.id, organizationId: orgA.id, role: 'member'
      });

      mockAuth.mockResolvedValue({ userId: `user_${uId}` });
      mockCurrentUser.mockResolvedValue({ id: `user_${uId}`, emailAddresses: [{ emailAddress: `userA_${uId}@example.com` }] });

      const accessA = await requireOrganizationMember(orgA.id);
      expect(accessA.user.id).toBe(testUser.id);

      await expect(requireOrganizationMember(orgB.id)).rejects.toThrow('You do not belong to this organization');

      await db.delete(organizationMembers).where(eq(organizationMembers.userId, testUser.id));
      await db.delete(users).where(eq(users.id, testUser.id));
      await db.delete(organizations).where(eq(organizations.id, orgA.id));
      await db.delete(organizations).where(eq(organizations.id, orgB.id));
    }, 15000);
  });

  describe('Proposal Approval Security', () => {
    it('Valid proposal approval succeeds', async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: 'Prop Org', clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: 'Prop Deal', stage: 'discovery' }).returning();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: 'draft',
        expiresAt: futureDate
      }).returning();

      const formData = new FormData();
      formData.append('signature', 'John Doe');

      const result = await approveProposalAction(proposal.id, formData);
      expect(result.success).toBe(true);

      const updatedProp = await db.query.proposals.findFirst({ where: eq(proposals.id, proposal.id) });
      expect(updatedProp?.status).toBe('accepted');
      expect(updatedProp?.signatureText).toBe('John Doe');

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    }, 15000);

    it('Already-approved proposal cannot be approved again', async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: 'Prop Org 2', clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: 'Prop Deal 2', stage: 'won' }).returning();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: 'accepted',
        expiresAt: futureDate
      }).returning();

      const formData = new FormData();
      formData.append('signature', 'John Doe Again');

      const result = await approveProposalAction(proposal.id, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already accepted');

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    }, 15000);

    it('Expired approval token fails', async () => {
      const oId = rand();
      const [org] = await db.insert(organizations).values({ name: 'Prop Org 3', clerkOrgId: oId, slug: oId }).returning();
      const [deal] = await db.insert(deals).values({ organizationId: org.id, name: 'Prop Deal 3', stage: 'discovery' }).returning();
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const [proposal] = await db.insert(proposals).values({
        dealId: deal.id,
        status: 'draft',
        expiresAt: pastDate
      }).returning();

      const formData = new FormData();
      formData.append('signature', 'John Doe Expired');

      const result = await approveProposalAction(proposal.id, formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');

      await db.delete(proposals).where(eq(proposals.id, proposal.id));
      await db.delete(deals).where(eq(deals.id, deal.id));
      await db.delete(organizations).where(eq(organizations.id, org.id));
    }, 15000);
  });
});
