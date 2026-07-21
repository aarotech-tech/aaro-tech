import { z } from "zod";
import { DEAL_STAGES } from "../constants/pipeline";

export const createLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  challenge: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const createDealSchema = z.object({
  organizationId: z.string().uuid("Invalid Organization ID"), // This is the lead/client organization
  name: z.string().min(2, "Deal name must be at least 2 characters"),
  value: z.number().min(0).default(0), // Deal value in cents or dollars based on frontend format, we'll store as integer
  expectedCloseDate: z.string().datetime().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealStageSchema = z.object({
  dealId: z.string().uuid("Invalid Deal ID"),
  stage: z.string().refine((val) => DEAL_STAGES.some((s) => s.id === val), {
    message: "Invalid deal stage",
  }),
});

export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
