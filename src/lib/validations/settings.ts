import { z } from "zod";

export const updateOrganizationSettingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  taxId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});
