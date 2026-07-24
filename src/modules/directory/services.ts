import * as DirectoryRepo from "./repositories";
import type { InsertContact } from "./repositories";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizations, contacts, activityLogs } from "@/db/schema";
import { eq, ilike, and, or, count, isNull, desc } from "drizzle-orm";

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

export async function updateOrganizationService(organizationId: string, data: { name?: string, type?: string, status?: string }) {

  const [org] = await db.update(organizations).set({
    ...data,
    updatedAt: new Date()
  }).where(eq(organizations.id, organizationId)).returning();

  if (org && data.name) {
    const clerk = await clerkClient();
    await clerk.organizations.updateOrganization(org.clerkOrgId, { name: data.name });
  }

  return org;
}

export async function archiveOrganizationService(organizationId: string) {

  const [org] = await db.update(organizations).set({
    status: 'archived',
    deletedAt: new Date(),
    updatedAt: new Date()
  }).where(eq(organizations.id, organizationId)).returning();

  return org;
}

export async function searchOrganizationsService(query: string, filters: { type?: string, status?: string } = {}) {

  const conditions = [];
  if (query) {
    conditions.push(or(
      ilike(organizations.name, `%${query}%`),
      ilike(organizations.slug, `%${query}%`)
    ));
  }
  if (filters.type) {
    conditions.push(eq(organizations.type, filters.type));
  }
  if (filters.status) {
    conditions.push(eq(organizations.status, filters.status));
  }

  return db.query.organizations.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined
  });
}

export async function calculateOrganizationHealthScore(organizationId: string) {

  let score = 100;
  
  // Rule 1: Subtract 20 points if no contacts exist
  const contactCount = await db.select({ value: count(contacts.id) })
    .from(contacts)
    .where(eq(contacts.organizationId, organizationId));
  
  if (contactCount[0].value === 0) {
    score -= 20;
  }

  // Rule 2: Subtract 10 points if no recent activity
  const recentActivityCount = await db.select({ value: count(activityLogs.id) })
    .from(activityLogs)
    .where(eq(activityLogs.organizationId, organizationId));
    
  if (recentActivityCount[0].value === 0) {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  await db.update(organizations).set({ healthScore: score }).where(eq(organizations.id, organizationId));

  return score;
}

export async function updateContactService(contactId: string, data: { name?: string, email?: string, phone?: string }) {

  const [contact] = await db.update(contacts).set({
    ...data,
  }).where(eq(contacts.id, contactId)).returning();

  return contact;
}

export async function archiveContactService(contactId: string) {

  const [contact] = await db.update(contacts).set({
    deletedAt: new Date(),
  }).where(eq(contacts.id, contactId)).returning();

  return contact;
}

export async function searchContactsService(organizationId: string, query: string) {

  const conditions = [
    eq(contacts.organizationId, organizationId),
    isNull(contacts.deletedAt)
  ];

  if (query) {
    const searchCond = or(
      ilike(contacts.name, `%${query}%`),
      ilike(contacts.email, `%${query}%`),
      ilike(contacts.phone, `%${query}%`)
    );
    if (searchCond) {
      conditions.push(searchCond);
    }
  }

  return db.query.contacts.findMany({
    where: and(...conditions)
  });
}

export async function findDuplicateContactsService(organizationId: string) {

  const allContacts = await db.query.contacts.findMany({
    where: and(eq(contacts.organizationId, organizationId), isNull(contacts.deletedAt))
  });

  const duplicates: any[] = [];
  const seenEmails = new Set();
  const seenNames = new Set();

  for (const c of allContacts) {
    if (seenEmails.has(c.email) || seenNames.has(c.name.toLowerCase())) {
      duplicates.push(c);
    }
    seenEmails.add(c.email);
    seenNames.add(c.name.toLowerCase());
  }

  return duplicates;
}

export async function mergeContactsService(primaryContactId: string, secondaryContactId: string) {

  // Re-assign activity logs from secondary to primary
  await db.update(activityLogs)
    .set({ metadata: JSON.stringify({ mergedFrom: secondaryContactId }) }) // simplified mapping
    .where(eq(activityLogs.entityId, secondaryContactId));

  // Archive secondary
  await archiveContactService(secondaryContactId);
  return true;
}

export async function getContactActivityLogService(contactId: string) {

  return db.query.activityLogs.findMany({
    where: eq(activityLogs.entityId, contactId),
    orderBy: [desc(activityLogs.createdAt)]
  });
}
