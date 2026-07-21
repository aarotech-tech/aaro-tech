import { eq } from "drizzle-orm";
import { db } from "@/db";
import { websiteLeads, organizations, contacts, deals, proposals } from "@/db/schema";
import type { InferInsertModel } from "drizzle-orm";

/**
 * Gets all website leads (Global access, no tenant filter).
 */
export async function getWebsiteLeads() {
  return db.select().from(websiteLeads);
}

/**
 * Gets a specific website lead.
 */
export async function getWebsiteLeadById(id: string) {
  const result = await db.select().from(websiteLeads).where(eq(websiteLeads.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Updates a website lead's status.
 */
export async function updateWebsiteLeadStatus(id: string, status: string) {
  const result = await db.update(websiteLeads)
    .set({ status, updatedAt: new Date() })
    .where(eq(websiteLeads.id, id))
    .returning();
  return result[0];
}

/**
 * Creates an organization (prospect).
 * Since they don't have a Clerk org yet, we expect a generated placeholder for clerkOrgId.
 */
export async function createProspectOrganization(data: InferInsertModel<typeof organizations>) {
  const result = await db.insert(organizations).values(data).returning();
  return result[0];
}

/**
 * Creates a primary contact for a prospect organization.
 */
export async function createProspectContact(data: InferInsertModel<typeof contacts>) {
  const result = await db.insert(contacts).values(data).returning();
  return result[0];
}

/**
 * Creates a deal linked to an organization.
 */
export async function createDeal(data: InferInsertModel<typeof deals>) {
  const result = await db.insert(deals).values(data).returning();
  return result[0];
}

/**
 * Gets all deals across all organizations.
 * ONLY FOR INTERNAL USE.
 */
export async function getAllDeals() {
  return db.select().from(deals);
}

/**
 * Gets deals specifically for one organization.
 */
export async function getDealsByOrganization(organizationId: string) {
  return db.select().from(deals).where(eq(deals.organizationId, organizationId));
}

/**
 * Gets a deal by ID.
 */
export async function getDealById(id: string) {
  const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Gets a proposal by ID.
 */
export async function getProposalById(id: string) {
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Updates a proposal.
 */
export async function updateProposal(id: string, data: Partial<InferInsertModel<typeof proposals>>) {
  const result = await db.update(proposals).set(data).where(eq(proposals.id, id)).returning();
  return result[0];
}
