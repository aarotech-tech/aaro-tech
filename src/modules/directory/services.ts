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
