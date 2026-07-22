import { z } from "zod";

export const addDealLineItemSchema = z.object({
  proposalId: z.string().uuid(),
  dealId: z.string().uuid(),
  serviceId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  isRecurring: z.boolean(),
});
