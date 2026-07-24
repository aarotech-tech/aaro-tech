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
