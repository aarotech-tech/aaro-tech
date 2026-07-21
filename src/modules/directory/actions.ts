"use server";

import { z } from "zod";
import { tenantActionClient } from "@/lib/safe-action";
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

    revalidatePath("/directory/contacts");
    
    return newContact;
  });

export const getContactsAction = tenantActionClient
  .action(async ({ ctx }) => {
    // Always use ctx.orgId
    const contacts = await DirectoryService.getOrganizationContacts(ctx.orgId);
    return contacts;
  });
