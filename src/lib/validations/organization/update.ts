import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255).optional(),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens").optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["lead", "prospect", "client", "archived"]).optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
