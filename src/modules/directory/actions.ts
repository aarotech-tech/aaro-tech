"use server";

import { z } from "zod";
import { internalActionClient, tenantActionClient } from "@/lib/safe-action";
import * as DirectoryService from "./services";
import { revalidatePath } from "next/cache";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(50).optional(),
});

export const addContactAction = tenantActionClient
  .schema(contactSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.orgId is strictly guaranteed by the tenantActionClient wrapper
    // The frontend NEVER provides the organizationId directly.
    const newContact = await DirectoryService.addContactToOrganization(
      ctx.orgId,
      parsedInput
    );

    revalidatePath("/(admin)/directory/contacts", "page");
    
    return newContact;
  });

export const getContactsAction = tenantActionClient
  .action(async ({ ctx }) => {
    // Always use ctx.orgId
    const contacts = await DirectoryService.getOrganizationContacts(ctx.orgId);
    return contacts;
  });

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
});

export const createOrganizationAction = internalActionClient
  .schema(createOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const org = await DirectoryService.createOrganizationService(parsedInput.name, parsedInput.slug);
    revalidatePath("/(admin)/directory", "page");
    return org;
  });

const inviteClientSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email("Invalid email address"),
  role: z.string().default("org:member"),
});

export const inviteClientAction = internalActionClient
  .schema(inviteClientSchema)
  .action(async ({ parsedInput }) => {
    const invite = await DirectoryService.inviteClientService(parsedInput.organizationId, parsedInput.email, parsedInput.role);
    revalidatePath(`/(admin)/directory/${parsedInput.organizationId}`, "page");
    return { success: true, emailAddress: invite.emailAddress };
  });

const updateOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

export const updateOrganizationAction = internalActionClient
  .schema(updateOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const org = await DirectoryService.updateOrganizationService(parsedInput.organizationId, {
      name: parsedInput.name,
      type: parsedInput.type,
      status: parsedInput.status,
    });
    revalidatePath(`/(admin)/directory/${parsedInput.organizationId}`, "page");
    return org;
  });

const archiveOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export const archiveOrganizationAction = internalActionClient
  .schema(archiveOrganizationSchema)
  .action(async ({ parsedInput }) => {
    const org = await DirectoryService.archiveOrganizationService(parsedInput.organizationId);
    revalidatePath("/(admin)/directory", "page");
    return org;
  });

const searchOrganizationsSchema = z.object({
  query: z.string().default(""),
  type: z.string().optional(),
  status: z.string().optional(),
});

export const searchOrganizationsAction = internalActionClient
  .schema(searchOrganizationsSchema)
  .action(async ({ parsedInput }) => {
    return DirectoryService.searchOrganizationsService(parsedInput.query, {
      type: parsedInput.type,
      status: parsedInput.status,
    });
  });

const calculateHealthScoreSchema = z.object({
  organizationId: z.string().uuid(),
});

export const calculateHealthScoreAction = internalActionClient
  .schema(calculateHealthScoreSchema)
  .action(async ({ parsedInput }) => {
    const score = await DirectoryService.calculateOrganizationHealthScore(parsedInput.organizationId);
    revalidatePath(`/(admin)/directory/${parsedInput.organizationId}`, "page");
    return { score };
  });

const updateContactSchema = z.object({
  contactId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
});

export const updateContactAction = tenantActionClient
  .schema(updateContactSchema)
  .action(async ({ parsedInput }) => {
    const contact = await DirectoryService.updateContactService(parsedInput.contactId, {
      name: parsedInput.name,
      email: parsedInput.email,
      phone: parsedInput.phone,
    });
    revalidatePath("/(admin)/directory/contacts", "page");
    return contact;
  });

const archiveContactSchema = z.object({
  contactId: z.string().uuid(),
});

export const archiveContactAction = tenantActionClient
  .schema(archiveContactSchema)
  .action(async ({ parsedInput }) => {
    const contact = await DirectoryService.archiveContactService(parsedInput.contactId);
    revalidatePath("/(admin)/directory/contacts", "page");
    return contact;
  });

const searchContactsSchema = z.object({
  organizationId: z.string().uuid(),
  query: z.string().default(""),
});

export const searchContactsAction = tenantActionClient
  .schema(searchContactsSchema)
  .action(async ({ parsedInput }) => {
    return DirectoryService.searchContactsService(parsedInput.organizationId, parsedInput.query);
  });

const findDuplicateContactsSchema = z.object({
  organizationId: z.string().uuid(),
});

export const findDuplicateContactsAction = tenantActionClient
  .schema(findDuplicateContactsSchema)
  .action(async ({ parsedInput }) => {
    return DirectoryService.findDuplicateContactsService(parsedInput.organizationId);
  });

const mergeContactsSchema = z.object({
  primaryContactId: z.string().uuid(),
  secondaryContactId: z.string().uuid(),
});

export const mergeContactsAction = tenantActionClient
  .schema(mergeContactsSchema)
  .action(async ({ parsedInput }) => {
    const success = await DirectoryService.mergeContactsService(parsedInput.primaryContactId, parsedInput.secondaryContactId);
    revalidatePath("/(admin)/directory/contacts", "page");
    return success;
  });

const getContactActivityLogSchema = z.object({
  contactId: z.string().uuid(),
});

export const getContactActivityLogAction = tenantActionClient
  .schema(getContactActivityLogSchema)
  .action(async ({ parsedInput }) => {
    return DirectoryService.getContactActivityLogService(parsedInput.contactId);
  });
