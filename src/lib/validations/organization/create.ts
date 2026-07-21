import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  type: z.enum(["internal", "client", "lead"]).default("lead"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
