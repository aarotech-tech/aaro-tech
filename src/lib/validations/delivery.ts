import { z } from "zod";
import { TASK_STATUSES, DELIVERABLE_STATUSES } from "../constants/delivery";

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid("Invalid Task ID"),
  status: z.string().refine((val) => TASK_STATUSES.some((s) => s.id === val), {
    message: "Invalid task status",
  }),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const createDeliverableSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  fileUrl: z.string().url("Must be a valid URL").optional(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;

export const updateDeliverableStatusSchema = z.object({
  deliverableId: z.string().uuid("Invalid Deliverable ID"),
  status: z.string().refine((val) => DELIVERABLE_STATUSES.some((s) => s.id === val), {
    message: "Invalid deliverable status",
  }),
});

export type UpdateDeliverableStatusInput = z.infer<typeof updateDeliverableStatusSchema>;
