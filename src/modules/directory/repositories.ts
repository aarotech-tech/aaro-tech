import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { organizations, users, contacts } from "@/db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertContact = InferInsertModel<typeof contacts>;

/**
 * Gets an organization by its internal UUID.
 * We require clerkOrgId to ensure the user is requesting data for their current tenant context.
 */
export async function getOrganizationById(clerkOrgId: string) {
  const result = await db.select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkOrgId))
    .limit(1);
    
  return result[0] || null;
}

/**
 * Gets a user by their Clerk ID.
 */
export async function getUserByClerkId(clerkId: string) {
  const result = await db.select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
    
  return result[0] || null;
}

/**
 * Gets the internal Organization UUID from a Clerk Org ID.
 * Throws if not found, as tenant consistency is critical.
 */
export async function getInternalOrgId(clerkOrgId: string) {
  const org = await getOrganizationById(clerkOrgId);
  if (!org) {
    throw new Error("Organization not found in database for the given tenant context.");
  }
  return org.id;
}

/**
 * Creates a contact strictly bound to an organization.
 */
export async function createContact(clerkOrgId: string, data: Omit<InsertContact, "id" | "organizationId" | "createdAt" | "deletedAt">) {
  const orgId = await getInternalOrgId(clerkOrgId);

  const result = await db.insert(contacts).values({
    ...data,
    organizationId: orgId,
  }).returning();

  return result[0];
}

/**
 * Fetches all contacts for the current organization.
 * MUST include clerkOrgId to enforce tenant isolation.
 */
export async function getContactsByOrg(clerkOrgId: string) {
  const orgId = await getInternalOrgId(clerkOrgId);

  return db.select()
    .from(contacts)
    .where(eq(contacts.organizationId, orgId));
}
