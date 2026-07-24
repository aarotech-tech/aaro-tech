import * as DirectoryRepo from "./repositories";
import type { InsertContact } from "./repositories";

/**
 * Service for fetching the current organization's details.
 * Enforces that only the provided clerkOrgId is used.
 */
export async function getCurrentOrganization(clerkOrgId: string) {
  const org = await DirectoryRepo.getOrganizationById(clerkOrgId);
  if (!org) {
    throw new Error("Organization not found.");
  }
  return org;
}

/**
 * Service for creating a contact within the current organization.
 */
export async function addContactToOrganization(clerkOrgId: string, data: Omit<InsertContact, "id" | "organizationId" | "createdAt" | "deletedAt">) {
  // Add any business logic here (e.g., checking if contact limit reached, sending welcome email, etc.)
  
  return DirectoryRepo.createContact(clerkOrgId, data);
}

/**
 * Service for fetching all contacts in the organization.
 */
export async function getOrganizationContacts(clerkOrgId: string) {
  return DirectoryRepo.getContactsByOrg(clerkOrgId);
}

export async function createOrganizationService(name: string, slug: string) {
  const { clerkClient } = require("@clerk/nextjs/server");
  const { db } = require("@/db");
  const { organizations } = require("@/db/schema");
  const clerk = await clerkClient();

  // Create organization in Clerk
  const clerkOrg = await clerk.organizations.createOrganization({
    name,
    slug,
  });

  // Sync to database
  const [org] = await db.insert(organizations).values({
    clerkOrgId: clerkOrg.id,
    name: clerkOrg.name,
    slug: clerkOrg.slug || slug,
    type: "client",
    status: "prospect",
  }).returning();

  return org;
}

export async function inviteClientService(organizationId: string, email: string, role: string) {
  const { clerkClient } = require("@clerk/nextjs/server");
  const { db } = require("@/db");
  const { organizations } = require("@/db/schema");
  const { eq } = require("drizzle-orm");
  const clerk = await clerkClient();

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId)
  });

  if (!org) {
    throw new Error("Organization not found.");
  }

  // Use Clerk API to create organization invitation
  const invitation = await clerk.organizations.createOrganizationInvitation({
    organizationId: org.clerkOrgId,
    emailAddress: email,
    role: role || 'org:member',
  });

  return invitation;
}
